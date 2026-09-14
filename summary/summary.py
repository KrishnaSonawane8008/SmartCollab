import httpx
import re
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette import EventSourceResponse
from pydantic import BaseModel
from utilities.colour_print import Print
import asyncio
import uuid

@asynccontextmanager
async def lifespan(app):
    await check_ollama_status()
    yield


app = FastAPI(lifespan=lifespan)

# Configuration
OLLAMA_URL = "http://localhost:11434/"
# This MUST match your 'ollama list' exactly
MODEL_NAME = "llama3.1:8b-instruct-q4_K_M" 

NOISE_PATTERNS = [
    r"\(speaks in foreign language\)",
    r"\(.*?\)",
]

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummarySession:
    def __init__(self):
        self.task:asyncio.Task=None
        self.summary_id=None
        self.generated=[]
        self.subscribers:dict[str, asyncio.Queue]={}
        self.started=False
        self.ended=False

class TranscriptRequest(BaseModel):
    data: dict
    summary_id: str
    user_id:str

class SummaryStreamRequest(BaseModel):
    summary_id:str
    user_id:str

async def check_ollama_status():
    async with httpx.AsyncClient() as client:
        try:
            Print.yellow("Checking ollama status...")
            resp = await client.get(OLLAMA_URL)
            resp.raise_for_status()

            Print.green(f"Ollama response: {resp.text}")

        except Exception as e:
            Print.red(f"Ollama Connection Error: {e}")
        

def clean_text(text: str) -> str:
    for pattern in NOISE_PATTERNS:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)
    return text.strip()

def is_useless(text: str) -> bool:
    words = text.split()
    return len(words) <= 1

def extract_messages(data: dict) -> list:
    messages = []
    for segment in data.get("segments", []):
        cleaned = clean_text(segment.get("text", ""))
        if not cleaned or is_useless(cleaned):
            continue
        messages.append({
            "user": segment.get("userId", "unknown"),
            "message": cleaned
        })
    return messages

def format_conversation(messages: list) -> str:
    return "\n".join(f"[user{m['user']}] {m['message']}" for m in messages)

MAIN_BACKEND_URL_BASE="http://localhost:8000/summary/"

async def store_summary(summary_id:str, summary: str):
    payload = {
        "generated_summary": summary,
    }
    delays = [1, 2, 4, 8, 16]   # 5 attempts

    async with httpx.AsyncClient(timeout=15) as client:
        for attempt, delay in enumerate(delays, start=1):
            try:
                resp = await client.post(
                    f"{MAIN_BACKEND_URL_BASE}{summary_id}/store/summary",
                    json=payload
                )
                resp.raise_for_status()

                Print.green(f"Stored summary {summary_id}")

                GENERATED_SUMMARIES.pop(summary_id, None)
                return True

            except Exception as e:
                Print.yellow(
                    f"Store summary attempt {attempt} failed: {e}"
                )

                if attempt != len(delays):
                    await asyncio.sleep(delay)

    Print.red(
        f"Failed to store summary {summary_id} after {len(delays)} attempts."
    )

    GENERATED_SUMMARIES.pop(summary_id, None)
    return False


async def generate_summary(data: dict, session:SummarySession):
    messages = extract_messages(data)
    Print.yellow("Extracting Messages...")
    if not messages:
        raise Exception("Not enough content to generate a summary.")

    conversation = format_conversation(messages)
    Print.yellow("Conversation Formatted...")
    # Use the Chat API for Llama-3.1 Instruct
    convo_word_count=len(conversation.split())//3
    payload = {
        "model": MODEL_NAME, 
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a professional meeting assistant. Summarize the transcript into paragraphs, more than 1 paragraph if the transcript is long . "
                    "Always use English for the summary, even if the transcript contains Hindi or Marathi. "
                    "Use exact User IDs like [user1] and [user2]. Focus only ncluding exon facts provided in the text."
                    f"Keep the summary very brief, the summary should not be very long, if you absolutely must extent the summary, then let it AT MOST be {convo_word_count} words and no more than that."
                    "DO NOT start with any greeting or, with something like 'Here's the summary...', start the summary right away."
                    "DO NOT add anything extra to the summary, do not assume any extra context about the conversation, the only data you are basing your summary on is the data provided to you and nothing more, so dont add anything that you think might provide better context to the summary except the things present in the conversation, just keep the summary to the point."
                )
            },
            {
                "role": "user",
                "content": f"Summarize this conversation:\n\n{conversation}"
            }
        ],
        "stream": True,
        "options": {
            "temperature": 0.1,  # Low temperature ensures factual accuracy
            "num_thread": 2 
        }
    }

    try:
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                f"{OLLAMA_URL}api/chat",
                json=payload,
            ) as response:
                
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if not line:
                        continue

                    chunk = json.loads(line)

                    if chunk.get("done"):
                        for stream_id, queue in session.subscribers.items():
                            queue.put_nowait(
                                    {
                                        "event": "done",
                                        "data": "done"
                                    }
                                )
                        session.ended = True
                        GENERATED_SUMMARIES[session.summary_id]="".join(session.generated)
                        SESSIONS.pop(session.summary_id, None)
                        asyncio.create_task(
                            store_summary(session.summary_id, GENERATED_SUMMARIES[session.summary_id])
                        )
                        return

                    token = chunk.get("message", {}).get("content")

                    if token:
                        session.generated.append(f"{token}")
                        for queue in list(session.subscribers.values()):
                            queue.put_nowait(
                                    {
                                        "event": "token",
                                        "data": f"{token}"
                                    }
                                )
    except Exception as e:
        print(e)
        for queue in session.subscribers.values():
            queue.put_nowait({
                "event":"error",
                "data":f"{e}"
            })
        session.ended = True
        SESSIONS.pop(session.summary_id, None)
        raise
        # try:
        #     Print.magenta("Sent summary generation request to ollama server...")
        #     resp = await client.post(OLLAMA_URL, json=payload)
        #     resp.raise_for_status()
        #     result = resp.json()

        #     Print.green("Summary Generated!")
        #     # Extract content from the chat message structure
        #     return result.get("message", {}).get("content", "").strip()
        # except httpx.HTTPStatusError as e:
        #     raise Exception(f"Ollama Error: {e.response.status_code} - Make sure model '{MODEL_NAME}' is loaded.")
        # except Exception as e:
        #     raise Exception(f"Connection Error: {str(e)}")

SESSIONS: dict[str, SummarySession]={}
GENERATED_SUMMARIES: dict[str, str]={}

@app.post("/initialize_summay")
async def initilaize_Summary(request: TranscriptRequest):
    try:
        # Switching to SummarySession class instances for each summary
        pre_generated=GENERATED_SUMMARIES.get(request.summary_id)
        if(pre_generated):
            return { "generated_summary": pre_generated }

        session=SESSIONS.get(request.summary_id)
        if(session is None):
            session=SummarySession()

            session.summary_id=request.summary_id
            session.started=True

            stream_access_id=f"{request.summary_id}_{request.user_id}_{uuid.uuid4()}"
            queue=asyncio.Queue()
            session.subscribers[stream_access_id]=queue

            SESSIONS[request.summary_id] = session
            session.task=asyncio.create_task(generate_summary(data=request.data, session=session))
        else:
            stream_access_id=f"{request.summary_id}_{request.user_id}"
            keys = [key for key, val in session.subscribers.items() if stream_access_id in key]
            for key in keys:
                old_queue=session.subscribers.get(key)
                if(old_queue):
                    old_queue.put_nowait(
                                    {
                                        "event": "done",
                                        "data": "done"
                                    }
                                )
                    
            stream_access_id+=f"_{uuid.uuid4()}"
            queue=asyncio.Queue()
            session.subscribers[stream_access_id]=queue


        return { "stream_id": stream_access_id }
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/summary_stream/{summary_id}/{stream_access_id}")
async def stream_summary( summary_id:str, stream_access_id:str, request: Request):

    try:
        session=SESSIONS.get(summary_id)
        if(session is None):
            Print.red(f"ERROR: Summary session not found")
            raise HTTPException(404, "Summary session not found")
        queue=session.subscribers.get(stream_access_id)
        if(queue is None):
            Print.red(f"ERROR: Stream not found")
            raise HTTPException(404, "Stream not found")
        
        async def stream():
            try:
                pre_generated=GENERATED_SUMMARIES.get(summary_id)
                if(pre_generated is not None):
                    yield{
                        "event": "generated",
                        "data": pre_generated
                    }
                    yield {
                        "event": "done",
                        "data": "done"
                    }
                    return
                
                yield {
                    "event": "generated",
                    "data": "".join(session.generated)
                }
                while True:

                    if await request.is_disconnected():
                        break
                    
                    try:
                        event = await asyncio.wait_for(queue.get(), timeout=1)

                        if(event["event"]=="done"):
                            yield {
                                "event": "done",
                                "data": event["data"]
                            }
                            break

                        if(event["event"]=="error"):
                            yield {
                                "event": "error",
                                "data": event["data"]
                            }
                            break

                        yield {
                            "event": "token",
                            "data": event["data"]
                        }
                    except asyncio.TimeoutError:
                        if await request.is_disconnected():
                            break
                        continue
            finally:
                session.subscribers.pop(stream_access_id, None)

        return EventSourceResponse(stream())
    except HTTPException:
        raise
    except Exception as e:
        Print.red(f"ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
            
    
    



@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    # Start the server on port 8001
    uvicorn.run("summary:app", host="0.0.0.0", port=8001, reload=True)

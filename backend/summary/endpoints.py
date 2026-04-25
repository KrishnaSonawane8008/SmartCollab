import httpx
import json
import os
from fastapi import APIRouter, HTTPException, Depends
from auth.dependencies import token_verification
from utilities.db_utilities import parse_access_token
from utilities.colour_print import Print

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TRANSCRIPTS_PATH = os.path.join(BASE_DIR, "transcriber", "storage", "transcripts")
SUMMARIES_PATH=os.path.join(BASE_DIR, "backend", "summary", "Genarated_Summaries")
LLM_SERVICE_URL = "http://localhost:8001/summarize"

@router.post("/{room_id}/{call_log_id}")
async def get_room_summary(room_id: str, call_log_id:str):
    # user_id=parse_access_token(access_token=access_token)
    summary_file_path=os.path.join(SUMMARIES_PATH, f"{room_id}_{call_log_id}_summary.json")

    try:
        with open(summary_file_path, "r") as file:
            return json.load(file)
    except json.JSONDecodeError:
        Print.red("JSON decoding failed, generating summary instead...")
    except FileNotFoundError:
        Print.yellow("Summary doesnt exist, generating one...")

    file_path = os.path.join(TRANSCRIPTS_PATH, f"{room_id}_{call_log_id}_transcript.json")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Transcript for room {room_id} not found")

    # read json
    with open(file_path, "r") as f:
        transcript_data = json.load(f)
        transcript_data["created_at"]=call_log_id

    # call llm service
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(LLM_SERVICE_URL, json={"data": transcript_data})

    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail="LLM service failed")

    summary_data=resp.json()


    try:
        if(len(summary_data["summary"])>0):
            with open(summary_file_path, 'w', encoding='utf-8') as f:
                json.dump(summary_data, f, indent=4)
    except Exception as e:
        Print.red(f"Summary JSON creation failed: {e}")

    return summary_data


@router.get("/{communityId}/{channelId}/call_logs")
def get_call_logs(communityId:int, channelId:int, access_token: str=Depends(token_verification)):
    
    # 1. Get names of all entries (files + folders)
    all_entries = os.listdir(TRANSCRIPTS_PATH)
    
    # 2. Filter to get ONLY files
    file_names = []
    current_roomId=f"{communityId}{channelId}"
    for entry in all_entries:
        roomId=entry.partition("_")[0]
        epoch_time=entry.partition("_")[2].partition("_")[0]
        if roomId==current_roomId:
            file_names.append(epoch_time)

    file_names.sort()
    return {
        "logs": file_names
    }
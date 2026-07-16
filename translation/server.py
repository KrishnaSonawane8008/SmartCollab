from fastapi import FastAPI, HTTPException, status
from models import TranslationRequest, TranslationResponse, BatchTranslationRequest, BatchTranslationResponse
from translation_service import translate, batch_translate, is_language_dominant

app = FastAPI()


LANGUAGE_CODES = {
    "en": "eng_Latn",
    "as": "asm_Beng",
    "bn": "ben_Beng",
    "bd": "brx_Deva",
    "doi": "doi_Deva",
    "gu": "guj_Gujr",
    "hi": "hin_Deva",
    "kn": "kan_Knda",
    "ka": "kas_Arab",
    "gom": "gom_Deva",
    "mai": "mai_Deva",
    "ml": "mal_Mlym",
    "mni-Mtei": "mni_Beng",
    "mr": "mar_Deva",
    "ne": "npi_Deva",
    "or": "ory_Orya",
    "pu": "pan_Guru",
    "sa": "san_Deva",
    "sat-Olck": "sat_Olck",
    "sd": "snd_Arab",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "ur": "urd_Arab"
}



@app.post("/translate", response_model=TranslationResponse)
def translate_endpoint(req: TranslationRequest):
    try:
        message=req.message
        source_lang=LANGUAGE_CODES.get(message.source_lang)
        target_lang=LANGUAGE_CODES.get(req.target)
        translation_response=TranslationResponse(
                                translated=translate(
                                    text=message.text,
                                    source=source_lang,
                                    target=target_lang
                                )
                            )
        print("Request: ", req, " ,translation: ", translation_response)
        return translation_response
    
    except Exception as e:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.post("/batchtranslate", response_model=BatchTranslationResponse)
def translate_endpoint(req: BatchTranslationRequest):
    try:
        translated_messages=batch_translate(req.messages, LANGUAGE_CODES[req.target])
        return BatchTranslationResponse(
            translated=translated_messages
        )
    except Exception as e:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get("/")
def root():
    return {"status": "running"}

if __name__ == "__main__":
    import uvicorn
    # Start the server on port 8001
    uvicorn.run("server:app", host="0.0.0.0", port=8002)
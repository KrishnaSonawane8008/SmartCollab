from pydantic import BaseModel

class Message(BaseModel):
    text:str
    source_lang:str

class TranslationRequest(BaseModel):
    message: Message 
    target: str


class TranslationResponse(BaseModel):
    translated: str

class BatchTranslationRequest(BaseModel):
    messages: list[Message]
    target: str

class BatchTranslationResponse(BaseModel):
    translated: list[str]
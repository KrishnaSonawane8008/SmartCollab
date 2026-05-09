from pydantic import BaseModel
from datetime import datetime
from typing import List

class user_credentials(BaseModel):
    username: str
    email: str
    password: str


class community_search(BaseModel):
    sub_str:str

class community_info_create(BaseModel):
    community_name: str

class community_info_join(BaseModel):
    community_id: int
    community_name: str

class community_info_leave(BaseModel):
    community_id: int
    community_name: str


class channel_search(BaseModel):
    sub_str:str

class channel_info_create(BaseModel):
    channel_name: str

class channel_info_join(BaseModel):
    channel_id: int
    channel_name: str

class channel_info_leave(BaseModel):
    channel_id: int
    channel_name: str

class user_search(BaseModel):
    user_name:str

class user_invite(BaseModel):
    user_id:int #userid of the user being invited
    user_name:str #username of the user being invited
    user_email:str #email of the user being invited


class call_info(BaseModel):
    community_id:int
    channel_id:int
    call_topic:str
    call_starter_id:int
    call_starter_name:str
    started_at:datetime
    ended_at:datetime
    call_participants:List[str]

class call_start_info(BaseModel):
    community_id:int
    channel_id:int
    call_topic:str
    call_starter_id:int
    call_starter_name:str
    started_at:datetime
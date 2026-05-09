from pydantic import BaseModel
from datetime import datetime
from typing import List

#base for each entry inside the Users table
class User(BaseModel):
    user_id:int
    user_name:str
    user_email:str
    user_password:str
    created_at:datetime



#base for each entry inside the Access_Tokens table
class Access_Token(BaseModel):
    user_id:int
    value:str
    expires_at:datetime



#base for each entry inside the Communities table
class Community(BaseModel):
    community_id:int
    community_name:str
    created_at:datetime



#base for each entry inside the Channels table
class Channel(BaseModel):
    channel_id:int
    community_id:int
    channel_name:str
    created_at:datetime


#base for each entry inside the Community_Members table
class Community_Member(BaseModel):
    user_id:int
    community_id:int
    user_name:str
    community_name:str
    joined_at:datetime
    roles:str


#base for each entry inside the Channel_Members table
class Channel_Member(BaseModel):
    user_id:int
    community_id:int
    channel_id:int
    user_name:str
    community_name:str
    channel_name:str
    joined_at:datetime
    roles:str


#base for each entry inside the Messages table
class MessageCreate(BaseModel):
    sender_id:int
    community_id:int
    channel_id:int
    message:str
    sent_at:datetime

class MessageRead(BaseModel):
    message_id:int
    sender_id:int
    community_id:int
    channel_id:int
    message:str
    sent_at:datetime



class CallLogCreate(BaseModel):
    community_id:int
    channel_id:int
    call_topic:str
    call_starter_id:int
    call_starter_name:str
    started_at:datetime
    ended_at:datetime
    call_participants:List[str]

class CallLogRead(BaseModel):
    call_id:int
    community_id:int
    channel_id:int
    call_topic:str
    call_starter_id:int
    call_starter_name:str
    started_at:datetime
    ended_at:datetime
    call_participants:List[str]



#base for each entry in redis for a notification of an channel invite
class Redis_Notification_ChannelInvite(BaseModel):
    type:str="ChannelInvite" #Should be "ChannelInvite"
    community_id:int #Community Id of the community that this user is being invited to
    community_name:str
    channel_id:int # Channeli Id of the channel that this user is being invited to
    channel_name:str
    inviter_id:int #userid of the user that sent the invite
    inviter_name:str
    inviter_email: str
    sent_at: datetime

class Redis_Notification_CommunityInvite(BaseModel):
    type:str="CommunityInvite" #Should be "CommunityInvite"
    community_id:int #Community Id of the community that this user is being invited to
    community_name:str
    inviter_id:int #userid of the user that sent the invite
    inviter_name:str
    inviter_email: str
    sent_at: datetime

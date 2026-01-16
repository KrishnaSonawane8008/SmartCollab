from pydantic import BaseModel
from datetime import datetime

#base class for each entry in Communities table
class Community(BaseModel):
    community_id: int
    community_name: str


#one Community_Users table per community
#base class for each entry in Com:community_id_CommunityUsers table
class Community_User(BaseModel):
    community_id: int
    user_id: int
    user_name: str

#one User_Communities table per user
#base class for each entry in User:user_id_Communities table
class User_Community(BaseModel):
    user_id: int
    community_id:int
    community_name: str


#one Channels tables per community
#base class for each entry in Com:community_id_Channel:channel_id table
class Channel(BaseModel):
    channel_id: int
    channel_name: str
    community_id: int


#one Channel_Users table per channel
#base class for each entry in Com:community_id_Channel:channel_id_ChannelUsers table
class Channel_User(BaseModel):
    channel_id: int
    community_id: int
    user_id: int
    user_name: str


#one Channel_Messages table per channel
#base class for each entry in Com:community_id_Channel:channel_id_ChannelMessages table
class Channel_Message(BaseModel):
    message_id: int
    channel_id: int
    sender_id: int#user_id of the user who sent the message
    message: str

#base class for each entry in Users table
class User(BaseModel):
    user_id: int
    user_name: str
    user_email: str
    user_password: str
    access_token: str
    expires_at: datetime


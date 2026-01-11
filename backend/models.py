from pydantic import BaseModel


#contains the list of all the communities
class Community(BaseModel):
    community_id: int
    community_name: str

#contains a list of all the users inside a community
#one Community_Users table per community
class Community_User(BaseModel):
    community_id: int
    user_id: int
    user_name: str

#contains a list of all channels inside a community
#one Channels tables per community
class Channel(BaseModel):
    channel_id: int
    channel_name: str
    community_id: int

#contains list of all the users inside a channel
#one Channel_Users table per channel
class Channel_User(BaseModel):
    channel_id: int
    community_id: int
    user_id: int
    user_name: str

#contains list of all the messages inside a channel
#one Channel_Messages table per channel
class Channel_Message(BaseModel):
    message_id: int
    channel_id: int
    sender_id: int#user_id of the user who sent the message
    message: str

#contains list of all the users
class User(BaseModel):
    user_id: int
    user_name: str
    user_email: str
    user_password: str


from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

#contains the list of all the communities
class Communties(Base):
    __tablename__ = 'Communities'

    community_id= Column(Integer, primary_key=True, index=True)
    community_name= Column(String)


#contains a list of all the users inside a community
#one Community_Users table per community
class Community_Users(Base):
    __tablename__ = 'Community_Users'

    user_id=Column(Integer, primary_key=True)
    community_id=Column(Integer, nullable=False)
    user_name=Column(String, nullable=False)


#contains a list of all channels inside a community
#one Channels tables per community
class Channels(Base):
    __tablename__ = 'Channels'

    channel_id= Column(Integer, primary_key=True, index=True)
    channel_name= Column(String, nullable=False)
    community_id= Column(Integer, nullable=False)#repeate data


#contains list of all the users inside a channel
#one Channel_Users table per channel
class Channel_Users(Base):
    __tablename__ = 'Channel_Users'

    user_id= Column(Integer, primary_key=True)
    channel_id= Column(Integer, nullable=False)#repeated data
    community_id=Column( Integer, nullable=False )
    user_name= Column(String, nullable=False)



#contains list of all the messages inside a channel
#one Channel_Messages table per channel
class Channel_Messages(Base):
    __tablename__ = 'Channel_Messages'

    message_id= Column(Integer, primary_key=True, index=True)
    channel_id= Column(Integer, nullable=False)
    sender_id= Column(Integer, nullable=False)
    message= Column(String, nullable=False)

#contains list of all the users
class Users(Base):
    __tablename__ = 'Users'
    
    user_id = Column(Integer, primary_key=True, index=True)
    user_name= Column(String)
    user_email= Column(String, unique=True)
    user_password= Column(String)



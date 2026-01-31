from sqlalchemy.orm import Session
from sqlalchemy import select, exists
from models import Message
from database_models import Messages
from utilities.colour_print import Print



def get_channel_messages(uid:int, comm_id:int, channel_id:int, session:Session)->list:
    query=select(Messages).where(
            Messages.community_id==comm_id,
            Messages.channel_id==channel_id
        )
    
    Print.magenta(f"getting messgaes for User{uid} from community {comm_id} & channel {channel_id}")

    channel_messages: list[Message]=session.execute(query).scalars().all()
    
    for msg in channel_messages:
        if msg.sender_id==uid:
          msg.__dict__.update({"sender_id":"user"})


    return channel_messages
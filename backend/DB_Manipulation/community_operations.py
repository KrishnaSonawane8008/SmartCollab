from sqlalchemy.orm import Session
from sqlalchemy import select, exists
from database_models import Channel_Members, Channels
from models import Channel
from utilities.colour_print import Print


def get_user_channels(uid:int, comm_id:int, session:Session)->list[Channel]:
    query=select(Channels).where(
        Channels.community_id==comm_id,
        exists().where(
            Channel_Members.channel_id==Channels.channel_id,
            Channel_Members.community_id==Channels.community_id,
            Channel_Members.user_id==uid
        )
    )
    Print.magenta(f"getting channels for User{uid} from community {comm_id}")

    user_comms: list[Channel]=session.execute(query).scalars().all()
    
    return user_comms
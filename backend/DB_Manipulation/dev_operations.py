from database_models import Users, CallLogs
from sqlalchemy.orm import Session
from sqlalchemy import select, delete



def get_all_users_credentials(session: Session)->Users | None:

    user_creds=session.execute(
                                select(Users)
                            ).scalars().all()


    return user_creds

def delete_call_log_from_db(community_id:int, channel_id:int, call_id:int, session: Session)->bool|None:
    query=delete(CallLogs).where(
        CallLogs.community_id==community_id, 
        CallLogs.channel_id==channel_id,
        CallLogs.call_id==call_id
        )
    
    session.execute(query)

    return True
from models import CallLogCreate
from database_models import CallLogs
from sqlalchemy import insert, select
from sqlalchemy.orm import Session


def create_call_log(call_log:CallLogCreate, session:Session):
    query=insert(CallLogs).values(**call_log.model_dump())
    session.execute(query)


def get_call_logs(community_id:int, channel_id:int, session:Session)->CallLogs:
    query=select(CallLogs).where(CallLogs.community_id==community_id, CallLogs.channel_id==channel_id)
    result=session.execute(query).scalars().all()

    return result





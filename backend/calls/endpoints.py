from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import insert, select
from RequestModels import call_info, call_start_info
from DB_Manipulation.dependencies import get_db
from DB_Manipulation.call_operations import get_call_logs
from auth.dependencies import token_verification
from utilities.db_utilities import parse_access_token
from auth.dependencies import sfu_key_verification
from models import CallLogCreate
from database_models import CallLogs
from utilities.colour_print import Print
import core
import json

router=APIRouter()


@router.post("/{communityId}/{channelId}/callended")
async def create_call_log(communityId:int, channelId:int, call_info:call_info, isAuthorized=Depends(sfu_key_verification), db:Session=Depends(get_db) ):
    
    await core.async_redis_api.redis_client.delete(f"videocall:{communityId}:{channelId}")

    call_log=CallLogCreate(
        community_id=call_info.community_id,
        channel_id=call_info.channel_id,
        call_topic=call_info.call_topic,
        call_starter_id=call_info.call_starter_id,
        call_starter_name=call_info.call_starter_name,
        started_at=call_info.started_at,
        ended_at=call_info.ended_at,
        call_participants=call_info.call_participants
    )

    call_ended_notiff={
                        "type":"VideoCall",
                        "status":"Ended",
                        "community_id":call_info.community_id,
                        "channel_id":call_info.channel_id,
                        "call_topic":call_info.call_topic,
                        "starter_id":call_info.call_starter_id,
                        "starter_name":call_info.call_starter_name,
                        "ended_at":call_info.ended_at.isoformat()
                    }

    await core.async_redis_api.redis_client.xadd("chat_broadcast", call_ended_notiff )

    query=insert(CallLogs).values(**call_log.model_dump()).returning(CallLogs.call_id)
    result=db.execute(query).scalar()

    db.commit()

    Print.yellow(f"call log recorded with call_id: {result}")

    return {"Success":True, "Call_ID":result}
    


@router.post("/{communityId}/{channelId}/callstarted")
async def call_started(communityId:int, channelId:int, call_info:call_start_info, isAuthorized: str = Depends(sfu_key_verification)):
    call_notiff = {
        "type":"VideoCall",
        "status":"Ongoing",
        "community_id":call_info.community_id,
        "channel_id":call_info.channel_id,
        "call_topic":call_info.call_topic,
        "starter_id":call_info.call_starter_id,
        "starter_name":call_info.call_starter_name,
        "started_at":call_info.started_at.isoformat()
    }
    Print.yellow(f"Call Started: {call_info}")

    await core.async_redis_api.redis_client.set(f"videocall:{communityId}:{channelId}", json.dumps(call_notiff))
    await core.async_redis_api.redis_client.xadd("chat_broadcast", call_notiff)

    return {"Success":True}


@router.get("/{communityId}/{channelId}/call_logs")
def getCallLogs(communityId:int, channelId:int, access_token: str=Depends(token_verification), db:Session=Depends(get_db)):
    uid=parse_access_token(access_token=access_token)

    logs=get_call_logs(community_id=communityId, channel_id=channelId, session=db)

    return {"CallLogs":logs}



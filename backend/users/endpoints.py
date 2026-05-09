from fastapi import APIRouter, Response, Depends, HTTPException, status
from RequestModels import user_credentials, user_search, user_invite
from auth.dependencies import token_verification
from DB_Manipulation.user_operations import get_user_communities, get_user_with_uid, update_language_preference
from DB_Manipulation.dependencies import get_db
from DB_Manipulation.community_operations import get_Community
from DB_Manipulation.channel_operations import get_channel
from database_models import Users, Channel_Members
from models import Redis_Notification_ChannelInvite
from sqlalchemy.orm import Session
from sqlalchemy import select, case, exists
import json
import core
from utilities.colour_print import Print
from datetime import datetime, timezone

router = APIRouter()

def get_uid(access_token: str):
    return access_token.split("_")[0]

@router.post("/test")
def cookie_test(credentials: user_credentials, response: Response, access_token: str=Depends(token_verification)):

    print(access_token)

    print(f'Credentials: {credentials.username}, {credentials.email}, {credentials.password}')

    return {"test":"test message"}


@router.get("/profile")
def get_user_profile(token: str=Depends(token_verification), db:Session=Depends(get_db)):
    uid=get_uid(access_token=token)
    user_info=get_user_with_uid(session=db, uid=uid)
    
    # Print.red(f"UserInfo: {user_info}")

    return {"UserInfo":{
                        "user_id":uid, 
                        "username":user_info.user_name, 
                        "email":user_info.user_email,
                        "preferred_language":user_info.preferred_language,
                        }}




@router.get("/communities")
def user_communities(token: str=Depends(token_verification), db:Session=Depends(get_db)):
    uid=get_uid(access_token=token)

    user_comms=get_user_communities(session=db, uid=uid)
    # print(f'================{user_comms}================')

    return {"UserCommunities":user_comms}

@router.post("/change_language/{new_language}")
def change_language_preference(new_language:str, token: str=Depends(token_verification), db:Session=Depends(get_db)):
    uid=get_uid(access_token=token)
    try:
        update_language_preference(new_language=new_language, uid=uid, session=db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

    
    return {"Success":True}


@router.post("/{communityId}/{channelId}/search")
def get_matching_users(communityId:int, channelId:int, search_values:user_search, session:Session=Depends(get_db)):

    subq = (
        select(Channel_Members.user_id)
        .filter(
            Channel_Members.user_id == Users.user_id,
            Channel_Members.community_id == communityId,
            Channel_Members.channel_id == channelId
        )
    )

    query = select(
            Users.user_id,
            Users.user_name,
            Users.user_email,
            Users.preferred_language,
            case(
                (exists(subq), "joined"),
                else_="not_joined"
            ).label("status")
        ).where(
            Users.user_name.ilike(f"%{search_values.user_name}%")
        )

    newResult=session.execute(query).mappings().all()


    return newResult



@router.post("/{communityId}/{channelId}/invite")
async def invite_user_to_channel(communityId:int, channelId:int, invite_info: user_invite, token: str=Depends(token_verification), db:Session=Depends(get_db)):
    uid=get_uid(access_token=token)
    user=get_user_with_uid(session=db, uid=uid)
    community=get_Community(comm_id=communityId, session=db)
    channel=get_channel(comm_id=communityId, channel_id=channelId, session=db)

    ChannelInvite_Notiff=Redis_Notification_ChannelInvite(
        type="ChannelInvite",
        community_id=communityId,
        community_name=community.community_name,
        channel_id=channelId,
        channel_name=channel.channel_name,
        inviter_id=uid,
        inviter_name=user.user_name,
        inviter_email=user.user_email,
        sent_at=datetime.now(timezone.utc).isoformat()
    )
    try:
        # await core.async_redis_api.redis_client.lpush(f"Notifications:{ws.state.user_id}", json.dumps(new_message))
        list_key=f"Notifications:{invite_info.user_id}"
        value=ChannelInvite_Notiff.model_dump_json()
        all_entries=await core.async_redis_api.redis_client.lrange(list_key, 0, -1)

        for entry in all_entries:
            try:
                new_msg:dict=json.loads(entry)

                if (new_msg.get("type")=="ChannelInvite" and 
                    new_msg.get("community_id")==communityId and 
                    new_msg.get("channel_id")==channelId):

                    Print.yellow("Invite already sent")
                    return {"Success":"Notification Already Sent"}
            except Exception as e:
                Print.red(f"Error while matching notifications: {e}")
                break
        
        await core.async_redis_api.redis_client.lpush(list_key, value)
        await core.async_redis_api.redis_client.ltrim(list_key, 0, 99)

    except Exception as e:
        Print.red(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    Print.green("Channel Invite Sent")
    return {"Success":True}


@router.post("/accept_invite")
async def user_accepted_invite(invite_info: Redis_Notification_ChannelInvite, token: str=Depends(token_verification)):
    uid=get_uid(access_token=token)
    list_key=f"Notifications:{uid}"
    value=invite_info.model_dump_json()

    try:
        await core.async_redis_api.redis_client.lrem(list_key, 0, value)
    except Exception as e:
        Print.red(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

    return {"Success":True}


@router.post("/reject_invite")
async def user_accepted_invite(invite_info: Redis_Notification_ChannelInvite, token: str=Depends(token_verification)):
    uid=get_uid(access_token=token)
    list_key=f"Notifications:{uid}"
    value=invite_info.model_dump_json()

    try:
        await core.async_redis_api.redis_client.lrem(list_key, 0, value)
    except Exception as e:
        Print.red(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

    return {"Success":True}



@router.get("/notifications")
async def get_all_notifications(token: str=Depends(token_verification)):
    uid=get_uid(access_token=token)
    list_key=f"Notifications:{uid}"

    try:
        notifications=await core.async_redis_api.redis_client.lrange(list_key, 0, -1)

        return {"Notifications":list(reversed(notifications))}
    except Exception as e:
        Print.red(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
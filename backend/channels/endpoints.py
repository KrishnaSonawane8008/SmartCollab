from fastapi import APIRouter, Depends, HTTPException, status
from auth.dependencies import token_verification
from sqlalchemy.orm import Session
from DB_Manipulation.dependencies import get_db
from utilities.db_utilities import parse_access_token
from communities.dependencies import isUserAuthorized

from utilities.colour_print import Print
from DB_Manipulation.channel_operations import get_channel_messages

router=APIRouter()



@router.get("/{communityId}/{channelId}")
def get_messages(communityId:int, channelId:int, access_token: str=Depends(token_verification), db:Session=Depends(get_db)):
    uid=parse_access_token(access_token=access_token)

    isAuthorized=isUserAuthorized(uid=uid, community_id=communityId, session=db, channel_id=channelId)
    if isAuthorized==False:
        Print.red(f"USER {uid} IS NOT AUTHORIZED TO ACCESS CHANNEL {channelId} OF COMMUNITY {communityId}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="user not authorized to access channel of this community"
        )
    
    messages=get_channel_messages(uid=uid, comm_id=communityId, channel_id=channelId, session=db)

    return {"Messages":messages}

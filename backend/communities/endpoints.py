from fastapi import APIRouter, Depends, HTTPException, status
from auth.dependencies import token_verification
from sqlalchemy.orm import Session
from utilities.db_utilities import parse_access_token
from DB_Manipulation.dependencies import get_db
from DB_Manipulation.community_operations import get_user_channels
from communities.dependencies import isUserAuthorized

from utilities.colour_print import Print

router = APIRouter()



@router.get("/ChannelMessages")
def get_Channel_Messages(channel_id: int, access_token: str=Depends(token_verification)):
    uid=parse_access_token(access_token=access_token)

    pass

@router.get("/{communityId}/channels")
def get_User_Channels(communityId:int, access_token: str=Depends(token_verification), db:Session=Depends(get_db)):
    uid=parse_access_token(access_token=access_token)
    isAuthorized=isUserAuthorized(uid=uid, community_id=communityId, session=db)
    if isAuthorized==False:
        Print.red("USER NOT AUTHORIZED TO ACCESS THIS COMMUNITY")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="user not authorized to access community"
        )

    channels=get_user_channels(uid=uid, comm_id=communityId, session=db)

    return {"Channels":channels}


from fastapi import APIRouter, Response, Depends
from auth.dependencies import token_verification
from database import session
from communities.dependencies import AuthorizeCommunityUser
from utilities.db_utilities import parse_access_token

router = APIRouter()



@router.get("/ChannelMessages")
def get_Channel_Messages(channel_id: int, access_token: str=Depends(token_verification)):
    uid=parse_access_token(access_token=access_token)

    pass
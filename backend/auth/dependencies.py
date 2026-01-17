from fastapi import HTTPException, Header, status
from database import session
from DB_Manipulation.user_operations import get_user_auth_info
from datetime import datetime, timezone


def token_verification( authorization: str = Header(None) ):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header"
        )
    
    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization format"
        )
    
    print(f'Recieved Token: {token}')
    
    uid, _, uname=token.partition("_")

    db=session()
    user_auth_info=get_user_auth_info(session=db, userid=uid)
    db.close()

    
    if not user_auth_info.access_token or user_auth_info.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or Expired access token"
        )

    return token
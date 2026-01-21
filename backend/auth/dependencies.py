from fastapi import HTTPException, Header, status
from database import session
from DB_Manipulation.user_operations import get_user_auth_info
from datetime import datetime, timezone
from utilities.colour_print import Print


def token_verification( Authorization: str = Header(None) ):
    if not Authorization:
        Print.red("AUTHORIZATION FIELD NOT PRESENT IN HEADER")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header"
        )
    
    scheme, _, token = Authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        Print.red("WRONG ACCESS TOKEN FORMAT/NO ACCESS TOKEN PROVIDED:" )
        Print.yellow(f'   Recieved Authorization Field: "{Authorization}"')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization Format/No access Token Provided"
        )
    
    uid, _, uname=token.partition("_")

    db=session()
    user_auth_info=get_user_auth_info(session=db, userid=uid)
    db.commit()
    db.close()

    
    if not user_auth_info.access_token:
        Print.red("NO ACCESS TOKEN IN DB")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing access token"
        )
    
    if user_auth_info.expires_at < datetime.now(timezone.utc):
        Print.red("ACCESS TOKEN EXPIRED")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired access token"
        )

    return token
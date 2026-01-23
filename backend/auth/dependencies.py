from fastapi import HTTPException, Header, status
from database import session
from DB_Manipulation.user_operations import get_user_auth_info
from datetime import datetime, timezone
from utilities.colour_print import Print


def token_verification( Authorization: str = Header(None) ):
    #check if the request has the Authorization header, the Authorization header contains the access token
    if not Authorization:
        Print.red("AUTHORIZATION FIELD NOT PRESENT IN HEADER")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header"
        )
    
    scheme, _, token = Authorization.partition(" ")

    #check if the access token format is correct (its "Bearer"+" "+"<access token value>")
    if scheme.lower() != "bearer" or not token:
        Print.red("WRONG ACCESS TOKEN FORMAT/NO ACCESS TOKEN PROVIDED:" )
        Print.yellow(f'   Recieved Authorization Field: "{Authorization}"')
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization Format/No access Token Provided"
        )
    
    uid, _, uname=token.partition("_")

    db=session()
    #check if the userid(got from the access token) is present in the "Users" table
    user_auth_info=get_user_auth_info(session=db, userid=uid)
    db.commit()
    db.close()

    #check if the value in the access_token column from "Users" table is not null 
    if not user_auth_info.access_token:
        Print.red("NO ACCESS TOKEN IN DB")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing access token"
        )
    
    #check if the access token is expired or not
    if user_auth_info.expires_at < datetime.now(timezone.utc):
        Print.red("ACCESS TOKEN EXPIRED")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired access token"
        )

    #return the access token
    return token
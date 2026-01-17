from fastapi import APIRouter, Response, HTTPException, Cookie, status

from database import session
from datetime import timedelta, datetime, timezone
from RequestModels import user_credentials

from DB_Manipulation.user_operations import get_user_with_credentials, add_as_new_user, update_user_auth_info



router=APIRouter()


ACCESS_TOKEN_TTL = timedelta(minutes=15)
def create_access_token(user_id, user_name):
    token=f'{user_id}_{user_name}'
    expires_at = datetime.now(timezone.utc) + ACCESS_TOKEN_TTL

    return {"new_access_token": token, "new_expiry":expires_at }




@router.post("/login")
async def user_login(credentials: user_credentials, response: Response):
    print("===================================================")
    print(f'recieved credentials: {credentials.username}, {credentials.email}, {credentials.password}')
    db=session()

    #check if user already in DB
    user = get_user_with_credentials(session=db, credentials=credentials)

    if user is None:
        print("user doesnt exist, regestering as new user")
        #user doesnt exist, add to DB as new user, and get the new User model instance
        user=add_as_new_user(session=db, credentials=credentials)

        print("refresh_token stored in cookie")

        db.commit()
        print(f'user {credentials.username} added to db')


    db.close()

    response.set_cookie(
            key="refresh_token",
            value=f'{user.user_id}_{user.user_name}_{user.user_email}_{user.user_password}',
            
    )

    return {"AccessToken":f'{user.user_id}_{user.user_name}'}




@router.post("/refresh")
async def get_refresh_token(refresh_token: str=Cookie(None)):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token"
        )
    
    token_info=refresh_token.split("_")

    new_auth_info=create_access_token(user_id=token_info[0], user_name=token_info[1])
    try:
        db=session()
        update_user_auth_info(session=db, 
                              uid=token_info[0],
                              new_access_token=new_auth_info["new_access_token"], 
                              new_expiry_time=new_auth_info["new_expiry"])
        db.commit()
        db.close()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e
        )
    
    print("from /auth/refresh new_AccessToken: ",refresh_token)

    return {"new_AccessToken":f'{token_info[0]}_{token_info[1]}'}





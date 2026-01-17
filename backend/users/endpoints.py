from fastapi import APIRouter, Response, Depends
from RequestModels import user_credentials
from auth.dependencies import token_verification


router = APIRouter()


@router.post("/test")
def cookie_test(credentials: user_credentials, response: Response, access_token: str=Depends(token_verification)):

    print(access_token)

    print(f'Credentials: {credentials.username}, {credentials.email}, {credentials.password}')

    return {"test":"test message"}
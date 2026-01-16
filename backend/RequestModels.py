from pydantic import BaseModel


class user_credentials(BaseModel):
    username: str
    email: str
    password: str
from fastapi import FastAPI, Depends, Response, HTTPException, Header, status, Cookie
from fastapi.middleware.cors import CORSMiddleware

from database import session, engine
from models import Community, User
import database_models
from sqlalchemy.orm import close_all_sessions
from sqlalchemy import inspect, select, text, insert
from Datapopulation import populate_db
from database_operations import drop_all_tables, is_database_empty
from datetime import datetime, timedelta, timezone

from RequestModels import user_credentials

from DB_Manipulation.user_operations import add_as_new_user, get_user

# tables_to_create_on_init=[ database_models.Communties.__table__, database_models.Users.__table__ ]

# database_models.Base.metadata.create_all(bind=engine, tables=tables_to_create_on_init)


app = FastAPI()


origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    close_all_sessions()
    drop_all_tables()
    db=session()
    populate_db(db)
    db.close()
        


def get_db():
    db=session()
    try:
        yield db
    finally:
        db.close()



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

    return token

ACCESS_TOKEN_TTL = timedelta(minutes=15)
def create_access_token(user_id, user_name):
    token=f'{user_id}_{user_name}'
    expires_at = datetime.now(timezone.utc) + ACCESS_TOKEN_TTL


@app.get("/populate_db")
async def initialize_db():
    if(is_database_empty(engine)):
        print("database is empty, filling with random data")
        init_db()
    return {"Hello": "Cruel World"}





@app.get("/get_user")
def get_user_api():
    db=session()
    inspector=inspect(engine)
    table_names = inspector.get_table_names()
    print(table_names)
    db.close()
    return {"tableNames":table_names}


@app.post("/user_login")
async def user_login(credentials: user_credentials, response: Response):
    print("===================================================")
    print(f'recieved credentials: {credentials.username}, {credentials.email}, {credentials.password}')
    db=session()
    print("session created")

    #check if user already in DB
    user = get_user(session=db, credentials=credentials)

    if user is None:
        print("user doesnt exist, regestering as new user")
        #user doesnt exist, add to DB as new user
        add_as_new_user(session=db, credentials=credentials)

        db.commit()
        print(f'user {credentials.username} added to db')

    user=get_user( session=db, credentials=credentials )

    db.close()
    print("session closed")
    print(f'{user.user_id}_{credentials.username}_{credentials.email}')
    print("cookie set")
    response.set_cookie(
        key="refresh_token",
        value=f'{user.user_id}_{credentials.username}_{credentials.email}_{credentials.password}'
    )

    return {"AccessToken":f'{user.user_id}_{credentials.username}'}


@app.get("/communities")
async def get_user_communities(access_token: str=Depends(token_verification)):
    print(f'Access Token: {access_token}')

    return {"Access Token":f'{access_token}'}





@app.post("/auth_refresh")
async def get_refresh_token(refresh_token: str=Cookie(None)):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token"
        )
    
    print(refresh_token)

    return {"access_token": "new_access_token"}




@app.post("/test")
def cookie_test(credentials: user_credentials, response: Response, access_token: str=Depends(token_verification)):

    print(access_token)

    print(f'Credentials: {credentials.username}, {credentials.email}, {credentials.password}')

    return {"test":"test message"}



@app.get("/db_add")
def db_add():
    db = session()

    # Example operation: just returning a success message for demonstration
    return {"message": "Database session created successfully"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
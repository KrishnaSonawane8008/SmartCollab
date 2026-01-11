from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from database import session, engine
from models import Community, User
import database_models
from sqlalchemy.orm import Session
from Datapopulation import populate_db



tables_to_create_on_init=[ database_models.Communties.__table__, database_models.Users.__table__ ]

database_models.Base.metadata.create_all(bind=engine, tables=tables_to_create_on_init)



@asynccontextmanager
async def init_db(app: FastAPI):
    print("lifespan startup", flush=True)

    db=session()

    community_count= db.query( database_models.Communties ).count()
    users_count= db.query( database_models.Users ).count()

    if(community_count==0 and users_count==0):
        print("db population started")
        populate_db(db)
    else:
        print(f'communitis: ${community_count}, users: ${users_count}')

    yield  # <-- app is now running

    print("lifespan shutdown", flush=True)

app = FastAPI(lifespan=init_db)



def get_db():
    db=session()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def read_root(db: Session=Depends(get_db)):

    return {"Hello": "World"}

@app.get("/db_add")
def db_add():
    db = session()

    # Example operation: just returning a success message for demonstration
    return {"message": "Database session created successfully"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
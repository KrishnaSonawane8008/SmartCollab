from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import session, engine
import database_models
from sqlalchemy.orm import close_all_sessions
from Datapopulation import populate_db
from database_operations import drop_all_tables, is_database_empty



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

from auth.endpoints import router as auth_router
from users.endpoints import router as users_router
from communities.endpoints import router as communities_router
from channels.endpoints import router as channels_router

app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users")
app.include_router(communities_router, prefix="/communities")
app.include_router(channels_router, prefix="/channels")


def init_db():
    close_all_sessions()
    drop_all_tables()
    db=session()
    populate_db(db)
    db.commit()
    db.close()
        


# def get_db():
#     db=session()
#     try:
#         yield db
#     finally:
#         db.close()



@app.get("/populate_db")
def initialize_db():
    if(is_database_empty(engine)):
        print("database is empty, filling with random data")
        init_db()
    return {"Hello": "Cruel World"}

@app.get("/cors_test")
def cors_test():
    return {"status": "ok"}

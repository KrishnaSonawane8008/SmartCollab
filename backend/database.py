import os
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

load_dotenv()
# DATABASE_URL = f'postgresql://{os.environ.get("DB_USER")}:{os.environ.get("DB_PASSWORD")}@{os.environ.get("DB_HOST")}:{os.environ.get("DB_PORT")}/{os.environ.get("DB_NAME")}'

DATABASE_URL=f'postgresql+psycopg2://app:12345@postgresdb:5432/smartcollab_postgresdb'

engine=create_engine(DATABASE_URL)
session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
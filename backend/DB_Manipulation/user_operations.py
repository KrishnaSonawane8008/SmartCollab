from RequestModels import user_credentials
from sqlalchemy.orm import Session
from database_operations import get_table_by_name
from sqlalchemy import inspect, select, text, insert
from models import User

#returns None if is a new user, otherwise returns the user already present in DB
def get_user(session: Session, credentials: user_credentials):
    users_table=get_table_by_name("Users")

    #bascially -
    # SELECT * FROM "USERS" 
    # WHERE 
    # user_name=:credentials.username AND user_email=:credentials.email AND user_password=:credentials.password
    user: list[User]=session.execute(
                                select(users_table).where(
                                        users_table.c.user_name==credentials.username,
                                        users_table.c.user_email==credentials.email,
                                        users_table.c.user_password==credentials.password
                                        )
        ).mappings().all()
    
    if len(user)==0:
        return None

    return user[0]


#adds a new entry to "Users" table in DB
def add_as_new_user(session: Session, credentials: user_credentials):
    users_table=get_table_by_name("Users")

    last_user: list[dict]=session.execute( 
                    select(users_table).order_by(users_table.c.user_id.desc())

                    ).mappings().all()[0]

    new_user = User(    user_id=last_user['user_id']+1, 
                        user_name=credentials.username,
                        user_email=credentials.email,
                        user_password=credentials.password
                    )

    session.execute(
        insert(users_table).values(**new_user.model_dump())
    )
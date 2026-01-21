from RequestModels import user_credentials
from sqlalchemy.orm import Session
from database_operations import get_table_by_name
from sqlalchemy import inspect, select, text, insert, update
from models import User, User_Community
from database_models import Users
from datetime import datetime, timedelta, timezone

#returns None if user doesnt exist in db, otherwise returns the user row corresponding to credentials
def get_user_with_email(session: Session, email: str)->User | None:
    users_table=get_table_by_name("Users")

    #bascially -
    # SELECT * FROM "USERS" 
    # WHERE 
    # user_email=:credentials.email;
    user: list[User]=session.execute(
                                select(users_table).where(
                                        users_table.c.user_email==email,
                                        )
                            ).mappings().all()
    
    if len(user)==0:
        return None

    return user[0]


#same as get_user_with_credentials, but uses the user_id to retrieve user info
def get_user_with_uid(session: Session, uid: int)->User | None:
    users_table=get_table_by_name("Users")

    user: list[User]=session.execute(
                                select(users_table).where(
                                        users_table.c.user_id==uid
                                        )
                            ).mappings().all()
    
    if len(user)==0:
        return None

    return user[0]


#returns a list of [user_name, access_token, expiresa_at] columns of the Users table for a particular userid, 
# if userid doesnt exist, returns None
def get_user_auth_info(session:Session, userid: int):
    users_table=get_table_by_name("Users")

    user_auth_info: list=session.execute(

                        select(
                            users_table.c.user_name, 
                            users_table.c.access_token, 
                            users_table.c.expires_at
                        ).where( users_table.c.user_id==userid )

                    ).mappings().all()
    
    if len(user_auth_info)==0:
        return None

    return user_auth_info[0]





#updates the values of access_token and expires_at columns in the Users table
#if userid doesnt exist
def update_user_auth_info(session: Session, uid: int, new_access_token: str, new_expiry_time: datetime):
    users_table=get_table_by_name("Users")

    query = session.query().filter(Users.user_id == uid)
    user_exists = session.query(query.exists()).scalar()

    if(user_exists):
        session.execute(
            update(users_table).where(users_table.c.user_id==uid).values(access_token=new_access_token, expires_at=new_expiry_time)
        )
    else:
        raise Exception(f'user_id {uid} doesnt exist in database/wrong uid provided')
    





#adds a new entry to "Users" table in DB
def add_as_new_user(session: Session, credentials: user_credentials)->User:
    users_table=get_table_by_name("Users")

    last_user: list[dict]=session.execute( 
                    select(users_table).order_by(users_table.c.user_id.desc())

                    ).mappings().all()[0]
    new_uid=last_user['user_id']+1
    new_user = User(    user_id=new_uid, 
                        user_name=credentials.username,
                        user_email=credentials.email,
                        user_password=credentials.password,
                        access_token=f'{new_uid}_{credentials.username}',
                        expires_at = datetime.now(timezone.utc) + timedelta(seconds=10)#expiry time set to (time when user logged in)+(10 secs), short ttl for access token created at user login
                    )

    session.execute(
        insert(users_table).values(**new_user.model_dump())
    )

    return new_user



def get_user_communities(session: Session, uid:int)->list[User_Community] | None:
    user_comm_table=get_table_by_name(f'User{uid}_Communities')

    user_comms: list[User_Community]=session.execute(select(user_comm_table)).mappings().all()

    if(len(user_comms)==0):
        return None

    return user_comms




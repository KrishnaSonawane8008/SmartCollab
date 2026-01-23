from models import User, Access_Token, Community, Channel, Community_Member, Channel_Member, Message
import database_models
from database import engine
from datetime import datetime, timezone
import random
from utilities.colour_print import Print
from sqlalchemy.orm import Session
from sqlalchemy import insert
from database_operations import add_data_into_table_by_reference


communities=[
    Community( community_id=1, community_name="Com1", created_at=datetime.now(timezone.utc) ),
    Community( community_id=2, community_name="Com2", created_at=datetime.now(timezone.utc) ),
    Community( community_id=3, community_name="Com3", created_at=datetime.now(timezone.utc) )
]

users=[
    User(user_id=1, user_name="User1", user_email="User1@gmail.com", user_password="user1_pass", created_at=datetime.now(timezone.utc) ),
    User(user_id=2, user_name="User2", user_email="User2@gmail.com", user_password="user2_pass", created_at=datetime.now(timezone.utc) ),
    User(user_id=3, user_name="User3", user_email="User3@gmail.com", user_password="user3_pass", created_at=datetime.now(timezone.utc) ),
    User(user_id=4, user_name="User4", user_email="User4@gmail.com", user_password="user4_pass", created_at=datetime.now(timezone.utc) ),
    User(user_id=5, user_name="User5", user_email="User5@gmail.com", user_password="user5_pass", created_at=datetime.now(timezone.utc) ),
    User(user_id=6, user_name="User6", user_email="User6@gmail.com", user_password="user6_pass", created_at=datetime.now(timezone.utc) ),
    User(user_id=7, user_name="User7", user_email="User7@gmail.com", user_password="user7_pass", created_at=datetime.now(timezone.utc) ),
    User(user_id=8, user_name="User8", user_email="User8@gmail.com", user_password="user8_pass", created_at=datetime.now(timezone.utc) ),
    User(user_id=9, user_name="User9", user_email="User9@gmail.com", user_password="user9_pass", created_at=datetime.now(timezone.utc) ),
    User(user_id=10, user_name="User10", user_email="User10@gmail.com", user_password="user10_pass", created_at=datetime.now(timezone.utc) )
]




def insert_into_Communities(session: Session):
    for community in communities:
        query=insert(database_models.Communities).values(**community.model_dump())
        session.execute(query)
    Print.green("Communities Initialized")


def insert_into_Users(session: Session):
    for user in users:
        query=insert(database_models.Users).values(**user.model_dump())
        session.execute(query)
    Print.green("Users Initialized")



def insert_into_access_tokens(session: Session):
    for user in users:
        val=f'{user.user_id}_{user.user_name}'
        access_token=Access_Token( user_id=user.user_id, value=val, expires_at=datetime.now(timezone.utc) )
        query=insert(database_models.Access_Tokens).values(**access_token.model_dump())
        session.execute(query)
    Print.green("Access_Tokens Initialized")





community_members:dict[int, list[Community_Member]]={}
def insert_into_community_members(session: Session):
    for community in communities:
        some_users=random.sample(users, random.randint(3,6))
        community_members[community.community_id]=[]
        for user in some_users:
            comm_member=Community_Member(
                                            user_id=user.user_id,
                                            community_id=community.community_id,
                                            user_name=user.user_name,
                                            community_name=community.community_name,
                                            joined_at=datetime.now(timezone.utc),
                                            roles="member"
                                        )
            community_members[community.community_id].append(comm_member)
            query=insert(database_models.Community_Members).values(**comm_member.model_dump())
            session.execute(query)
    
    Print.green("Community_Members initialized")



channel_names=[ "general", "introductions", "announcements", "rules-and-info", "random", "off-topic", "memes", "daily-chat", "questions-and-help", "resources", "projects", "showcase", "feedback", "events", "voice-chat" ]
channels: dict[int, list[Channel]]={}
def insert_into_channels(session: Session):
    for community in communities:
        comm_channels=random.sample(channel_names, random.randint(2, 5))
        channel_id=0
        channels[community.community_id]=[]
        for comm_channel in comm_channels:
            channel_id+=1
            new_channel=Channel( channel_id=channel_id, 
                                community_id=community.community_id,
                                channel_name=comm_channel,
                                created_at=datetime.now(timezone.utc) )
            channels[community.community_id].append(new_channel)
            query=insert(database_models.Channels).values(**new_channel.model_dump())
            session.execute(query)
    Print.green("Channels Initialized")



channel_members: dict[ (int,int), list[Channel_Member] ]={}#(community_id, channel_id)
def insert_into_channel_members(session:Session):
    for community in communities:
        comm_members=community_members[community.community_id]
        for channel in channels[community.community_id]:
            channel_members[ (channel.community_id, channel.channel_id) ]=[]
            comm_members=random.sample(comm_members, random.randint(2,len(comm_members)))
            for comm_member in comm_members:
                channel_member=Channel_Member(
                    user_id=comm_member.user_id,
                    community_id=channel.community_id,
                    channel_id=channel.channel_id,
                    user_name=comm_member.user_name,
                    community_name=community.community_name,
                    channel_name=channel.channel_name,
                    joined_at=datetime.now(timezone.utc),
                    roles="member"
                )

                channel_members[ (channel.community_id, channel.channel_id) ].append(channel_member)
                query=insert(database_models.Channel_Members).values(**channel_member.model_dump())
                session.execute(query)

    Print.green("Channel_Members initialized")




nouns = ["developer","robot","forest","algorithm"]
verbs = ["calculates","explores","constructs","observes"]
adjectives = ["efficiently","curiously","resiliently","dynamicly"]
def insert_into_messages(session: Session):
    msg_id=0
    for community in communities:
        for channel in channels[community.community_id]:
            members=channel_members[(channel.community_id, channel.channel_id)]
            members_size=len(members)
            noun_slice=random.sample(nouns, random.randint(2,3))
            verb_slice=random.sample(nouns, random.randint(2,3))
            adjective_slice=random.sample(nouns, random.randint(2,3))
            
            for noun in noun_slice:
                for verb in verb_slice:
                    for adjective in adjective_slice:
                        msg_id+=1
                        message=Message(
                            message_id=msg_id,
                            sender_id=members[random.randint(0,members_size-1)].user_id,
                            community_id=channel.community_id,
                            channel_id=channel.channel_id,
                            message=f'{noun} {verb} {adjective}',
                            sent_at=datetime.now(timezone.utc)
                        )

                        query=insert(database_models.Messages).values(**message.model_dump())
                        session.execute(query)

    Print.green("Messages initialized")




def print_db_structure():
    print("======================================================")
    Print.green(f'Communities: ')
    for community in communities:
        Print.yellow(f'   {community.community_name}')
    print("\n")
    Print.green("Users: ")
    for user in users:
        Print.yellow(f'   {user.user_name}')
    print("======================================================")
    print("======================================================")

    for community in communities:
        Print.green(f'{community.community_name}')
        Print.yellow("   Members:")
        for member in community_members[community.community_id]:
            Print.magenta(f'      {member.user_name}')
        Print.yellow("   Channels:")
        for channel in channels[community.community_id]:
            Print.blue(f'      {channel.channel_name}')
            for channel_member in channel_members[(channel.community_id, channel.channel_id)]:
                Print.magenta(f'         {channel_member.user_name}')
    print("======================================================")
    
    Print.green("DB filled")
            




def populate_db(db: Session):
    database_models.Base.metadata.create_all(bind=engine)
    insert_into_Communities(session=db)
    insert_into_Users(session=db)
    insert_into_access_tokens(session=db)
    insert_into_community_members(session=db)
    insert_into_channels(session=db)
    insert_into_channel_members(session=db)
    insert_into_messages(session=db)

    print_db_structure()



    
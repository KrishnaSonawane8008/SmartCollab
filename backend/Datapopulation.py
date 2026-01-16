from models import Community, User, Community_User, Channel, Channel_User, Channel_Message, User_Community
import database_models
from datetime import datetime, timezone
import random
import pprint
from sqlalchemy.orm import Session
from database_operations import create_table_from_model, get_table_by_name, add_data_into_table_by_reference

communities=[
    Community( community_id=1, community_name="Com1" ),
    Community( community_id=2, community_name="Com2" ),
    Community( community_id=3, community_name="Com3" )
]

users=[
    User(user_id=1, user_name="User1", user_email="User1@gmail.com", user_password="user1_pass", access_token="1_User1", expires_at=datetime.now(timezone.utc) ),
    User(user_id=2, user_name="User2", user_email="User2@gmail.com", user_password="user2_pass", access_token="2_User2", expires_at=datetime.now(timezone.utc) ),
    User(user_id=3, user_name="User3", user_email="User3@gmail.com", user_password="user3_pass", access_token="3_User3", expires_at=datetime.now(timezone.utc) ),
    User(user_id=4, user_name="User4", user_email="User4@gmail.com", user_password="user4_pass", access_token="4_User4", expires_at=datetime.now(timezone.utc) ),
    User(user_id=5, user_name="User5", user_email="User5@gmail.com", user_password="user5_pass", access_token="5_User5", expires_at=datetime.now(timezone.utc) ),
    User(user_id=6, user_name="User6", user_email="User6@gmail.com", user_password="user6_pass", access_token="6_User6", expires_at=datetime.now(timezone.utc) ),
]

community_users: dict[int, list[Community_User]] = {}#community_users[community_id]=[Community_User1, Community_User2, ...]
population=range(len(users))
def create_community_users():
    for community in communities:
        nums=random.sample(population, 2)
        nums=get_inclusive_ranges( len(possible_channel_names), nums )
        community_users[community.community_id]=[]

        for user_index in range( nums[0], nums[1] ):
            community_users[community.community_id].append( Community_User(community_id=community.community_id,
                                                                           user_id=users[user_index].user_id,
                                                                           user_name=users[user_index].user_name) )

user_communities: dict[int, list[User_Community]] = {}
def create_user_communities():
    for user in users:
        user_communities[user.user_id]=[]
    
    for community in communities:
        for community_user in community_users[community.community_id]:
            user_communities[community_user.user_id].append(
                User_Community(
                    user_id=community_user.user_id,
                    community_id=community_user.community_id,
                    community_name=community.community_name
                )
            )


possible_channel_names = ["general", "coitus", "help", "announcements", "projects", "off-topic"]
channel_dict: dict[int, list[Channel]] = {}
def create_channels():
    for community in communities:
        channel_dict[community.community_id]=[]
        channelId=0
        name_population=range(len(possible_channel_names))
        nums=random.sample(name_population, 2)
        nums=get_inclusive_ranges( len(possible_channel_names), nums )
        for name_index in range( nums[0], nums[1] ):
            channelId+=1
            channel_dict[community.community_id].append( 
                Channel(channel_id=channelId, channel_name=possible_channel_names[name_index], 
                        community_id=community.community_id)
             )



channel_users_dict: dict[tuple, list[Channel_User]] = {}#(community.community_id, channel.channel_id)
def create_channel_users():
    for community in communities:
        for channel in channel_dict[community.community_id]:
            channel_users_dict[(community.community_id, channel.channel_id)]=[]
            community_members=community_users[community.community_id]

            com_member_population=range(len(community_members))
            nums=random.sample(com_member_population, 2)

            nums=get_inclusive_ranges( len(community_members), nums )

            for com_member_index in range( nums[0], nums[1] ):
                community_member= community_members[com_member_index]
                channel_users_dict[(community.community_id, channel.channel_id)].append(
                    Channel_User(channel_id=channel.channel_id, 
                                 user_id=community_member.user_id,
                                 user_name=community_member.user_name,
                                 community_id=community.community_id)
                )



def get_inclusive_ranges(list_len, nums):
    mn, mx= min(nums), max(nums)
    if(mx-mn)==1:
        if mn>0:
            mn-=1
        elif mx<=list_len-1:
            mx+=1
    return [mn, mx]



def print_db_structure():
    print("=================================")
    print("DB Structure:")
    print("\nUsers: ")
    for user in users:
        print(f'    {user.user_name}')
    print("\nCommunities:")
    for community in communities:
        print(f'    {community.community_name}')
    for community in communities:
        print("=================================")
        print(f'{community.community_name}')
        print(f'    Community Users:')
        for community_users_vlaue in community_users[community.community_id]:
            print(f'        {community_users_vlaue.user_name}')
        print("\n")
        print(f'    Channels:')
        for channel in channel_dict[community.community_id]:
            print(f'        {channel.channel_name}: ')
            print(f'            Channel Users:')
            for channel_user in channel_users_dict[(community.community_id, channel.channel_id)]:
                print(f'                {channel_user.user_name}')
        print("=================================")
            




def populate_db(db: Session):
    #this function just creates a bunch of tables and fills the tables with some random data, 
    # its ment for testing.

    #dont fuck with the order in which these functions are called, they depend on each other,
    #i have made these in a rush and its not intended to stay in final design
    create_community_users()#creates community_users: dict[int, list[Community_User]]
    create_user_communities()#creates user_communities: dict[int, list[User_Community]]
    create_channels()#creates channel_dict: dict[int, list[Channel]]
    create_channel_users()#creates channel_users_dict: dict[tuple, list[Channel_User]]




    create_table_from_model( database_models.Communties, "Communities" )
    create_table_from_model( database_models.Users, "Users" )
    for community in communities:
        #creating community users tables, one for each community
        create_table_from_model(  database_models.Community_Users, 
                                f'Com{community.community_id}_Users' )
        create_table_from_model(  database_models.Channels, 
                                    f'Com{community.community_id}_Channels' )
        

        table_ref=get_table_by_name( table_name="Communities" )
        add_data_into_table_by_reference( table_reference=table_ref, data=community )
    
    for user in users:
        table_ref=get_table_by_name( table_name="Users" )
        add_data_into_table_by_reference( table_reference=table_ref, data=user )

        create_table_from_model( database_models.User_Communities,
                                f'User{user.user_id}_Communities'
                                 )
        
    for userid in user_communities:
        table_ref=get_table_by_name( f'User{userid}_Communities' )
        for user_community in user_communities[userid]:
            add_data_into_table_by_reference(
                table_reference=table_ref,
                data=user_community
            )

    

    for channel_key in channel_dict:
        for channel in channel_dict[channel_key]:
            table_reference=get_table_by_name( f'Com{channel.community_id}_Channels' )
            add_data_into_table_by_reference(table_reference=table_reference, 
                                             data=channel)
            create_table_from_model( database_models.Channel_Users,
                                        f'Com{channel.community_id}_Channel{channel.channel_id}_ChannelUsers' )
            
            table_reference=get_table_by_name( f'Com{channel.community_id}_Channel{channel.channel_id}_ChannelUsers' )
            for channel_user in channel_users_dict[(channel.community_id, channel.channel_id)]:
                add_data_into_table_by_reference( table_reference=table_reference,
                                                 data=channel_user )


    for community_id in community_users:
        for community_user in community_users[community_id]:
            table_reference=get_table_by_name( f'Com{community_id}_Users' )
            try:
                add_data_into_table_by_reference(table_reference=table_reference, data=community_user )
            except Exception as e:
                print("error while creating community users")
    



    print_db_structure()

    db.commit()

    
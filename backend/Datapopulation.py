from models import Community, User, Community_User, Channel, Channel_User, Channel_Message
import database_models
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
    User(user_id=1, user_name="User1", user_email="User1@gmail.com", user_password="user1_pass"),
    User(user_id=2, user_name="User2", user_email="User2@gmail.com", user_password="user2_pass"),
    User(user_id=3, user_name="User3", user_email="User3@gmail.com", user_password="user3_pass"),
    User(user_id=4, user_name="User4", user_email="User4@gmail.com", user_password="user4_pass"),
    User(user_id=5, user_name="User5", user_email="User5@gmail.com", user_password="user5_pass"),
    User(user_id=6, user_name="User6", user_email="User6@gmail.com", user_password="user6_pass"),
]

community_users: dict[int, list[Community_User]] = {}
population=range(len(users))
def create_community_users():
    print("Creating community users")
    for community in communities:
        nums=random.sample(population, 2)
        nums=get_inclusive_ranges( len(possible_channel_names), nums )
        community_users[community.community_id]=[]
        print("Community", community.community_id)

        for user_index in range( nums[0], nums[1] ):
            community_users[community.community_id].append( Community_User(community_id=community.community_id,
                                                                           user_id=users[user_index].user_id,
                                                                           user_name=users[user_index].user_name) )
            print("     ", users[user_index].user_name)
    print("==============================")



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
        print("Community", community.community_id)
        for channel in channel_dict[community.community_id]:
            channel_users_dict[(community.community_id, channel.channel_id)]=[]
            community_members=community_users[community.community_id]

            com_member_population=range(len(community_members))
            nums=random.sample(com_member_population, 2)

            nums=get_inclusive_ranges( len(community_members), nums )
            print("     Channel", channel.channel_name)

            for com_member_index in range( nums[0], nums[1] ):
                community_member= community_members[com_member_index]
                print("             ", community_member.user_name)
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

create_community_users()
create_channels()
create_channel_users()


def populate_db(db: Session):

    for community in communities:
        #creating community users tables, one for each community
        create_table_from_model(  database_models.Community_Users, 
                                f'Com{community.community_id}_Users' )
        create_table_from_model(  database_models.Channels, 
                                    f'Com{community.community_id}_Channels' )
    #     print("Community Added")
        db.add( database_models.Communties( **community.model_dump() ) )
    
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


    for user in users:
        db.add( database_models.Users( **user.model_dump() ) )

    

    for community_id in community_users:
        for community_user in community_users[community_id]:
            table_reference=get_table_by_name( f'Com{community_id}_Users' )
            try:
                add_data_into_table_by_reference(table_reference=table_reference, data=community_user )
            except Exception as e:
                print("error while creating community users")
            # print(type(community_user))
        # print(community_users[community_id])
        # table_reference=get_table_by_name( f'Com{community_id}_Users' )
        # add_data_into_table_by_reference(table_reference=table_reference, data=community_users[community_id] )
        

    db.commit()

    
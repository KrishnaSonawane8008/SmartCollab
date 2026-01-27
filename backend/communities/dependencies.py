from fastapi import HTTPException, status
from database_models import Community_Members, Channel_Members
from database_operations import get_table_by_name

from sqlalchemy.orm import Session


#checks if the userid trying to access this data is present in the "Com(:community_id)_Users" table
#and is also present in the "Com(:community_id)_Channel(:channel_id)_Users" table
def isUserAuthorized(uid: int, community_id: int, session: Session, channel_id: int=None)->bool:
    '''
    isUserAuthorized(uid:int, community_id:int, db:Session )
    ->used to verify whether the user is a member of the given community

    isUserAuthorized(uid:int, community_id:int, db:Session, channel_id:int )
    ->used to verify whether the user is a member of a channle of a community
    
    returns True on a succesful match in DB, False otherwise
    '''
    isAuthorized=False
    if not community_id or not uid:
        isAuthorized=False
    else:
        query = session.query().filter(Community_Members.user_id==uid, Community_Members.community_id==community_id) 
        is_comm_member = session.query(query.exists()).scalar()

        if not is_comm_member:
            isAuthorized=False
        else:
            isAuthorized=True
    
    if not channel_id: 
        pass
    else:
        query = session.query().filter(Channel_Members.user_id==uid, Channel_Members.community_id==community_id, Channel_Members.channel_id==channel_id) 
        is_channel_member = session.query(query.exists()).scalar()

        if not is_channel_member:
            isAuthorized=False
        else:
            isAuthorized=True

    
    return isAuthorized

        
    

    
    
    
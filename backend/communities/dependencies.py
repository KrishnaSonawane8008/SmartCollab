from fastapi import HTTPException, status
from database import session
from database_operations import get_table_by_name

#checks if the userid trying to access this data is present in the "Com(:community_id)_Users" table
#and is also present in the "Com(:community_id)_Channel(:channel_id)_Users" table
def AuthorizeCommunityUser(uid: int, community_id: int, channel_id: int):
    comm_users_table=get_table_by_name(f'Com{community_id}_Users')

    db=session()
    query = db.query().filter(comm_users_table.c.user_id == uid) 
    comm_user_exists = db.query(query.exists()).scalar()

    if not comm_user_exists:
        db.commit()
        db.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f'userid {uid} doesnt exist in the "Com{community_id}_Users"'
        )
    
    commChannel_users_table=get_table_by_name(f'Com{community_id}_Channel{channel_id}_ChannelUsers')

    query = db.query().filter(commChannel_users_table.c.user_id == uid) 
    channel_user_exists = db.query(query.exists()).scalar()

    if not channel_user_exists:
        db.commit()
        db.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f'userid {uid} doesnt exist in the "Com{community_id}_Channel{channel_id}_ChannelUsers"'
        )
    
    db.commit()
    db.close()
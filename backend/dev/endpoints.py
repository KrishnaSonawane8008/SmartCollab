from fastapi import APIRouter, Depends, Header, status, HTTPException
from sqlalchemy.orm import Session
from DB_Manipulation.dependencies import get_db
from DB_Manipulation.dev_operations import get_all_users_credentials, delete_call_log_from_db
from dotenv import load_dotenv
import os


load_dotenv()


router=APIRouter()

def verify_dev_key(DevKey:str=Header(None)):
    dev_key_Correct=os.getenv("DEV_MODE_KEY")==DevKey

    if dev_key_Correct:
        return DevKey

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Dev Key not correct"
    )


@router.get("/allUsers")
def user_communities( dev_key:str=Depends(verify_dev_key), db:Session=Depends(get_db) ):

    user_creds=get_all_users_credentials(session=db)

    return {"user_credentials": user_creds}


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TRANSCRIPTS_PATH = os.path.join(BASE_DIR, "transcriber", "storage", "transcripts")
SUMMARIES_PATH=os.path.join(BASE_DIR, "backend", "summary", "Genarated_Summaries")

@router.delete("/{communityId}/{channelId}/{call_log_id}/delete_call_log")
def delete_call_log( communityId:int, channelId:int, call_log_id:int, dev_key:str=Depends(verify_dev_key), db:Session=Depends(get_db) ):
    try:
        delete_call_log_from_db(
            community_id=communityId,
            channel_id=channelId,
            call_id=call_log_id,
            session=db
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="delete operation failed"
        )
    
    summary_file_path=os.path.join(SUMMARIES_PATH, f"{communityId}{channelId}_{call_log_id}_summary.json")
    if os.path.exists(summary_file_path):
        os.remove(summary_file_path)
    
    transcript_file_path = os.path.join(TRANSCRIPTS_PATH, f"{communityId}{channelId}_{call_log_id}_transcript.json")
    if os.path.exists(transcript_file_path):
        os.remove(transcript_file_path)

    return {"Success":True}
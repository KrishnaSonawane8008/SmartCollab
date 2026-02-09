from utilities.colour_print import Print
import time
import socket
from chats.redis_operations import RedisAPI
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy import select, FromClause
from models import MessageCreate
from database_models import Messages
from datetime import datetime, timezone

import sys, signal



DATABASE_URL=f'postgresql+psycopg2://app:12345@postgresdb:5432/smartcollab_postgresdb'



engine=create_engine(DATABASE_URL)
session = sessionmaker(autocommit=False, autoflush=False, bind=engine)





redis_api=RedisAPI(host='redis', port=6379, password="mysecretpassword")

Print.green(f"Worker Running {socket.gethostname()}")

STREAM_NAME = "chat_messages"
GROUP_NAME = "message_consumers"
CONSUMER_NAME = socket.gethostname()

try:
    redis_api.create_consumer_group(STREAM_NAME, GROUP_NAME)
except Exception as e:
    pass



db=session()

running = True


def shutdown_handler(signum, frame):
    global running

    redis_api.close_connection()
    db.close()
    Print.red("Shutting down worker...")
    running = False

signal.signal(signal.SIGTERM, shutdown_handler)
signal.signal(signal.SIGINT, shutdown_handler)



Print.green("Started Running")
while running:
    msg_ids=[]
    db_messages=[]
    # Read messages from the stream
    messages = redis_api.consume_from_stream(consumer_group_name=GROUP_NAME, consumer_name=CONSUMER_NAME, stream_name=STREAM_NAME, count=5, block_time=5000)
    if messages is not None:
        for stream, entries in messages:
            for id, data in entries:
                db_messages.append(MessageCreate(
                    sender_id=int(data["sender_id"]),
                    community_id=int(data["community_id"]),
                    channel_id=int(data["channel_id"]),
                    message=data["message"],
                    sent_at=datetime.now(timezone.utc)
                ))
                msg_ids.append(id)
                # print(f"Received message: {data}")
        if(len(msg_ids)>0):
            Print.yellow("messages acknowledged")
            # redis_api.redis_client.xack(
            #     STREAM_NAME, GROUP_NAME, *msg_ids
            # )
            query=select(Messages).limit(5)
            messages_from_db=db.execute(query).scalars().all()
            time.sleep(4)
            Print.magenta(messages_from_db)
            # print(msg_ids)
    else:
        time.sleep(1)



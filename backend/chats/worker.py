from utilities.colour_print import Print
import time
import socket
from chats.redis_operations import RedisAPI


redis_api=RedisAPI(host='redis', port=6379, password="mysecretpassword")

Print.green(f"Worker Running {socket.gethostname()}")

STREAM_NAME = "chat_messages"
GROUP_NAME = "message_consumers"
CONSUMER_NAME = socket.gethostname()

try:
    redis_api.create_consumer_group(STREAM_NAME, GROUP_NAME)
except Exception as e:
    pass

while True:
    # Read messages from the stream
    messages = redis_api.consume_from_stream(consumer_group_name=GROUP_NAME, consumer_name=CONSUMER_NAME, stream_name=STREAM_NAME, count=50, block_time=5000)
    if messages is not None:
        for message in messages:
            for data in message[1]:
                print(f"Received message: {data}")
    else:
        time.sleep(1)
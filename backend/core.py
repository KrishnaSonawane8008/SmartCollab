from typing import Optional
from chats.async_redis_operations import async_RedisAPI

#this is the global which is assigned RedisAPI() class, from the ./chats/async_redis_operations.py
#the value is assigned during app startup, to check how it is assigned, check lifespan method in main.py
#its meant to be used as a global in files which want to use teh asynchronous RedisAPI() functions
async_redis_api: Optional[async_RedisAPI]=None
async_redis_api_online: bool=False
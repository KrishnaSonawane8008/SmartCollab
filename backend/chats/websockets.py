from fastapi import APIRouter, WebSocket



router=APIRouter()


@router.websocket("/socket_test")
async def websocket_test(websocket: WebSocket):
    await websocket.accept()
    while True:
        data=await websocket.receive_text()
        await websocket.send_text(f"Message Recieved: {data}")
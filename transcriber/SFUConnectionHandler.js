const {io}=require('socket.io-client')
const chalk=require('chalk').chalkStderr
const crypto=require('crypto')
// import {io} from "socket.io-client"
// import chalk from "chalk"

class SFUConnectionHandler{
    socket=null
    //{ SSRC:{roomId, UserId, UserName},... }
    //used to identify roomid, userid, and username of the user that sent the packet
    PacketInfo=new Map()
    
    //{ roomId:{ {UserId:UserName} },... }
    //Stores DECODED, RTP packets with correct sequence in ascending order, i.e. [fisrt packet, second packet, third packet,...]
    Rooms=new Map()
    UniqueRoomIds=new Map()

    SFU_URL=null
    Remove_Pipeline=null
    HandleRoomClose=null
    CreateChunkStoreRoom=null
    ConvertChunksToWav=null

    connect=({SFU_URL, Remove_Pipeline, HandleRoomClose, CreateChunkStoreRoom, ConvertChunksToWav})=>{
        this.socket=io(SFU_URL,{rejectUnauthorized: false})
        this.SFU_URL=SFU_URL
        this.Remove_Pipeline=Remove_Pipeline
        this.HandleRoomClose=HandleRoomClose
        this.CreateChunkStoreRoom=CreateChunkStoreRoom
        this.ConvertChunksToWav=ConvertChunksToWav
        
        this.socket.on("connect",()=>{
            console.log(chalk.magenta("Socket Connected to SFU"))
            this.socket.emit("connect-Transcriber",{}, (response)=>{
                console.log(response)
            })
            this.socket.on("consumer-created", (props)=>{
                const {ssrc, roomId, UserId, UserName}=props
                const u_roomId=this.get_unique_roomId(roomId)
                this.PacketInfo.set(ssrc, {roomId:u_roomId, UserId, UserName})
                const room=this.Rooms.get(u_roomId)
                if(room){
                    room.set(UserId, UserName)
                    console.log(chalk.green(`Added ${UserName} to Room ${u_roomId}`))
                }else{
                    this.Rooms.set(u_roomId, new Map([ [UserId, UserName] ]))
                    if(this.CreateChunkStoreRoom){
                        this.CreateChunkStoreRoom(u_roomId)
                    }
                    // audioWebSocketHandler.OnNewUserJoined(roomId, UserId, UserName)
                    console.log(chalk.green(`Added ${UserName} to Room ${u_roomId}, Initialized Room ${u_roomId}`))
                }



            })

            this.socket.on("consumer-closed", (props)=>{
                const {ssrc, roomId, UserId, UserName}=props
                const u_roomId=this.get_unique_roomId(roomId)
                this.PacketInfo.delete(ssrc)
                const room=this.Rooms.get(u_roomId)
                if(room){
                    room.delete(UserId)
                    console.log(chalk.magenta(`Removed ${UserName} from Room ${u_roomId.split("_")[0]}`))
                    this.Remove_Pipeline(u_roomId, UserId)
                }
            })

            this.socket.on("transcriber-room-closed", (props)=>{

                const {roomId, call_id, call_info}=props

                const u_roomId=this.get_unique_roomId(roomId)
                for(const [UserId, UserName] of this.Rooms.get(u_roomId)){
                    this.Remove_Pipeline(u_roomId, UserId)
                }
                this.Rooms.delete(u_roomId)
                this.HandleRoomClose(u_roomId, call_id)
                this.delete_unique_roomId(roomId)
                if(this.Rooms.size==0){
                    if(this.ConvertChunksToWav){
                        this.ConvertChunksToWav()
                    }
                }
                console.log(chalk.magenta(`Deleted Room ${u_roomId}`))
                console.log(u_roomId, call_info)

            })
            
            

        })
        
    }

    get_unique_roomId(roomId){
        const unique_roomid=this.UniqueRoomIds.get(roomId)
        if(!unique_roomid){
            const uuid=crypto.randomUUID()
            const new_room_id=`${roomId}_${uuid}`
            this.UniqueRoomIds.set(roomId, new_room_id)
            return new_room_id
        }

        return unique_roomid
    }

    delete_unique_roomId(roomId){
        this.UniqueRoomIds.delete(roomId)
    }
}

// export const SFUConnectionHandler = new SFUConnectionHandler()
module.exports={SFUConnectionHandler: new SFUConnectionHandler()}
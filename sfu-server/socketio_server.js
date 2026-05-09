const chalk=require("chalk")
const webrtc_funcs=require("./webrtc_functions")
const TranscriberConnectionHandler=require("./transcriberConnectionHandler")
const api_calls=require("./FastAPIServer_APICalls")
const Rooms=new Map()
const CallLogData=new Map()

function initialize_socketio_Server(allowed_origins, server){
    const io=require("socket.io")(server, {
        cors:{
            origin: "*"
        }
    })

    function cleanup(socket){
        const joined_rooms=Array.from(socket.rooms).filter(
                                (item) => item !== socket.id
                            );

        for(const roomid of joined_rooms){
            const room=Rooms.get(roomid)
            if(room){
                const {peers, producers, consumers}=room
                const peer=peers.get(socket.id)
                if(peer){
                    peer.sendTransport?.close()
                    peer.recvTransport?.close()
                    for(const producerId of peer.producerIds){
                        const producer=producers.get(producerId)
                        if(producer){
                            // console.log(chalk.yellow(`${socket.id}: producer with prod_id ${producerId} closed`))
                            producer.close()
                            producers.delete(producerId)
                        }
                    }
                    for(const consumerId of peer.consumerIds){
                        const consumer=consumers.get(consumerId)
                        if(consumer){
                            consumer.close()
                            consumers.delete(consumerId)
                        }
                    }
                    io.in(roomid).emit("closeConsumers",{producerIds: peer.producerIds})

                    peers.delete(socket.id)
                    if(peers.size==0){
                        const log=CallLogData.get(roomid)
                        if(log){
                            log.ended_at=Date.now()

                            TranscriberConnectionHandler.callEnded(roomid, {...log})

                            CallLogData.delete(roomid)
                        }

                        Rooms.delete(roomid)
                        console.log(chalk.magenta(`deleted room ${roomid}`))
                    }
                }
            }
        }
    }

    io.on('connection', (socket) => {
        console.log(chalk.green(`client ${socket.id} connected to sfu`))
        socket.emit("get_peerid",socket.id)

        socket.on('disconnect', (reason) => {
            console.log(chalk.red(`client ${socket.id} disconnected because: ${reason}`));
        })

        socket.on('disconnecting', () => {
            
            cleanup(socket)

        });

        socket.on("custom-event", (props)=>{
            console.log(chalk.yellow(`recieved from client:`),props)
        })

        socket.on("start_call", async (props)=>{

            // community_id=Column(Integer, nullable=False)
            // channel_id=Column(Integer, nullable=False)
            // call_topic=Column(String, default="Call")
            // call_starter_id=Column(Integer, ForeignKey("Users.user_id"), nullable=False)
            // call_starter_name=Column(String, ForeignKey("Users.user_name"), nullable=False)
            // started_at=Column(DateTime(timezone=True))
            // ended_at=Column(DateTime(timezone=True))
            // call_participants=Column(JSON)
            try{
                const {communityId, channelId, call_topic, call_starter_id, call_starter_name}=props
                console.log(chalk.yellow(`recieved this data from client: ${communityId}, ${channelId}, ${call_topic}, ${call_starter_id}, ${call_starter_name}`))

                if(!call_starter_name){
                    throw new Error("User Name missing")
                }

                await api_calls.is_user_authorized(call_starter_id, communityId, channelId).then(async (response)=>{
                    if(response.Success===true){


                        const room_already_exists=Rooms.get(`${communityId}${channelId}`)

                        if(!call_topic && !room_already_exists){
                            throw new Error("Call Topic missing")
                        }
                
                        const {router, worker, WebRTCServer, peers}=await getOrCreateRoom(`${communityId}${channelId}`)
                        socket.join(`${communityId}${channelId}`)
                        console.log(chalk.yellow(`client ${socket.id} joined room ${communityId}${channelId}`))
                        peers.set(socket.id, {socket: socket, producerIds:[], consumerIds:[], consumed_ProducerIds:new Map(), sendTransport:null, recvTransport:null} )
                        
                        if(!room_already_exists){
                            
                            const call_start_info={
                                community_id:communityId,
                                channel_id:channelId,
                                call_topic:call_topic,
                                call_starter_id:call_starter_id,
                                call_starter_name:call_starter_name,
                                started_at:Date.now()
                            }

                            await api_calls.call_started(communityId, channelId, call_start_info).then((response)=>{
                                if(response.Success===true){
                                    let log=CallLogData.get(`${communityId}${channelId}`)
                                    if(!log){
                                        CallLogData.set(`${communityId}${channelId}`, {
                                                community_id:communityId,
                                                channel_id:channelId,
                                                call_topic:call_topic,
                                                call_starter_id:call_starter_id,
                                                call_starter_name:call_starter_name,
                                                started_at:Date.now(),
                                                ended_at:null,
                                                call_participants:[call_starter_name]
                                            }
                                        )
                                    }


                                }
                            }).catch((e)=>{
                                throw e
                            })
                        }else{
                            let log=CallLogData.get(`${communityId}${channelId}`)
                            console.log(room_already_exists)
                            log.call_participants.push(call_starter_name)
                        }

                        // console.log(router.rtpCapabilities)
                        socket.emit("getRtpCapabilities", router.rtpCapabilities)

                    }
                }).catch((e)=>{
                    throw e
                })
            }catch(e){
                console.error(e)
                // cleanup(socket)
                socket.disconnect(true)
            }

        })




        socket.on("connect-Transcriber", async (props, callback)=>{
            console.log(chalk.green(`Transcriber client with id ${socket.id} connected`))

            await TranscriberConnectionHandler.connect(socket)
            if(TranscriberConnectionHandler.ready===true){
                console.log(chalk.blueBright("TRANSCRIBER READY"))
                // Rooms.set(room_id, {router, worker, WebRTCServer, peers, producers, consumers})
                for(const [roomId, Room] of Rooms){
                    const router=Room.router
                    const producers=Room.producers
                    for(const [key, val] of producers){
                        if(val.kind==="audio"){
                            TranscriberConnectionHandler.createConsumer(
                                router, 
                                val.id,
                                `${roomId}`,
                                val.appData.userId, 
                                val.appData.userName
                            )  
                        }
                    }
                } 
            }
            callback("connected Transport")
        })


        socket.on("createWebRtcTransport", async (props)=>{
            
            const {communityId, channelId, rtpCapabilities}=props
            const {router, WebRTCServer, peers, producers, consumers}=await getOrCreateRoom(`${communityId}${channelId}`)
            // console.log(router, worker, WebRTCServer)
            const sendTransport=await webrtc_funcs.createWebRtcTransport(router, WebRTCServer, socket.id)
            const recvTransport=await webrtc_funcs.createWebRtcTransport(router, WebRTCServer, socket.id)
            
            const peer=peers.get(socket.id)
            peer.sendTransport=sendTransport
            peer.recvTransport=recvTransport

            sendTransport.on("close", ()=>{
                console.log(chalk.red(`sendTransport for ${socket.id} closed`))
            })

            recvTransport.on("close", ()=>{
                console.log(chalk.red(`recvTransport for ${socket.id} closed`))
            })

            socket.emit("createTransports", {
                    sendTransportParams:{
                        id             : sendTransport.id,
                        iceParameters  : sendTransport.iceParameters ,
                        iceCandidates  : sendTransport.iceCandidates ,
                        dtlsParameters : sendTransport.dtlsParameters,
                        sctpParameters : sendTransport.sctpParameters
                    },
                    recvTransportParams:{
                        id             : recvTransport.id,
                        iceParameters  : recvTransport.iceParameters ,
                        iceCandidates  : recvTransport.iceCandidates ,
                        dtlsParameters : recvTransport.dtlsParameters,
                        sctpParameters : recvTransport.sctpParameters
                    }
            })


            // transport.on("icestatechange", state => {
            //     console.log("SERVER ICE:", state);
            // });

            // transport.on("dtlsstatechange", state => {
            //     console.log("SERVER DTLS:", state);
            // });

            socket.on("connectSendTransport",async (props, callback)=>{
                const {dtlsParameters}=props
                await sendTransport.connect({dtlsParameters:dtlsParameters})
                callback({success: true})
                console.log(chalk.green(`Connected sendTransport for client: ${socket.id}`))
            })

            socket.on("connectRecvTransport",async (props, callback)=>{
                const {dtlsParameters}=props
                await recvTransport.connect({dtlsParameters:dtlsParameters})
                callback({success: true})
                console.log(chalk.green(`Connected recieveTransport for client: ${socket.id}`))
            })


            socket.on("createProducer", async (props, callback)=>{
                const {
                        kind,
                        rtpParameters,
                        appData       
                    }=props
                try{
                    const producer=await sendTransport.produce(
                        {
                            kind: kind,
                            rtpParameters: rtpParameters,
                            appData: appData
                        }
                    )
                    if(kind=="audio"){
                        if(TranscriberConnectionHandler.ready===true){
                            TranscriberConnectionHandler.createConsumer(
                                router, 
                                producer.id,
                                `${communityId}${channelId}`,
                                appData.userId, 
                                appData.userName
                            )
                        }
                    }
                    console.log(chalk.blue(`${socket.id}: ${kind} Producer Created with prod_id ${producer.id}`))
                    producer.on("transportclose", ()=>{
                        console.log(chalk.yellow(`${socket.id}: producer with prod_id ${producer.id} closed`))
                    })
                    let peerInfo=peers.get(socket.id)
                    peerInfo.producerIds.push(producer.id)
                    producers.set(producer.id, producer)
                    peers.set(socket.id, peerInfo)
                
                    callback({success: true, producerid:producer.id})
                    

                    // emit to all clients in the room `${communityId}${channelId}` excluding the sender
                    socket.to(`${communityId}${channelId}`).emit("producerCreated",{producer_id: producer.id})
                    if(peers.size>1){
                        socket.emit("producerCreated",{own_producer_id: producer.id}) 
                    }
                    // console.log("---------------",socket.id,"createProducer------------------")
                    // console.log(socket.id,"Producers: ",peers.get(socket.id)?.producerIds)
                    // console.log(socket.id,"Consumers: ",peers.get(socket.id)?.consumerIds)
                    // console.log("-----------------------------------------------")
                }catch(e){
                    console.log(e)
                }
            })

            socket.on("ToggleVideoProducer",async (props)=>{
                const {producerId, isOn}=props
                const vidproducer=producers.get(producerId)
                if(isOn===true){
                    await vidproducer?.resume()
                    console.log(chalk.green("Video On"))
                }else if(isOn===false){
                    await vidproducer?.pause()
                    console.log(chalk.magenta("Video Off"))
                }

            })

            socket.on("ToggleAudioProducer",async (props)=>{
                const {producerId, isOn}=props

                const audio_producer=producers.get(producerId)
                if(isOn===true){
                    await audio_producer?.resume()
                    if(TranscriberConnectionHandler.ready===true){
                        await TranscriberConnectionHandler.toggleConsumer(producerId, isOn)
                    }
                }else if(isOn===false){
                    await audio_producer?.pause()
                    if(TranscriberConnectionHandler.ready===true){
                        await TranscriberConnectionHandler.toggleConsumer(producerId, isOn)
                    }
                }

            })

            socket.on("closeScreenShareConsumers", async (props, callback)=>{
                const {producerid}=props
                io.in(`${communityId}${channelId}`).emit("closeConsumers",{producerIds: [producerid]})

                const {peers, producers, consumers}=await getOrCreateRoom(`${communityId}${channelId}`)
                //peers.set(socket.id, 
                //          {socket: socket, 
                //          producerIds:[], 
                //          consumerIds:[], 
                //          consumed_ProducerIds=new Map()
                //          sendTransport:null, 
                //          recvTransport:null} )
                for(const [socketId, peer] of peers){
                    if(socketId==socket.id){
                        if (peer.producerIds.includes(producerid)) {
                            peer.producerIds.splice(peer.producerIds.indexOf(producerid), 1);
                        }
                        const producer=producers.get(producerid)
                        if(producer){
                            producer.close()
                            producers.delete(producerid)
                        }

                    }else{
                        const consumerId=peer.consumed_ProducerIds.get(producerid)
                        if(consumerId){
                            if (peer.consumerIds.includes(consumerId)) {
                                peer.consumerIds.splice(peer.consumerIds.indexOf(consumerId), 1);
                            }

                            peer.consumed_ProducerIds.delete(producerid)
                            const consumer=consumers.get(consumerId)
                            if(consumer){
                                consumer.close()
                                consumers.delete(consumerId)
                            }
                        }
                    }
                }

                callback({success:true})
            })

            socket.on("createConsumers", async (props, callback)=>{
                const ProducerIdsforRoom=getAllRoomProducerIds_ExceptSelf(`${communityId}${channelId}`, socket.id)
                // console.log(chalk.green(`for ${socket.id} producer_ids_being_consumed:`),producer_ids_being_consumed)
                // console.log(chalk.green(`for ${socket.id} producer_ids_self:`),producer_ids_self)
                let peerInfo=peers.get(socket.id)
                const consumable_producerids=ProducerIdsforRoom.filter((producerid)=>{
                                    if(![...peerInfo.consumed_ProducerIds.keys()].includes(producerid)){
                                        return true
                                    }
                                } )
                
                // console.log(chalk.green(`for ${socket.id} consumable_producerids:`),consumable_producerids)
                const consumers_props=[]
                for(const producerid of consumable_producerids){

                    if(router.canConsume({
                        producerId:producerid,
                        rtpCapabilities:rtpCapabilities
                    })){
                        const producer=producers.get(producerid)
                        const consumer=await recvTransport.consume({
                                            producerId:producerid,
                                            rtpCapabilities:rtpCapabilities
                                        });
                        consumer.on("producerclose",async ()=>{

                            const {peers, consumers}=await getOrCreateRoom(`${communityId}${channelId}`)
                            const peer=peers.get(socket.id)
                            const consumerId=consumer.id
                            if(peer){
                                if (peer.consumerIds.includes(consumerId)) {
                                    peer.consumerIds.splice(peer.consumerIds.indexOf(consumerId), 1);
                                }
                                peer.consumed_ProducerIds.delete(producerid)
                                consumers.delete(consumerId)
                                console.log(chalk.yellow(`${socket.id}: consumer for prod_id ${producerid} closed`))
                            }
                        })

                        consumer.on("transportclose",async ()=>{
                            console.log(chalk.yellow(`${socket.id}: consumer for prod_id ${producerid} closed`))
                        })
                        
                        let peerInfo=peers.get(socket.id)
                        peerInfo.consumerIds.push(consumer.id)
                        peerInfo.consumed_ProducerIds.set(producerid, consumer.id)
                        consumers.set(consumer.id, consumer)
                        peers.set(socket.id, peerInfo)

                        consumers_props.push({
                            consumerid: consumer.id,
                            producerid: producerid,
                            kind: consumer.kind,
                            rtpParameters: consumer.rtpParameters,
                            appData:producer.appData
                        })

                        console.log(chalk.cyan(`${socket.id}: ${consumer.kind} Consumer Created for prod_id ${producerid}`))
                    }
                }
                // console.log("----------------",socket.id,"createConsumers----------------")
                // console.log(socket.id,"Producers: ",peers.get(socket.id)?.producerIds)
                // console.log(socket.id,"Consumers: ",peers.get(socket.id)?.consumerIds)
                // console.log(socket.id,"Consumed Producerids: ",producer_ids_being_consumed)
                // console.log("-----------------------------------------------")
                callback({consumers_props})

            })



        })


        
    });
}


async function getOrCreateRoom(room_id){
    let room=Rooms.get(room_id)
    if(room) return room

    const {router, worker, WebRTCServer}=await webrtc_funcs.create_router()
    const peers=new Map()
    //peers.set(socket.id, 
    //          {socket: socket, 
    //          producerIds:[]=>stores producerIds of producers of this client 
    //          consumerIds:[]=>stores consumerIds of consumers of this client

    //          consumed_ProducerIds=new Map()=>Map(producerID, consumerID) 
    //          where producerId belongs to the producer of 
    //          the other client's transport and consuemrid  belongs
    //          to this client

    //          sendTransport:null, 
    //          recvTransport:null} )
    const producers=new Map()
    const consumers=new Map()
    Rooms.set(room_id, {router, worker, WebRTCServer, peers, producers, consumers})
    console.log(chalk.green(`Room ${room_id} created`))
    return {router, worker, WebRTCServer, peers, producers, consumers}

}

async function getOrCreateCallLog(communityId, channelId, call_topic, call_starter_id, call_starter_name){
    let log=CallLogData.get(`${communityId}${channelId}`)
    if(log) return log
    // community_id=Column(Integer, nullable=False)
    // channel_id=Column(Integer, nullable=False)
    // call_topic=Column(String, default="Call")
    // call_starter_id=Column(Integer, ForeignKey("Users.user_id"), nullable=False)
    // call_starter_name=Column(String, ForeignKey("Users.user_name"), nullable=False)
    // started_at=Column(DateTime(timezone=True))
    // ended_at=Column(DateTime(timezone=True))
    // call_participants=Column(JSON)
    CallLogData.set(`${communityId}${channelId}`, {
            community_id:communityId,
            channel_id:channelId,
            call_topic:call_topic,
            call_starter_id:call_starter_id,
            call_starter_name:call_starter_name,
            started_at:Date.now(),
            ended_at:null,
            call_participants:[call_starter_name]
        }
    )

    return CallLogData
}


function getRoomProducerIds(room_id){
    let room=Rooms.get(room_id)
    if(!room) throw new Error("Trying to consume in a room that doesnt exist")
    const ProducerIds=[]
    for(const [peerId, peer] of room.peers){
        ProducerIds.push(...peer.producerIds)
    }

    return ProducerIds
}

function getAllRoomProducerIds_ExceptSelf(room_id, socketid){
    let room=Rooms.get(room_id)
    if(!room) throw new Error("Trying to consume in a room that doesnt exist")
    const ProducerIds=[]
    for(const [peerId, peer] of room.peers){
        if(peerId!=socketid){
            ProducerIds.push(...peer.producerIds)
        }
    }

    return ProducerIds
}


module.exports={initialize_socketio_Server}
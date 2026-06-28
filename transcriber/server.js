const express = require('express');
const http = require('http')
const {SFUConnectionHandler}=require('./SFUConnectionHandler')
require("dotenv").config()
const dgram=require('dgram')
const UserPipeline=require("./Pipeline")
const PORT=process.env.PORT
const SFU_URL=process.env.SFU_URL
const fs=require('fs')
const path=require('path')

const app = express();
const server = http.createServer(app);
const socket=dgram.createSocket('udp4')
const LiveAudioService = require('./services/liveAudioService');
const {writeChunksToWav}=require('./PipelineTest/PipellineTest');
const { default: chalk } = require('chalk');
const WhisperRunner = require('./services/transcription/whisperRunner');


SFUConnectionHandler.connect({
                                SFU_URL:SFU_URL, 
                                Remove_Pipeline,
                                HandleRoomClose, 
                                CreateChunkStoreRoom,
                                ConvertChunksToWav
                              })


const Rooms=new Map()
// this.bufferDuration = options.bufferDuration || 8000; // 8 seconds default
//     this.sampleRate = options.sampleRate || 16000;
//     this.channels = options.channels || 1;
//     this.bitDepth = options.bitDepth || 16;
const liveAudioService = new LiveAudioService({
  bufferDuration: 8000, // 8 seconds
  sampleRate:48000,
  maxConcurrent: 2,
  modelPath: 'whisper/models/ggml-base.en.bin',
  WhisperRunner_Logs:false,
  TranscriptionQueue_Logs:false,
  WAVWriter_Logs:false,
  LiveAudioService_Logs:false,
  TranscriptStore_Logs:false
});


socket.on('message', (msg)=>{
  const ssrc=msg.readUint32BE(8);
  // console.log(msg)
  const sequenceNumber = msg.readUInt16BE(2);
  
  const PacketInfo=SFUConnectionHandler.PacketInfo.get(ssrc)
  if(!PacketInfo) return
  const {roomId, UserId, UserName}=PacketInfo

  let room=Rooms.get(roomId)

  if(!room){
    const Pipelines=new Map()
    pipeline=new UserPipeline()
    Pipelines.set(UserId, pipeline)
    Rooms.set(roomId, {Pipelines:Pipelines})
  }else{
    const Pipelines=room.Pipelines
    const pipeline=Pipelines.get(UserId)
    if(!pipeline){
      const new_pipeline=new UserPipeline()
      Pipelines.set(UserId, new_pipeline)
      new_pipeline.handleRtpPacket(msg, sequenceNumber)
    }else{
      pipeline.handleRtpPacket(msg, sequenceNumber)
    }

  }
  
})


socket.bind(PORT)

let count=0
const Rooms_tobeDeleted=new Map()
const PipeLines_tobeDeleted=new Map()
setInterval(() => {

  for(const [roomId, map] of Rooms){
    for(const [UserId, pipeline] of map.Pipelines){
      pipeline.process(10);

      const TimeStamp=Date.now()
      const chunk = pipeline.getChunkIfReady();

      const AllRoomChunks=AllChunks_Roomwise.get(roomId)

      if (chunk?.pcm_chunk) {

        if(!AllRoomChunks.has(count)){
          AllRoomChunks.set(count, [])
        }
        
        AllRoomChunks.get(count).push(chunk.pcm_chunk)

        liveAudioService.handleAudioChunk(
          roomId,
          UserId,
          chunk.pcm_chunk,
          TimeStamp
        );
      }

      if(PipeLines_tobeDeleted.get(`${roomId}_${UserId}`)){
        if(pipeline.getJBlength()==0){
          actual_Remove_Pipeline(roomId, UserId)
          PipeLines_tobeDeleted.delete(`${roomId}_${UserId}`)
        }else{
          const Jbuffer=pipeline.jitterBuffer.getJitterBuffer()
          // console.log(chalk.cyan(`User${UserId} Jitter buffer Length: ${pipeline.getJBlength()}, ${Jbuffer.values()}`))
        }
      }

    }

    const del_room_CallId=Rooms_tobeDeleted.get(roomId)
    if(del_room_CallId){
      if(Rooms.get(roomId)?.Pipelines?.size==0){
        actual_room_close(roomId, del_room_CallId)
        Rooms_tobeDeleted.delete(roomId)
      }
    }

  }

  count++
}, 20);// call every 10ms

function Remove_Pipeline(roomId, UserId){
  PipeLines_tobeDeleted.set(`${roomId}_${UserId}`, true)
  console.log(chalk.blue(`Removing pipleine for User${UserId} of room ${roomId}`))
}

function actual_Remove_Pipeline(roomId, UserId){
  const pipeline=Rooms.get(roomId)?.Pipelines.get(UserId)
  if(pipeline){
    console.log(chalk.yellow("Jitter Buffer Length At the end:"),pipeline.getJBlength())
  }
  Rooms.get(roomId)?.Pipelines?.delete(UserId)
}

function HandleRoomClose(roomId, call_id){
  Rooms_tobeDeleted.set(roomId, call_id)
}

function actual_room_close(u_roomId, call_id){
  liveAudioService.handleRoomEnded(u_roomId)
  const files = fs.readdirSync('./storage/transcripts');

  const roomId=u_roomId.split("_")[0]
  
  const target = `${u_roomId}_transcript.json`;
  if (files.includes(target)) {
    const filename = `${u_roomId}_transcript.json`;
    const new_file_name=`${roomId}_${call_id}_transcript.json`;
    const filePath = path.join('./storage/transcripts', filename);
    const new_filePath=path.join('./storage/transcripts', new_file_name);
    
    
    fs.rename(filePath, new_filePath, (err) => {
      if (err){
        console.log(chalk.red(err))
      }
      console.log('Rename complete!');
    });
  }

  console.log(chalk.green("Room Closed. Transcriber Closed also"))
}



//Contains Code necesary for Pipeline Test only
//====================================================================
const AllChunks_Roomwise=new Map()

function CreateChunkStoreRoom(roomId){
  AllChunks_Roomwise.set(roomId, new Map())
}

function ConvertChunksToWav(){
  for(const [roomId, AllChunks] of AllChunks_Roomwise){
    // console.log(AllChunks)
    writeChunksToWav(AllChunks, `Room${roomId.split("_")[0]}_Audio.wav`, 48000);
  }
}

//===================================================================





server.listen(PORT, () => {
  console.log(`🚀 SmartCollab Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log('🎙️ Audio processing service: READY');
});
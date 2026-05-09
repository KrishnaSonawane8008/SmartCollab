import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Video, VideoOff, Mic, MicOff, ScreenShare, ScreenShareOff, Camera, CameraOff, PhoneOff, Loader2, Flag } from "lucide-react"
import { socketio_client } from "../../api/socketio_client"
import { useEffect, useRef, useCallback, useState, useContext } from "react"
import { webrtc_client } from "../../api/webrtc_client"
import chalk from "chalk"
import { ChatLayout_Context } from "../../contexts/ChatLayout-context-provider"
import { Global_Context } from "../../contexts/Global-context-provider"
import { is_user_authorized } from "../../services/user_services"
import ScrollBar from "../common components/ScrollBar"
import CenterFloatingDiv from "../common components/CenterFloatingDiv"
import { WebsocketsContext } from "../../contexts/WebSockets-context-provider"

const Header=()=>{
    const navigate=useNavigate()
    const url_params=useParams()
    return(
        <div className="py-8 h-[2.75rem] w-full flex-shrink-0 flex items-center px-8 justify-between border-b border-black/[0.05] bg-[#f5f3ef]">
            <button
                className="ml-1 text-gray-900 p-1 select-none cursor-pointer rounded-full"
                onClick={()=>{
                    if(!url_params
                        || !url_params.communityId || !url_params.channelId
                    ) return
                    navigate(`/chats/${url_params.communityId}/${url_params.channelId}`)
                }}
            >
                <ArrowLeft className="h-[20px] w-[20px]"/>
            </button>


        </div>

        

    )
}


const Footer=()=>{
    return(
        <div className="w-full h-full bg-gray-800 max-h-[2.5rem] ">
            
        </div>
    )
}

const LocalVideoControls=({streamName, stream_map, setScreenShareToggle, ScreenShareToggle, callback, cleanup_cb})=>{

    const [MicMuted, setMicMuted]=useState(false)
    const [CamOff, setCamOff]=useState(false)

    const stream=stream_map.get("videoCall")

    // console.log(chalk.magenta(`${stream}`))
    callback()
    if(!(stream instanceof MediaStream)) {
        return
    }


    // useEffect(()=>{

    // },[MicMuted])

    // useEffect(()=>{

    // },[CamOff])





    return(
        <div className="relative w-full flex flex-col rounded-2xl">
            {/* <div className="absolute bottom-[75px] bg-yellow-400 flex flex-row w-full h-full justify-center object-contain p-2">
                a
                <video className="w-[300px] h-[300px]" ref={videoRef} autoPlay muted></video>
            </div> */}
            {
                streamName==="videoCall" && (
                <div className="flex flex-row justify-center items-center ">
                    <div className="flex items-center bg-[#1e2939] p-3 rounded-full">
                        <div 
                            onClick={async ()=>{
                                    await webrtc_client.ToggleAudio(!webrtc_client.mic_muted)
                                    setMicMuted(!MicMuted)
                                }}
                            className="rounded-full bg-blue-400 flex flex-row justify-center items-center w-[40px] h-[40px] relative group ml-2 mr-1"
                        >
                            <div className="absolute w-[90%] h-[90%] bg-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></div>
                            {
                                webrtc_client.mic_muted? 
                                    (
                                        <MicOff stroke="#ffffff" className="relative" size={20}/>
                                    ):(
                                        <Mic stroke="#ffffff" className="relative" size={20}/>
                                    )
                            }
                        </div>
                        <div 
                            onClick={async ()=>{
                                    await webrtc_client.ToggleVideo(!webrtc_client.camera_off) 
                                    setCamOff(!CamOff)
                                }}
                            className="rounded-full bg-blue-400 flex flex-row justify-center items-center w-[40px] h-[40px] relative group mx-1"
                        >
                            <div className="absolute w-[90%] h-[90%] bg-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></div>
                            {
                                webrtc_client.camera_off? 
                                    (
                                        <CameraOff stroke="#ffffff" className="relative" size={20}/>
                                    ):(
                                        <Camera stroke="#ffffff" className="relative" size={20}/>
                                    )
                            }
                        </div>
                        <div 
                            onClick={async ()=>{
                                await webrtc_client.ToggleScreenShare(!ScreenShareToggle)
                                    setScreenShareToggle(!ScreenShareToggle)
                                }}
                            className="rounded-full bg-blue-600 flex flex-row justify-center items-center w-[40px] h-[40px] relative group mx-1"
                        >
                            <div className="absolute w-[90%] h-[90%] bg-blue-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></div>
                            {
                                ScreenShareToggle?
                                    (
                                        <ScreenShareOff stroke="#ffffff" className="relative" size={20} />
                                    ):(
                                        <ScreenShare stroke="#ffffff" className="relative" size={20} />
                                    )
                            }
                        </div>
                        <div className="h-full relative ml-5 pr-2 flex flex-col justify-center items-center">
                            <div 
                                className="absolute h-[35px] w-[1px] bg-gray-600"
                            ></div>
                        </div>
                        <div 
                            onClick={()=>{
                                cleanup_cb()
                            }}
                            className="rounded-full bg-red-400 flex flex-row justify-center items-center w-[40px] h-[40px] relative group ml-1 mr-2"
                        >
                            <div className="absolute w-[90%] h-[90%] bg-red-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></div>
                            <PhoneOff stroke="#ffffff" className="relative" size={20}/>
                        </div>
                    </div>
                </div>
            )
            }
        </div>
    )
}



const LocalVideoPlayer=({stream_map, callback})=>{



    const stream=stream_map.get("videoCall")

    // console.log(chalk.magenta(`${stream}`))
    callback()
    if(!(stream instanceof MediaStream)) {
        return
    }



    const videoRef=useCallback((node)=>{
        if(node){
            node.srcObject=stream
        }
    },[stream])

    return(
        <div className="relative w-full h-full overflow-hidden flex flex-col justify-center items-center object-contain bg-[#1e2939] rounded-2xl">
                <video className="w-full h-full " ref={videoRef} autoPlay muted></video>
        </div>
    )
}



const RemoteVideoPlayer=({stream, callback})=>{

    // console.log(stream)
    callback()
    if(!(stream instanceof MediaStream)) {
        return
    }


    const videoRef=useCallback((node)=>{
        if(node){
            node.srcObject=stream
        }
    },[stream])

    return(
        <div className="relative flex flex-col justify-center items-center rounded-2xl overflow-hidden w-full h-full ">
            <div className="relative flex w-full h-full flex-col justify-center items-center object-contain rounded-2xl overflow-hidden bg-[#1e2939]">
                <video className="w-full h-full rounded-2xl"   ref={videoRef} autoPlay></video>
            </div>
        </div>
    )
}


const RemoteAudioPlayer=({stream, callback})=>{

    // console.log(stream)
    callback()
    if(!(stream instanceof MediaStream)) {
        return
    }


    const audioRef=useCallback((node)=>{
        if(node){
            node.srcObject=stream
        }
    },[stream])

    return(
        <audio ref={audioRef} autoPlay></audio>
    )
}


const ScheduleMeeting=({start_call})=>{
    const url_params=useParams()
    const input_bar_ref=useRef(null)
    const [Text, setText]=useState("")
    const [error, setError]=useState(null)
    const [isLoading, setLoading]=useState(false)
    const {setNotificationsPopup}=useContext(WebsocketsContext)
    const {user_id, user_name, OngoingCalls, setJoinedCall, JoinedCall}=useContext(ChatLayout_Context)

    const isCallPresent=OngoingCalls?.[url_params.communityId]?.[url_params.channelId]


    useEffect(()=>{
        if(!JoinedCall) return
        if(JoinedCall.community_id===url_params.communityId && JoinedCall.channel_id===url_params.channelId){
            StartCall()
            setJoinedCall(null)
        }
    },[JoinedCall])

    function on_sfu_disconnect(){
        setLoading(false)
    }

    

    function on_sfu_reconnect_fail(){
        setLoading(false)
        setNotificationsPopup((prev)=>[...prev, 
                    {
                        id:prev.length+1, 
                        timeout_length:3500,
                        message: {
                                    type:"Error", 
                                    message:"Connection Failed, Please Retry"
                                }
                    }
                ])
    }

    const update_text=(e)=>{
        if(String(e.target.value).trim().length>0){
            setText(String(e.target.value))
        }else{
            setText("")
        }
    }


    const StartCall=()=>{
        if(webrtc_client.device) return
        start_call(on_sfu_disconnect, on_sfu_reconnect_fail)
        setLoading(true)
        is_user_authorized(url_params.communityId, url_params.channelId).then((response)=>{
            if(response.Success===true){
                socketio_client.emit("start_call", 
                    {   
                        communityId:url_params.communityId, 
                        channelId:url_params.channelId,
                        call_topic:Text,
                        call_starter_id:user_id,
                        call_starter_name:user_name
                    })
            }
        }).catch((error)=>{
            setLoading(false)
            setError(error)
        })
    }

    if(error){
        throw error
    }
    return(
        <div className="flex flex-row w-full h-full justify-center pt-10 bg-[#f5f3ef] ">
            {   
                isCallPresent?(
                    <div className="flex flex-col items-center">
                        <h1 className="text-[1rem] mb-5">Ongoing Video Call</h1>
                        <div className="flex flex-row items-center gap-[0.8rem]">
                            <button 
                                className={`flex  ${isLoading?"bg-[#234b3d] cursor-not-allowed":"bg-[#225e48] cursor-pointer"} rounded-full w-fit h-fit py-2 px-3 gap-[0.5rem] flex-row justify-center items-center select-none`}
                                onClick={()=>{
                                        StartCall()
                                    }}
                                disabled={isLoading}
                            >
                                {
                                    isLoading===true?(
                                        <div className="flex-1 flex justify-center items-center">
                                            <div className="w-5 h-5 border-2 border-[#347361] border-t-[#e3f2ee] rounded-full animate-spin" />
                                        </div>
                                    ):(
                                        <Video className="" stroke={`${isLoading?"#cec5b6":"#f2e8d7"}`} size={18}/>
                                    )
                                }
                                <div
                                    className={`${isLoading?"text-[#cec5b6]":"text-[#f2e8d7]"} text-[0.8rem]`}
                                >
                                    Join
                                </div>
                            </button>
                        
                        </div>
                    </div>
                ):(
                    <div className="flex flex-col items-center">
                        <h1 className="text-[1rem] mb-5">Start a Video Call</h1>
                        <div className="flex flex-row items-center gap-[0.8rem]">
                            <button 
                                className={`flex  ${Text.length==0 || isLoading?"bg-[#234b3d] cursor-not-allowed":"bg-[#225e48] cursor-pointer"} rounded-full w-fit h-fit py-2 px-3 gap-[0.5rem] flex-row justify-center items-center select-none`}
                                onClick={()=>{
                                        StartCall()
                                    }}
                                disabled={Text.length==0 || isLoading}
                            >
                                {
                                    isLoading===true?(
                                        <div className="flex-1 flex justify-center items-center">
                                            <div className="w-5 h-5 border-2 border-[#347361] border-t-[#e3f2ee] rounded-full animate-spin" />
                                        </div>
                                    ):(
                                        <Video className="" stroke={`${Text.length==0 || isLoading?"#cec5b6":"#f2e8d7"}`} size={18}/>
                                    )
                                }
                                <div
                                    className={`${Text.length==0 || isLoading?"text-[#cec5b6]":"text-[#f2e8d7]"} text-[0.8rem]`}
                                >
                                    Start
                                </div>
                            </button>
                            <input 
                                ref={input_bar_ref}
                                onInput={update_text}
                                type="text" 
                                placeholder="Call Topic" 
                                className="w-full px-2 py-2 outline-none bg-[var(--sc-surface-low)] rounded-xl border border-[var(--sc-outline-variant)] focus:border-[var(--sc-primary)] transition-colors text-sm"/>
                        </div>
                    </div>
                )
            }
            {/* <span className="p-1 bg-white w-[200px] max-w-[200px] h-[200px] max-h-[200px] overflow-y-auto whitespace-pre-wrap">{SocketLogs}</span> */}
        </div>
    )
}


const VideoPanel=()=>{
    const url_params=useParams()
    const navigate=useNavigate()
    const {user_id, user_name,

        LocalStreams, setLocalStreams,
        RemoteVideoStreams, setRemoteVideoStreams,
        RemoteAudioStreams, setRemoteAudioStreams,
        ScreenShareToggle, setScreenShareToggle
    }=useContext(ChatLayout_Context)



    useEffect(()=>{


        return ()=>{
            if(!webrtc_client.device){
                webrtc_client.disconnect()
            }
        }
    },[])

    // useEffect(()=>{
    //     console.log(chalk.blue("Mounted"))
    // },[])
    useEffect(()=>{
        console.log(chalk.magentaBright(`Local Streams Length: ${webrtc_client.LocalStreams.size}`))
    },[LocalStreams])
    useEffect(()=>{
        console.log(chalk.magenta(`Remote Streams Length: ${webrtc_client.RemoteVideoStreams.size}`))
    },[RemoteVideoStreams])



    function cleanup(){
        webrtc_client.disconnect();
        navigate(`/chats/${url_params.communityId}/${url_params.channelId}/`)
        console.log(chalk.green("Cleaned up"))
    }

    function start_call(on_sfu_disconnect, on_sfu_reconnect_fail){
        if(!socketio_client || !webrtc_client || socketio_client?.sfu_socket_connected===true) return
        webrtc_client.connect(
            url_params.communityId, 
            url_params.channelId, 
            user_id, 
            user_name,
            setLocalStreams, 
            setRemoteVideoStreams, 
            setRemoteAudioStreams,
            setScreenShareToggle,
            on_sfu_disconnect,
            on_sfu_reconnect_fail
        )

    }

    return(
        <div className=" relative flex flex-col w-full h-full bg-[#f5f3ef]  min-h-0 ">

            {   webrtc_client.device===null ?
                (
                    <ScheduleMeeting
                        start_call={start_call}
                    />
                ):
                webrtc_client.community_id===url_params.communityId && webrtc_client.channel_id===url_params.channelId ?
                (
                    <>
                        <div className="relative w-full h-full flex overflow-y-auto">

                            {/* <div className="messages-container py-0! flex-1 w-full relative overflow-y-auto custom-scrollbar">
                                <ScrollBar >
                                    <div className="w-full flex flex-col items-center justify-center">
                                        <div className="space-y-0 flex flex-col px-8 w-full bg-transparent">
                                        
                                        </div>
                                    </div>
                                </ScrollBar>
                            </div> */}

                            <div
                                className="py-0! h-full w-full relative overflow-x-auto   flex flex-row "
                            >
                                {
                                    webrtc_client?.LocalStreams?.size>0 &&

                                    (function(){

                                        const screen_share_stream=webrtc_client?.LocalStreams?.get("screenShare")
                                        
                                        if(!screen_share_stream) return null
                                        return(
                                            <div className="flex flex-col w-full h-full max-h-full shrink-0 justify-center items-center gap-[1rem] my-auto p-5 " >
                                                <RemoteVideoPlayer stream={screen_share_stream} callback={()=>{console.log(chalk.green("Mounted Remote Video Stream"))}}/> 
                                            </div>
                                        )
                                    })()
                                    
                                }

                                {   webrtc_client?.RemoteVideoStreams?.size>0 &&
                                    (function() {
                                        const chunks = [];
                                        // const video_stream=[...webrtc_client.RemoteVideoStreams][0][1]

                                        // const data=Array.from({length: 5}, (_, i)=>{
                                        //     return(
                                        //     <RemoteVideoPlayer stream={video_stream} key={i} callback={()=>{console.log(chalk.green("Mounted Remote Video Stream"))}}/> 
                                        //     )
                                        // })
                                        const remote_streams_map_list=[...webrtc_client.RemoteVideoStreams]
                                        
                                        const data=remote_streams_map_list.
                                                    filter(([key, obj])=>obj?.appData?.type!=="ScreenCaptureFeed")
                                                    .map(([key, obj], indx)=>{

                                                        return(
                                                            <RemoteVideoPlayer stream={obj.stream} key={indx} callback={()=>{console.log(chalk.green("Mounted Remote Video Stream"))}}/> 
                                                        )
                                                    })
                                        
                                        
                                        const screen_share_streams=remote_streams_map_list.
                                                    filter(([key, obj])=>obj?.appData?.type==="ScreenCaptureFeed")
                                                    .map(([key, obj], indx)=>{

                                                        return(
                                                            <div className="flex flex-col w-full h-full max-h-full shrink-0 justify-center items-center gap-[1rem] my-auto p-5 " key={indx}>
                                                                <RemoteVideoPlayer stream={obj.stream} key={indx} callback={()=>{console.log(chalk.green("Mounted Remote Video Stream"))}}/> 
                                                            </div>
                                                        )
                                                    })

                                    

                                        for (let i = 0; i < data.length; i += 4) {
                                            const chunk1 = data.slice(i, i + 2);
                                            const chunk2 = data.slice(i+2, i+4)
                                            chunks.push(
                                                <div className="flex flex-col w-full h-full max-h-full shrink-0 justify-center items-center gap-[1rem] my-auto p-5 " key={i}>
                                                    {   chunk1.length>0 &&
                                                        <div className={`flex flex-row w-full justify-center ${(chunk1.length+chunk2.length)<=2?"h-full":"h-[50%]"} gap-[1rem] `}>
                                                            {
                                                                chunk1.map(item => item)
                                                            }
                                                        </div>
                                                    }
                                                    {   chunk2.length>0 &&
                                                        <div className="flex flex-row w-full justify-center h-[50%] gap-[1rem] ">
                                                            {
                                                                chunk2.map(item => item)
                                                            }
                                                        </div>
                                                    }
                                                </div>
                                            );
                                        }

                                        
                                        
                                        return (
                                            <>
                                                {screen_share_streams}
                                                {chunks}
                                            </>
                                        ); // React renders the array of elements
                                    })()
                                }

                
                            </div>


                            <div
                                className={`
                                    ${webrtc_client?.RemoteVideoStreams?.size>0 || webrtc_client?.LocalStreams?.get("screenShare") ?
                                        "w-[160px] h-auto bottom-8 right-5":"h-full w-full p-5"} 
                                    
                                    absolute flex flex-col  justify-center `}
                            >
                                {
                                    webrtc_client?.LocalStreams?.size>0 &&

                                        <LocalVideoPlayer 
                                            stream_map={webrtc_client.LocalStreams} 
                                            callback={()=>{
                                                // console.log(chalk.green("Mounted Local Stream"))
                                            }}
                                            
                                        />   
                                }
                            </div>

                        </div>

                        <div
                            className="h-full mt-auto max-h-[80px] w-full flex flex-col bg-[#f5f3ef] justify-center"
                        >
                            
                            {
                                webrtc_client?.LocalStreams?.size>0 &&
                                
                                    
                                    <LocalVideoControls 
                                        streamName={"videoCall"} 
                                        stream_map={webrtc_client.LocalStreams} 
                                        setScreenShareToggle={setScreenShareToggle} 
                                        ScreenShareToggle={ScreenShareToggle} 
                                        callback={()=>{
                                            // console.log(chalk.green("Mounted Local Stream"))
                                        }}
                                        cleanup_cb={()=>cleanup()}
                                    />
                                    
                                
                            }
                        </div>
                    </>
                ):(
                    <div className="flex-1 w-full h-full flex flex-col items-center pt-10 bg-[#F5F3EF]">
                        <h1 className="text-[#8A817C] text-[0.95rem] mt-4 font-medium">You are already in a Call</h1>
                        <button 
                            className={` mt-3 flex bg-[#225e48] cursor-pointer rounded-full w-fit h-fit py-1.5 px-3 gap-[0.5rem] flex-row justify-center items-center select-none`}
                            onClick={()=>{
                                    navigate(`/chats/${webrtc_client.community_id}/${webrtc_client.channel_id}/videocall`)
                                }}
                        >
                            <div
                                className={`text-[#f2e8d7] text-[0.7rem]`}
                            >
                                Back to Call
                            </div>
                        </button>
                    </div>
                )
            }

            
            
            <>
            {
                webrtc_client?.RemoteAudioStreams?.size>0 &&
                <>
                { [...webrtc_client.RemoteAudioStreams].map(([key, audio_stream], index)=>{
                    return(
                        <RemoteAudioPlayer 
                            stream={audio_stream} key={index} callback={()=>{console.log(chalk.green("Mounted Remote Video Stream"))}}
                        />
                    )
                }) }
                </>
            }
            </>

        </div>
    )
}


const VideoCallSection = () => {
  return (
    <div className="w-full h-full flex flex-col font-[Inter] text-black">
      <Header/>
      <VideoPanel/>
      {/* <Footer/> */}
    </div>
  )
}

export default VideoCallSection

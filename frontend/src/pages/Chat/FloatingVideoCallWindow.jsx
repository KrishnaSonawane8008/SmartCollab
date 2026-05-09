import { useEffect, useRef, useState, useCallback, useContext } from "react"
import { webrtc_client } from "../../api/webrtc_client"
import chalk from "chalk"
import { useLocation, useParams, useNavigate } from "react-router-dom"
import { LucideUserPlus2, MoveDiagonal, Minimize2, LogInIcon  } from "lucide-react"
import { ChatLayout_Context } from "../../contexts/ChatLayout-context-provider"

const FloatingVideoCallWindow = () => {
  const location=useLocation()
  const {communityId, channelId}=useParams()
  const navigate=useNavigate()
  const {LocalStreams, RemoteVideoStreams}=useContext(ChatLayout_Context)

  const [Expanded, setExpanded]=useState(false)
  // const [pos, setPos] = useState({ x: 100, y: 100 });
  const dragging = useRef(false);
  const elRef=useRef(null)
  const offset = useRef({ x: 0, y: 0 });
  const pos=useRef({ x: 0, y: 0 })

  const dragging_remote = useRef(false);
  const elRef_remote=useRef(null)
  const offset_remote = useRef({ x: 0, y: 0 });
  const pos_remote=useRef({ x: 0, y: 0 })
  
  useEffect(()=>{
    
    console.log(chalk.green("FloatingVideoCallWindow Mounted"))

    const handleMove = (e) => {
      if(!elRef.current) return
      const rect = elRef.current.getBoundingClientRect();

      const outside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;

      if (outside && dragging.current===true) {
        handleMouseMove(e)
      }
    };


    const handleMove_remote = (e) => {
      if(!elRef_remote.current) return
      const rect = elRef_remote.current.getBoundingClientRect();

      const outside =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;

      if (outside && dragging_remote.current===true) {
        handleMouseMove_remote(e)
      }
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointermove", handleMove_remote);
    return () =>{ 
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointermove", handleMove_remote);
      offset.current = { x: 0, y: 0, };
      pos.current = { x: 0, y: 0, };
      offset_remote.current = { x: 0, y: 0, };
      pos_remote.current = { x: 0, y: 0, };
      
      console.log(chalk.red("FloatingVideoCallWindow Unmounted"))
    }


  },[])


  const videoRef=useCallback((node)=>{
      const stream=webrtc_client?.LocalStreams?.get("videoCall")
      if(node && stream){
          node.srcObject=stream
          
      }
  },[webrtc_client.LocalStreams])



  
  const handleMouseDown = (e) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - pos.current.x,
      y: e.clientY - pos.current.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;

    const w=window.innerWidth
    const h=window.innerHeight

    let x = e.clientX - offset.current.x;
    let y = e.clientY - offset.current.y;

    const top=Math.abs(y+elRef.current.offsetTop)
    if(top>h){
      y+=top-h
    }
    
    const bottom=Math.abs(elRef.current.offsetTop)-elRef.current.offsetHeight
    if(y>bottom){
      y=bottom
    }

    const left=-elRef.current.offsetLeft
    if(x<left){
      x=left
    }
    
    const right=x+elRef.current.offsetLeft+elRef.current.offsetWidth
    if(right>w){
      x-=right-w
    }

    pos.current={ x:x, y:y };
    elRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseUp = (e) => {
    dragging.current = false;
  };



  const videoRef_remote=useCallback((node)=>{
      if(webrtc_client.RemoteVideoStreams.size==1){
        const stream=[...webrtc_client.RemoteVideoStreams][0][1]
        if(node && stream.stream){
            node.srcObject=stream.stream
            
        }
      }
  },[webrtc_client.RemoteVideoStreams])

  const handleMouseDown_remote = (e) => {
    dragging_remote.current = true;
    offset_remote.current = {
      x: e.clientX - pos_remote.current.x,
      y: e.clientY - pos_remote.current.y,
    };
  };

  const handleMouseMove_remote = (e) => {
    if (!dragging_remote.current) return;

    const w=window.innerWidth
    const h=window.innerHeight

    let x = e.clientX - offset_remote.current.x;
    let y = e.clientY - offset_remote.current.y;

    const top=Math.abs(y+elRef_remote.current.offsetTop)
    if(top>h){
      y+=top-h
    }
    
    const bottom=Math.abs(elRef_remote.current.offsetTop)-elRef_remote.current.offsetHeight
    if(y>bottom){
      y=bottom
    }

    const left=-elRef_remote.current.offsetLeft
    if(x<left){
      x=left
    }
    
    const right=x+elRef_remote.current.offsetLeft+elRef_remote.current.offsetWidth
    if(right>w){
      x-=right-w
    }

    pos_remote.current={ x:x, y:y };
    elRef_remote.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseUp_Remote = (e) => {
    dragging_remote.current = false;
  };

  // console.log(chalk.redBright("Floating video call div rendered"))

  if(location.pathname.includes(`/chats/${communityId}/${channelId}/videocall`)) {
    offset.current = { x: 0, y: 0, };
    pos.current = { x: 0, y: 0, };
    offset_remote.current = { x: 0, y: 0, };
    pos_remote.current = { x: 0, y: 0, };
    return (
      <></>
    )
  }

  return (
    <>
    {
        webrtc_client.RemoteVideoStreams.size===0 && webrtc_client.device &&

        <div className="relative inset-0 z-[9999] flex items-center justify-center select-none"
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        // onPointerLeave={handleMouseLeave}
        >
            <div 
              className={`absolute bottom-25 ${Expanded===true?"w-[320px] h-[180px]":"w-[160px] h-[90px]"} right-5 flex flex-col gap-y-1 `}
              ref={elRef}
              // style={{
              //   transform: `translate(${pos.x}px, ${pos.y}px)`,
              //   position: "absolute",
              //   cursor: "grab",
              // }}
            >
              <div className=" w-full h-full transition-transform duration-200 relative overflow-hidden bg-[#1e2939] rounded-[0.5rem]"
                onPointerDown={handleMouseDown}
              >
                <div className="absolute top-0 right-0 m-1.5 flex flex-row gap-1">
                  <div className="bg-gray-100 transition-colors duration-200 opacity-[60%] rounded-full p-1 size-[20px] flex justify-center items-center cursor-pointer"
                    title="Back to Call"
                    onClick={()=>{
                      if(!webrtc_client.community_id || !webrtc_client.channel_id) return
                      navigate(`/chats/${webrtc_client.community_id}/${webrtc_client.channel_id}/videocall`)
                    }}
                  >
                    <LogInIcon size={15}/>
                  </div>
                  <div className="bg-gray-100 transition-colors duration-200 opacity-[60%] rounded-full p-1 size-[20px] flex justify-center items-center cursor-pointer"
                    title={`${Expanded?"Minimize":"Maximize"}`}
                    onClick={()=>{
                      setExpanded(!Expanded)
                    }}
                  >
                    { Expanded===true?(
                        <Minimize2 size={13}/>
                      ):
                      (
                        <MoveDiagonal className="" size={13}/>
                      )
                    }
                  </div>
                </div>

                <video className=" object-cover w-full h-full" ref={videoRef} autoPlay muted/>
                
              </div>
            </div>
        </div>

    }
    {
        webrtc_client.RemoteVideoStreams.size>0 &&
        <div className="relative inset-0 z-[9997] flex items-center justify-center select-none"
        onPointerMove={handleMouseMove_remote}
        onPointerUp={handleMouseUp_Remote}
        // onPointerLeave={handleMouseLeave}
        >
            <div 
              className={`absolute bottom-25 ${Expanded===true?"w-[320px] h-[180px]":"w-[160px] h-[90px]"} right-5 flex flex-col gap-y-1 `}
              ref={elRef_remote}
              // style={{
              //   transform: `translate(${pos.x}px, ${pos.y}px)`,
              //   position: "absolute",
              //   cursor: "grab",
              // }}
            >
              {/* <div className="bg-[#1e2939] flex felx-row text-white justify-center w-full rounded-t-[0.5rem] py-0.5 absolute -top-[1.59rem]">
                Others
              </div> */}
              <div className="w-full h-full transition-transform duration-200 relative overflow-hidden bg-[#1e2939] rounded-[0.5rem]"
                onPointerDown={handleMouseDown_remote}
              >
                {/* webrtc_client.RemoteVideoStreams.size==1 */}
                <div className="absolute top-0 right-0 m-1.5 flex flex-row gap-1">
                  <div className="bg-gray-100 transition-colors duration-200 opacity-[60%] rounded-full p-1 size-[20px] flex justify-center items-center cursor-pointer"
                    title="Back to Call"
                    onClick={()=>{
                      if(!webrtc_client.community_id || !webrtc_client.channel_id) return
                      navigate(`/chats/${webrtc_client.community_id}/${webrtc_client.channel_id}/videocall`)
                    }}
                  >
                    <LogInIcon size={15}/>
                  </div>
                  <div className="bg-gray-100 transition-colors duration-200 opacity-[60%] rounded-full p-1 size-[20px] flex justify-center items-center cursor-pointer"
                    title={`${Expanded?"Minimize":"Maximize"}`}
                    onClick={()=>{
                      setExpanded(!Expanded)
                    }}
                  >
                    { Expanded===true?(
                        <Minimize2 size={13}/>
                      ):
                      (
                        <MoveDiagonal className="" size={13}/>
                      )
                    }
                  </div>
                </div>
                {  
                  webrtc_client.RemoteVideoStreams.size==1?(
                    <video className=" object-cover w-full h-full" ref={videoRef_remote} autoPlay muted/>
                  ):(
                    <div className="w-full h-full bg-[#1e2939] flex justify-center items-center">
                      <div className="bg-[#f2e8d7] rounded-full aspect-square w-fit p-1.5 flex justify-center items-center">
                        <div className="flex flex-row items-end">
                          <LucideUserPlus2 stroke="#2f5d50" size={20}/>
                          <span className=" text-[0.8rem] text-[#2f5d50] pr-1 pl-0.5 leading-2">{webrtc_client.RemoteVideoStreams.size}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
        </div>
    }
    </>
  )
}

export default FloatingVideoCallWindow

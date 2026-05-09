import { MoveLeft, ChevronDown, ChevronLeft, AlertCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { get_call_logs, get_call_summary } from "../../services/summary_service"
import { useEffect, useState } from "react"
import ScrollBar from "../common components/ScrollBar"

const Header=()=>{

    const {communityId, channelId}=useParams()
    const navigate=useNavigate()
    
    return(
        <div className="w-full h-[2.75rem] py-8 px-4 bg-[#2f5d50] flex flex-row items-center">
            <MoveLeft className="mr-auto ml-2 text-white cursor-pointer" preserveAspectRatio="none"
            onClick={()=>{
                console.log("left")
                navigate(`/chats/${communityId}/${channelId}/`)
            }}
            />
        </div>
    )
}

function getHumanDiff(iso1, iso2) {
  const d1 = new Date(iso1);
  const d2 = new Date(iso2);
  const diffMs = d2 - d1;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric:'auto' });

  // Logic to pick the best unit
  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, 'day');
  if (Math.abs(diffHour) >= 1) return rtf.format(diffHour, 'hour');
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, 'minute');
  return rtf.format(diffSec, 'second');
}


function get_date_time(date_obj){
    const date=date_obj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
    const time = date_obj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return {date, time}
}

const LogTab=({value})=>{
    
    const [open, setOpen]=useState(false)

    // call_id : 134
    // call_participants : ['User2']
    // call_starter_id : 2
    // call_starter_name : "User2"
    // call_topic : "asf"
    // channel_id : 2
    // community_id : 3
    // ended_at : "2026-05-08T23:01:29.173000+05:30"
    // started_at : "2026-05-08T23:01:24.518000+05:30"

    const {data, isLoading, isFetching, isError, error, refetch}=useQuery({
        queryKey: ["call_logs", value.community_id, value.channel_id, value.call_id],
        queryFn: ()=>{return get_call_summary(`${value.community_id}${value.channel_id}`, value.call_id)},
        enabled: false,
        staleTime: Infinity
    })


    const started_datetime=get_date_time(new Date(value.started_at))
    const ended_datetime=get_date_time(new Date(value.ended_at))

    const lasted=getHumanDiff(value.started_at, value.ended_at).replace(/^in\s/i, '').replace(/\sago$/i, '');


    return(
        <div className={`flex flex-col bg-[#f4e6c8] text-[#2f5d50] rounded-[0.5rem] p-3 ${open===true?"my-3":"my-1.5"} select-none transition-all duration-200`}>
            <div className="flex flex-row w-full">
                <div className="flex flex-col overflow-hidden">
                    <span className="text-[0.9rem] truncate">Call Topic: <b className="text-[1rem]">{value.call_topic}</b>

                    </span>
                    <span className=" text-[0.8rem]">{lasted==="now"?"finished just now":`call lasted for ${lasted}`}</span>
                </div>
                <div className="ml-auto">
                    {/* <div className="w-[44px] h-[44px] my-1 flex-shrink-0 rounded-[16px] flex items-center justify-center bg-[rgba(255,255,255,0.08)] backdrop-blur-[8px] shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] hover:scale-[1.08] transition-all duration-250 cursor-pointer group" title="Add Community">
                        <Plus className="w-[20px] h-[20px] flex-shrink-0 text-[#DDE6E0] group-hover:text-white transition-colors" strokeWidth={2} />
                    </div> */}
                    <button 
                        className="flex-shrink-0 rounded-[10px] flex items-center justify-center bg-[#2f5d50] backdrop-blur-[8px] shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] hover:scale-[1.08] text-[#f4e6c8] transition-all duration-250 cursor-pointer group px-2.5 py-1.5"

                        onClick={()=>{
                            refetch()
                        }}
                    >
                        Generate Summary ✨
                    </button>
                </div>
                <div
                    className="ml-[10px] select-none cursor-pointer"
                    onClick={()=>{setOpen(!open)}}
                >
                    {
                        open===true?(
                            <ChevronDown/>
                        ):(
                            <ChevronLeft/>
                        )
                    }
                </div>
            </div>
            {
                open===true && 
                <div>
                    <div className="w-full rounded-[0.5rem] bg-[#f2d8a1] flex flex-col p-2 mt-2 text-[0.8rem]">
                        <span>Started at: {started_datetime.date}, {started_datetime.time}</span>
                        <span>Ended at: {ended_datetime.date}, {ended_datetime.time}</span>
                        <span>Started by: {value.call_starter_name}</span>
                        <div className="flex flex-row overflow-hidden">
                            <span className="mr-1">Call Participants: </span>
                            {
                                value.call_participants && Array.isArray(value.call_participants) &&
                                value.call_participants.map((participant_name, indx)=>{
                                    return(
                                        <span key={indx} className="mr-0.5">{participant_name}{value.call_participants.length-1==indx?"":","}</span>
                                    )
                                })
                            }
                        </div>
                    </div>
                    

                    {
                        isFetching?(
                            <div
                                className="w-full rounded-[0.5rem] bg-[#f2d8a1] flex flex-col p-2 mt-2 text-[0.8rem]"
                            >
                                <div className="flex-1 flex justify-center items-center">
                                    <div className="w-4 h-4 mx-2 border-2 border-[#e3f2ee] border-t-[#347361] rounded-full animate-spin" />
                                    Generating...
                                </div>
                            </div>
                        ):data?.summary && (
                            <div
                                className="w-full rounded-[0.5rem] bg-[#f2d8a1] flex flex-col p-2 mt-2 text-[0.8rem]"
                            >   
                                <span className="flex w-full justidy-start text-[0.9rem] font-medium">Summary</span>
                                <div className="mt-2">
                                    {data.summary}
                                </div>
                            </div>
                        )
                    }

                    {
                        isError && 
                        <div
                            className="w-full rounded-[0.5rem] bg-[#f2d8a1] flex flex-row items-center p-2 mt-2 text-[0.8rem] text-[#ff5555]"
                        >   
                            <AlertCircle size={15} className="mx-1"/>
                            {
                                (function(){
                                    // console.log(error.status)
                                    return(
                                        <span className="flex w-full justidy-start text-[0.8rem] font-medium">Error: Summary Cant be generated</span>
                                    )
                                })()
                            }
                        </div>
                    }
                        
                </div>
            }
        </div>
    )
}


const Content=()=>{

    const {communityId, channelId}=useParams()
    const [CallLogs, setCallLogs]=useState(null)

    const {data, isLoading, isError, error}=useQuery({
        queryKey: ["call_logs", communityId, channelId],
        queryFn: ()=>{return get_call_logs(communityId, channelId)},
        enabled: !!channelId && !!communityId,
        staleTime: Infinity
    })

    // console.log(data?.CallLogs)

    useEffect(()=>{
        if(!data) return
        if(data.CallLogs && Array.isArray(data.CallLogs)){
            
            setCallLogs(data.CallLogs)
        }
    }, [data])
    
    return(
        <div className="h-full w-full py-4 pl-4 pr-2 bg-[#f5f3ef] flex flex-col overflow-y-hidden">


            <div className=" py-0! flex-1 w-full relative overflow-y-auto custom-scrollbar">
                <ScrollBar>
                    <div className="w-full pb-50 flex flex-col items-center justify-center">
                        <div className="space-y-0 flex flex-col pr-5 w-full bg-transparent">

                        {
                            CallLogs && CallLogs.length>0?(

                                // Array.from({length:50}).map((val, indx)=>{
                                //     const value=CallLogs[0]
                                //     return(
                                //         <LogTab key={indx} value={value}/>
                                //     )
                                // })

                                CallLogs.map((value, index)=>{
                                    // console.log(value)
                                    if(!value) return <></>
                                    return(
                                        <LogTab key={index} value={value}/>
                                    )
                                })
                            ):(
                                <div>
                                    No Logs to display
                                </div>
                            )
                        }


                        </div>
                    </div>
                </ScrollBar>
            </div>
            
        </div>
    )
}



const CallLogs = () => {
  return (
    <div className="h-full w-full ">
        <Header/>
        <Content/>
    </div>
  )
}

export default CallLogs

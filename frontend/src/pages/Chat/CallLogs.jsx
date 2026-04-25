import { MoveLeft, ChevronDown, ChevronLeft } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { get_call_logs } from "../../services/summary_service"
import { useEffect, useState } from "react"

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


const LogTab=({time_val})=>{
    
    const [open, setOpen]=useState(false)

    // const {data, isLoading, isError, error, refetch}=useQuery({
    //     queryKey: ["summary", communityId, channelId, epochtime],
    //     queryFn: ()=>{return generate_summary(communityId, channelId, epochtime)},
    //     enabled: false,
    //     staleTime: 1000*60*1
    // })

    const date_obj=new Date(Number(time_val))
    const date=date_obj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
    const time = date_obj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    return(
        <div className="flex flex-col bg-[#f4e6c8] text-[#2f5d50] rounded-[0.5rem] p-3 my-1.5 select-none">
            <div className="flex flex-row w-full">
                <span>{date}{", "}{time}</span>
                <div
                    className="ml-auto select-none cursor-pointer"
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
                <div className="w-full bg-amber-400">
                    
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
        staleTime: 1000*60*1
    })

    useEffect(()=>{
        if(!data) return
        if(data.logs && Array.isArray(data.logs)){
            setCallLogs(data.logs)
        }
    }, [data])
    
    return(
        <div className="h-full w-full p-4 bg-[#f5f3ef] flex flex-col">
            {
                CallLogs && CallLogs.length>0?(
                    CallLogs.map((value, index)=>{
                        console.log(index)
                        return(
                            <LogTab key={index} time_val={value}/>
                        )
                    })
                ):(
                    <div>
                        No Logs to display
                    </div>
                )
            }
        </div>
    )
}



const CallLogs = () => {
  return (
    <div className="h-full w-full bg-red-400">
        <Header/>
        <Content/>
    </div>
  )
}

export default CallLogs

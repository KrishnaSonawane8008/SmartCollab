import { MoveLeft, ChevronDown, ChevronLeft, AlertCircle, Trash2Icon, Loader2, Languages, Undo2} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { get_call_logs, get_call_summary } from "../../services/summary_service"
import { useEffect, useState, useContext } from "react"
import { Global_Context } from "../../contexts/Global-context-provider"
import ScrollBar from "../common components/ScrollBar"
import { delete_call_log } from "../../services/dev_services"
import { getDominantLanguage } from "../../services/translation_service"
import { translate } from "../../services/translation_service"


const DEV_KEY = import.meta.env.VITE_DEV_MODE_KEY
const SUMMARY_STREAM_URL=import.meta.env.VITE_SUMMARY_STREAM_URL

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
    const [deletion_loading, setDeletionLoading]=useState(false)
    const queryClient = useQueryClient();
    const {UserData}=useContext(Global_Context)

    const [summary, setSummary] = useState("");
    const [isError, setError]=useState(false)
    const [generating, setGenerating] = useState(false);
    const [loading, setLoading]=useState(false)
    const [summary_finished, setSummaryFinished]=useState(false)
    const [eventSource, setEventSource] = useState(null);

    const [showTranslated, setShowTranslated]=useState(false)
    const [translated_summary, setTranslatedSummary]=useState(null)
    const [translation_loading, setTranslationLoading]=useState(false)
    const [target_lang, setTargetLang]=useState(UserData?.preferred_language)

    // const { data, isError:translation_error, isFetching:translation_loading, refetch } = useQuery({
    //     queryKey: ["translated_summary", `${value.community_id}${value.channel_id}_${value.call_id}`, UserData?.preferred_language],
    //     queryFn: async () => {
    //         return translate({text:summary, source_lang:getDominantLanguage(summary)}, UserData?.preferred_language)
    //     },
    //     enabled: false,
    //     staleTime: Infinity
    // })

    // const translated_summary=data?.translated ? data.translated : summary
    // console.log(translated_summary)
    const translateSummary= async ()=>{
        if(typeof summary !== 'string' || !(summary.length>0)){
            return
        }
        try{
            setTranslationLoading(true)
            const translated=await translate({text:summary, source_lang:getDominantLanguage(summary)}, UserData?.preferred_language)
            setTranslatedSummary(translated.translated)
            setTranslationLoading(false)
        }catch(e){
            console.error(e)
            setShowTranslated(false)
            setTranslationLoading(false)
            setTranslatedSummary(null)
        }finally{
            setTranslationLoading(false)
            setTargetLang(UserData?.preferred_language)
        }
        
    } 


    const stream_summary=async () => {

        try{
            setEventSource(null)
            setSummary("");
            setError(false)
            setGenerating(true);
            setLoading(true)
            setSummaryFinished(false)

            const response = await get_call_summary(
                `${value.community_id}${value.channel_id}`,
                value.call_id
            );

            const pre_generated=response.generated_summary
            if(pre_generated){
                setEventSource(null)
                setSummary(pre_generated);
                setError(false)
                setGenerating(false);
                setLoading(false)
                setSummaryFinished(true)
                return
            }

            const streamId = response.stream_id;
            const es = new EventSource(
                `${SUMMARY_STREAM_URL}${value.community_id}${value.channel_id}_${value.call_id}/${streamId}`
            );

            setEventSource(es);

            es.addEventListener("token", (event) => {
                setLoading(false)
                setSummary(prev => prev + event.data);
            });

            es.addEventListener("generated", (event)=>{
                if(typeof event.data === 'string' && event.data.length>0){
                    setLoading(false)
                }
                setSummary(event.data)
            })

            es.addEventListener("done", () => {
                setLoading(false)
                setGenerating(false);
                setEventSource(null)
                setSummaryFinished(true)
                es.close();

            });

            es.addEventListener("error", () => {
                setLoading(false)
                setGenerating(false);
                setEventSource(null)
                setError(true)
                es.close();

            });
        }catch(e){
            console.error(e)
            setLoading(false)
            setGenerating(false);
            setEventSource(null)
            setError(true)
        }

    }

    
    // call_id : 134
    // call_participants : ['User2']
    // call_starter_id : 2
    // call_starter_name : "User2"
    // call_topic : "asf"
    // channel_id : 2
    // community_id : 3
    // ended_at : "2026-05-08T23:01:29.173000+05:30"
    // started_at : "2026-05-08T23:01:24.518000+05:30"

    // const {data, isLoading, isFetching, isError, error, refetch}=useQuery({
    //     queryKey: ["call_logs", value.community_id, value.channel_id, value.call_id],
    //     queryFn: ()=>{return get_call_summary(`${value.community_id}${value.channel_id}`, value.call_id)},
    //     enabled: false,
    //     staleTime: Infinity
    // })


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

                    <button 
                        className={`flex-shrink-0 rounded-[10px] flex items-center justify-center ${generating?"bg-[#5e8b7e] cursor-not-allowed":"bg-[#2f5d50] hover:scale-[1.08] cursor-pointer"} backdrop-blur-[8px] shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] text-[#f4e6c8] transition-all duration-250 group px-2.5 py-1.5`}
                        disabled={generating}
                        onClick={()=>{stream_summary()}}

                    >
                        Generate Summary ✨
                    </button>
                </div>
                { DEV_KEY &&
                    <div className="ml-[10px] select-none cursor-pointer">
                        <button 
                            className="flex-shrink-0 rounded-[10px] flex items-center justify-center bg-[#e04d4d] backdrop-blur-[8px] shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] hover:scale-[1.08] text-[#f4e6c8] transition-all duration-250 cursor-pointer group px-[6px] py-[6px]"

                            onClick={()=>{
                                setDeletionLoading(true)
                                delete_call_log(value.community_id, value.channel_id, value.call_id, DEV_KEY).then((response)=>{
                                    if(response.Success===true){
                                        queryClient?.refetchQueries({
                                            queryKey:["call_logs", `${value.community_id}`, `${value.channel_id}`], 
                                            exact:true
                                        })
                                    }
                                }).catch((error)=>{
                                    setDeletionLoading(false)
                                    console.error(error)
                                }).finally(()=>{
                                    setDeletionLoading(false)
                                })
                            }}
                        >
                            { !deletion_loading ? (
                                    <Trash2Icon size={22}/>
                                ):(
                                    <Loader2 size={22} className=" animate-spin"/>
                                )
                            }
                        </button>
                    </div>
                }
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
                        loading===true ? (
                            <div className="w-full rounded-[0.5rem] bg-[#f2d8a1] flex flex-col items-center justify-center p-4 mt-2">
                                <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 bg-[#2f5d50] rounded-full animate-bounce [animation-delay:0ms]" />
                                    <div className="w-1 h-1 bg-[#2f5d50] rounded-full animate-bounce [animation-delay:150ms]" />
                                    <div className="w-1 h-1 bg-[#2f5d50] rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        ):(
                        isError===true?(
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
                        ):(
                            summary &&(
                                <div
                                    className="w-full rounded-[0.5rem] bg-[#f2d8a1] flex flex-col p-2 mt-2 text-[0.8rem]"
                                >   
                                    <div className="flex w-full">
                                        <span className="text-[0.9rem] my-auto font-medium">Summary</span>
                                        { (summary_finished===true && !generating) &&
                                            <button 
                                            // ${generating?"bg-[#5e8b7e] cursor-not-allowed":"bg-[#2f5d50] hover:scale-[1.08] cursor-pointer"}
                                                className={`flex-shrink-0 rounded-[7px] flex items-center justify-center hover:bg-[#2f5d50] hover:text-[#f4e6c8] cursor-pointer backdrop-blur-[8px] text-[0.75rem] text-[#2f5d50] transition-all duration-250 group mx-[1rem] p-1 ml-auto`}
                                                title={!showTranslated?"Translate Summary":(target_lang===UserData?.preferred_language?"See Original":"Translate Summary")}

                                                onClick={async ()=>{
                                                    if(showTranslated===true && target_lang===UserData?.preferred_language){
                                                        setShowTranslated(false)
                                                        return
                                                    }
                                                    if(translated_summary?.length>0 && target_lang===UserData?.preferred_language){
                                                        setShowTranslated(true)
                                                        return
                                                    }
                                                    await translateSummary()
                                                    setShowTranslated(true)
                                                }}
                                            >
                                                {translation_loading?(
                                                    <Loader2 size={20} className=" animate-spin"/>
                                                ):(
                                                    (!showTranslated)?(
                                                        <Languages size={20}/>
                                                    ):(
                                                        (target_lang===UserData?.preferred_language)?(
                                                            <Undo2 size={20}/>
                                                        ):(
                                                            <Languages size={20}/>
                                                        )
                                                    )
                                                )
                                                }
                                            </button>
                                        }
                                    </div>
                                    <div className="mt-2">
                                        {(showTranslated && translated_summary)?translated_summary: summary}
                                        {generating && (
                                            // ▌
                                            <span className="blinking-cursor text-[0.7rem]">▌</span>
                                        )}
                                    </div>
                                </div>
                            )
                        )
                        )
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
        queryFn: ()=>{
            return get_call_logs(communityId, channelId)
        },
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

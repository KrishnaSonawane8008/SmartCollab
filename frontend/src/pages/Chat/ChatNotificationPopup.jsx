import { WebsocketsContext } from "../../contexts/WebSockets-context-provider"
import {UserPlus, AlertCircle, SendIcon} from "lucide-react"
import { useContext, useEffect, useState, useCallback } from "react"


const ErrorPopup=({isVisible, message})=>{
    const [first_mount, setFirstMount]=useState(false)
    useEffect(()=>{
        setFirstMount(true)
    },[])
    // {type:"Info", message:"Notification Already Sent"}
    return(
        <div
            className={`
                bg-[#f34242] backdrop-blur-xl border border-[rgba(162,162,162,0.5)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] py-2 pr-2 select-none

                flex flex-col max-w-[250px]

                transition-all duration-300 ease-in-out
                ${isVisible ? "translate-x-0 opacity-100" : `${first_mount===true?"translate-x-0" : "-translate-x-full"} opacity-0`}

            `}
        >
            <div className="flex flex-row items-center">
                <div className="
                        rounded-full min-w-[10px] min-h-[10px] m-1.5 mr-2! flex items-center justify-center 
                ">
                    <AlertCircle stroke="#fff9ed" className="" size={20}/>
                </div>

                <div className="flex flex-col min-w-0 max-h-[60px]">
                    <span className="text-[0.7rem] line-clamp-2 text-[#fff9ed] mr-1 whitespace-pre-line">{message}</span>
                </div>
            </div>
            
        </div>
    )
}

const ChannelInviteLayout=({isVisible, reciever_id, sender_name, sender_email, community_name, channel_name})=>{

    const [first_mount, setFirstMount]=useState(false)
    useEffect(()=>{
        setFirstMount(true)
    },[])

    return(
            <div
                className={`
                    bg-[#2f5d50] backdrop-blur-xl border border-[rgba(162,162,162,0.5)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-2 select-none

                    flex flex-col max-w-[250px]

                    transition-all duration-300 ease-in-out
                    ${isVisible ? "translate-x-0 opacity-100" : `${first_mount===true?"translate-x-0" : "-translate-x-full"} opacity-0`}

                `}
            >
                <div className="flex flex-row items-center">
                    <div className="
                         rounded-full min-w-[40px] min-h-[40px] flex mr-2.5 items-center justify-center bg-[#fff9ed]
                    ">
                        <UserPlus stroke="#2f5d50" className=""/>
                    </div>
    
                    <div className="flex flex-col min-w-0 max-h-[60px]">
                        <h1 className="text-[0.9rem] font-bold text-[#fff9ed]">Channel Invitation</h1>
                        <span className="text-[0.7rem] mt-0.5 line-clamp-2 text-[#fff9ed]">You have been invited to join {channel_name} channel by {sender_email}</span>
                    </div>
                </div>
                
            </div>
    )
}

const InfoPopup=({isVisible, message})=>{
    const [first_mount, setFirstMount]=useState(false)
    useEffect(()=>{
        setFirstMount(true)
    },[])
    // {type:"Info", message:"Notification Already Sent"}
    return(
        <div
            className={`
                bg-[#2f5d50] backdrop-blur-xl border border-[rgba(162,162,162,0.5)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] py-2 pr-2 select-none

                flex flex-col max-w-[250px]

                transition-all duration-300 ease-in-out
                ${isVisible ? "translate-x-0 opacity-100" : `${first_mount===true?"translate-x-0" : "-translate-x-full"} opacity-0`}

            `}
        >
            <div className="flex flex-row items-center">
                <div className="
                        rounded-full min-w-[10px] min-h-[10px] m-1.5 mr-2! flex items-center justify-center 
                ">
                    <SendIcon stroke="#fff9ed" className="" size={20}/>
                </div>

                <div className="flex flex-col min-w-0 max-h-[60px]">
                    <span className="text-[0.8rem] line-clamp-2 text-[#fff9ed] mr-1">{message}</span>
                </div>
            </div>
            
        </div>
    )
}

const Popup=({id, message, onUnmount, timeout_length})=>{

    if(!id || !message || !onUnmount || !timeout_length) return null

    const [isVisible, setVisible]=useState(false)


    useEffect(()=>{
        setVisible(true)

        const exitTimer=setTimeout(()=>setVisible(false), timeout_length )
        //make div invisible sfter 3 seconds

        const UnmountTimer=setTimeout(()=>{onUnmount(id)}, timeout_length+300 )
        //callback from parent which unmounts this component
        //run after 300ms of making this div invisible

        return ()=>{
            clearTimeout(exitTimer)
            clearTimeout(UnmountTimer)
        }

    },[onUnmount])

    
    return(
        <div>
            {   message.type==="Channel_Invite" &&

                <ChannelInviteLayout
                    isVisible={timeout_length===1?false:isVisible}
                    reciever_id={message.reciever_id}
                    sender_name={message.sender_name}
                    sender_email={message.sender_email}
                    community_name={message.community_name}
                    channel_name={message.channel_name}
                />
            }
            {   message.type==="Info" &&

                <InfoPopup
                    isVisible={timeout_length===1?false:isVisible}
                    message={message.message}
                />
            }
            {   message.type==="Error" &&

                <ErrorPopup
                    isVisible={timeout_length===1?false:isVisible}
                    message={message.message}
                />
            }
        </div>
    )
}



const ChatNotificationPopup = () => {

    const {NotificationsPopup, setNotificationsPopup}=useContext(WebsocketsContext)
    // Notifications=>[ {id1: Notification}, {id2: Notification},... ]
    const [Count, setCount]=useState(3)


    const RemovePopup=useCallback((id)=>{
        setNotificationsPopup((prev)=>prev.filter( (notiff)=> notiff.id!==id ))
    }, [setNotificationsPopup])

    useEffect(()=>{
            if (NotificationsPopup && NotificationsPopup.length > 0 && Array.isArray(NotificationsPopup)) {
                const notifications_limit=4
                if(NotificationsPopup.length>notifications_limit){
                    const diff=NotificationsPopup.length-notifications_limit
                    const newArray = [
                                    ...NotificationsPopup.slice(0, diff).map(notiff=>({...notiff, timeout_length:1})), // Processed first few
                                    ...NotificationsPopup.slice(diff) // The rest unchanged
                                    ];
                    setNotificationsPopup([...newArray])
                }
                
            }
    },[NotificationsPopup.length])

    // if (!NotificationsPopup || NotificationsPopup.length === 0 || !Array.isArray(NotificationsPopup)) {
    //     return null;
    // }
    return (
    <div className="relative inset-0 z-[9999] flex items-center justify-center ">
        {/* <button className="bg-red-400 absolute bottom-8 left-25 p-2 rounded-[0.5rem]"
            onClick={()=>{
                setNotificationsPopup((prev)=>[...prev, 
                    {
                    id:Count, 
                    timeout_length:2000,
                    message: {
                                type:"Error", 
                                message:`Connection Failed, Please Retry`
                            }
                    }
                ])
                
                setCount(Count+1)
            }}
        >
            Spawn Notification
        </button> */}

        {/* backdrop */}
        <div
            className={`
                absolute bottom-20 left-23
                flex flex-col gap-y-1
            `
            }
        >
            {
                NotificationsPopup.map((notification)=>{
                    return(
                        <Popup
                            key={notification.id}
                            id={notification.id}
                            message={notification.message}
                            onUnmount={RemovePopup}
                            timeout_length={notification.timeout_length}
                        />
                    )
                })
            }

        </div>

    </div>
    )
}

export default ChatNotificationPopup


//================================================================
//NOTIFICATION MESSAGE TEMPLATES FOR TESTING:
//================================================================
// {
//     "type": "Channel_Invite",
//     "reciever_id": 4,
//     "sender_name": "User4",
//     "sender_email": "User4@gmail.com",
//     "community_name": "Com3",
//     "channel_name": "questions-and-help"
// }
//================================================================
// {
//     type:"Info", 
//     message:"Invite Already Sent"
// }
//================================================================
// {
//     type:"Error", 
//     message:"SFU connection failed"
// }
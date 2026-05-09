import { createContext, useEffect, useState, useContext } from "react"
import { ChatLayout_Context } from "./ChatLayout-context-provider"
import { useParams } from "react-router-dom"
import { wsClient } from "../api/websocket"
import { ws_authenticate } from "../services/user_services"
import { useQueryClient } from "@tanstack/react-query"

const BASE_URL=import.meta.env.VITE_CHATS_WEBSOCKET_BASE_URL

export const WebsocketsContext=createContext(null)



export const WebSockets_ContextProvider = ({children}) => {

    const {setOngoingCalls}=useContext(ChatLayout_Context)
    const {communityId, channelId}=useParams()

    const [NotificationsPopup, setNotificationsPopup]=useState([])//change it to null

    const queryClient=useQueryClient()

    const updateNotifications=(data)=>{
        console.log("notifications updated: ", data)
        queryClient.invalidateQueries({queryKey:["Important_Notifications"]})
        setNotificationsPopup(prev=>[...prev, {id:prev.length+1, timeout_length:2000, message:data}])
    }

    const update_initial_ongoing_calls=(ongoing_calls)=>{
        // console.log(JSON.parse(ongoing_calls))
        // console.log(JSON.parse(`${ongoing_calls}`))
        const newOngoingCalls={} 
        for(const key of Object.keys(ongoing_calls)){
            const channel_calls={}
            for(const val of ongoing_calls[key]){
                const call=JSON.parse(val)
                channel_calls[call.channel_id]=call
            }
            if(Object.keys(channel_calls).length>0){
            newOngoingCalls[key]=channel_calls}
        }
        // const newOngoingCalls
        // console.log(newOngoingCalls)
        setOngoingCalls({...newOngoingCalls})
    }

    useEffect(()=>{
        if(!communityId || !channelId) {
            return
        }

        if(wsClient && !wsClient.socket) {   
            return
        }

        // wsClient.send({type:"Room", communityId, channelId })
        // return ()=>wsClient.disconnect()
    }, [communityId, channelId])

    useEffect(()=>{
        if(wsClient && !wsClient.socket) {

            if(communityId && channelId){
                const send_room_message=()=>{
                    wsClient.send({type:"Room", communityId, channelId })
                }

                // wsClient.subscribe_initializer("run_on_connect", send_room_message)
            }
            ws_authenticate().then((response)=>{
                if(response.Success===true){
                    wsClient.connect(`${BASE_URL}/ws/socket_test`)
                    wsClient.subscribe("Channel_Invite", updateNotifications)
                    update_initial_ongoing_calls(response.OngoingCalls)
                    
                }
            }).catch((err)=>{
                console.error(err)
            })
            
        }
    },[])



    return (
        <WebsocketsContext.Provider value={{
                                            NotificationsPopup, setNotificationsPopup
                                        }}>
            {children}
        </WebsocketsContext.Provider>
    )
}


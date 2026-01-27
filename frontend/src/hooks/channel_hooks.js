
import { get_channel_messages } from "../services/channel_services"
import { useState } from "react"


export function useChannels(){
   
    const [loading_messages, setLoadingMessages]=useState(false)

    const getMessages=async (communityid, channelid)=>{
        
        try{
            setLoadingMessages(true)
            const messages=await get_channel_messages(communityid, channelid)
            return messages
        }catch(e){
            setLoadingMessages(false)
            throw e
        }finally{
            setLoadingMessages(false)
        }
        
    }

    return {
        getMessages,
        loading_messages
    }
}
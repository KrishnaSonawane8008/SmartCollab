import { get_community_channels } from "../services/community_services"
import { useState } from "react"

export function useCommunityInfo(){
   
    const [loading_channels, setLoadingChannels]=useState(false)

    const getCommunityChannels=async (communityid)=>{
        
        try{
            setLoadingChannels(true)
            const comm_channels=await get_community_channels(communityid)
            return comm_channels
        }catch(e){
            setLoadingChannels(false)
            throw e
        }finally{
            setLoadingChannels(false)
        }
        
    }

    return {
        getCommunityChannels,
        loading_channels
    }
}
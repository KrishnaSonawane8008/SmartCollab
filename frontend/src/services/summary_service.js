import { FetchRequest } from "../api/client";


const BASE_URL=import.meta.env.VITE_API_BASE_URL

export async function get_call_logs(communityId, channelId){
    
    return await FetchRequest(
        BASE_URL, `/calls/${communityId}/${channelId}/call_logs`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
    
}


export async function get_call_summary(room_id, call_log_id){
    
    return await FetchRequest(
        BASE_URL, `/summary/${room_id}/${call_log_id}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
    
}
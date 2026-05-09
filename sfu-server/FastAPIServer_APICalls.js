require("dotenv").config()


const BACKEND_BASE_URL=process.env.FASTAPI_SERVER_BASE_URL

const SFU_KEY=process.env.SFU_KEY



class ApiError extends Error {
  constructor({ message, status, data }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data; // full response body
  }
}

async function throw_api_error(response){
    let errorData=null;
    try{
        errorData=await response.json();
    }catch{
        errorData=await response.text();
    }

    throw new ApiError({
            message: errorData?.detail || "Request Failed",
            status: response.status,
            data: errorData
        });
}

function attach_AccessToken(request_options){

    if( !request_options.credentials ){
        request_options.credentials="include"
    }

    if( !request_options.headers ){
        request_options.headers={
            "Content-Type": "application/json",
            "Authorization": `${SFU_KEY}`
        }
    }
    request_options.headers.Authorization=`${SFU_KEY}`

}


async function SendFetchRequest(
    BASE_URL,
    endpoint,
    options,
) {
    const some_url = `${BASE_URL}${endpoint}`;

    attach_AccessToken(options)

    const response = await fetch(some_url, {...options});

    if (!response.ok) {
        await throw_api_error(response)
    }

    const result = await response.json();

    // console.log("Server Response:","\n",JSON.stringify(result, null, 2))
    return result
    
}



async function FetchRequest(
    BASE_URL,
    endpoint,
    options,
) {

    try{

        const result=await SendFetchRequest(BASE_URL, endpoint, options)
        return result
    }catch(e){
        throw e
    }
}


async function is_user_authorized(uid, communityId, channelId){
    return await FetchRequest(
        BACKEND_BASE_URL, `/auth/${uid}/${communityId}/${channelId}/sfu_authorization`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
}

async function call_started(communityId, channelId, call_start_info){
    return await FetchRequest(
            BACKEND_BASE_URL, `/calls/${communityId}/${channelId}/callstarted`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    community_id:communityId,
                    channel_id:channelId,
                    call_topic:call_start_info.call_topic,
                    call_starter_id:call_start_info.call_starter_id,
                    call_starter_name:call_start_info.call_starter_name,
                    started_at:call_start_info.started_at
                })
            }
        )
}

async function call_ended(communityId, channelId, call_info){
    return await FetchRequest(
            BACKEND_BASE_URL, `/calls/${communityId}/${channelId}/callended`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    community_id:communityId,
                    channel_id:channelId,
                    call_topic:call_info.call_topic,
                    call_starter_id:call_info.call_starter_id,
                    call_starter_name:call_info.call_starter_name,
                    started_at:call_info.started_at,
                    ended_at:call_info.ended_at,
                    call_participants:call_info.call_participants,
                })
            }
        )
} 



module.exports={call_started, call_ended, is_user_authorized}



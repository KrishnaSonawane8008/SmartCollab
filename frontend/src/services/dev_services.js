import { SendFetchRequest } from "../api/client"

const BASE_URL=import.meta.env.VITE_API_BASE_URL

export async function get_all_user_credentials(dev_key){
    return await SendFetchRequest(
        BASE_URL, "/dev/allUsers",
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "DevKey":dev_key,
            }
        }
    )
}

///{communityId}/{channelId}/{call_log_id}/delete_call_log
export async function delete_call_log(communityId, channelId, call_log_id, dev_key){
    return await SendFetchRequest(
        BASE_URL, `/dev/${communityId}/${channelId}/${call_log_id}/delete_call_log`,
        {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "DevKey":dev_key,
            }
        }
    )
}

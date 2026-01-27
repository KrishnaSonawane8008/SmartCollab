import { FetchRequest } from "../api/client";

function sleep(ms) {
    console.log("sleeping")
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function get_channel_messages(communityId, channelId) {

    return await FetchRequest(
            `/channels/${communityId}/${channelId}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                }
            }
        )
}
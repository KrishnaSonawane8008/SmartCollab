import { FetchRequest } from "../api/client";

function sleep(ms) {
    console.log("sleeping")

    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function get_community_channels(community_id){
    // await sleep(3000)
    // console.log("sent request")
    return await FetchRequest(
            `/communities/${community_id}/channels`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                }
            }
        )
}
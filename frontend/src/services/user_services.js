import { FetchRequest } from "../api/client";



const BASE_URL=import.meta.env.VITE_API_BASE_URL


export async function login_user({username, email, password}){
    
    return await FetchRequest(
        BASE_URL, "/auth/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: username, email: email, password: password }),
        }
    )
    
}


export async function autologin(){
    return await FetchRequest(
        BASE_URL, "/auth/auto_login",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
}


export async function is_user_authorized(communityId, channelId){
    return await FetchRequest(
        BASE_URL, `/auth/${communityId}/${channelId}/isauthorized`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
}


export function test(){
    FetchRequest(
        BASE_URL, "/users/test",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: "username", email: "name@email.com", password: "pass" }),
        }
    )
}

export async function cors_test(){
    return await FetchRequest(
        BASE_URL, "/auth/cors_test",
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
}


export async function get_user_profile(){
    return await FetchRequest(
        BASE_URL, "/users/profile",
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
}


export async function search_users(communityId, channelId, username){
    return await FetchRequest(
        BASE_URL, `/users/${communityId}/${channelId}/search`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_name: username}),
        }
    )
}


// type:str="ChannelInvite" #Should be "ChannelInvite"
// community_id:int #Community Id of the community that this user is being invited to
// community_name:str
// channel_id:int # Channeli Id of the channel that this user is being invited to
// channel_name:str
// inviter_id:int #userid of the user that sent the invite
// inviter_name:str
// inviter_email: str
// sent_at: datetime

export async function accept_invite(invite_info){
    return await FetchRequest(
        BASE_URL, `/users/accept_invite`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                type:"ChannelInvite",
                community_id: invite_info.community_id,
                community_name: invite_info.community_name,
                channel_id: invite_info.channel_id,
                channel_name: invite_info.channel_name,
                inviter_id: invite_info.inviter_id,
                inviter_name: invite_info.inviter_name,
                inviter_email:  invite_info.inviter_email,
                sent_at: invite_info.sent_at
            }),
        }
    )
}


export async function reject_invite(invite_info){
    return await FetchRequest(
        BASE_URL, `/users/reject_invite`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                type:"ChannelInvite",
                community_id: invite_info.community_id,
                community_name: invite_info.community_name,
                channel_id: invite_info.channel_id,
                channel_name: invite_info.channel_name,
                inviter_id: invite_info.inviter_id,
                inviter_name: invite_info.inviter_name,
                inviter_email:  invite_info.inviter_email,
                sent_at: invite_info.sent_at
            }),
        }
    )
}


export async function get_communities(){
    return await FetchRequest(
        BASE_URL, "/users/communities",
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
}



export async function change_preferred_language(new_language){
    return await FetchRequest(
        BASE_URL, `/users/change_language/${new_language}`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
}


export async function LogoutUser(){
    return await FetchRequest(
        BASE_URL, "/auth/logout",
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
}


export async function get_Notifications(){
    return await FetchRequest(
        BASE_URL, "/users/notifications",
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
}


export async function ws_authenticate(){
    return await FetchRequest(
        BASE_URL, "/ws_auth/authenticate",
        {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        }
    )
}
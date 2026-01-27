import { useContext, useEffect, useState, Suspense } from "react";
import { Outlet, useParams, useNavigate, useLoaderData, Await, useMatches, useRouteLoaderData } from "react-router-dom"
import {EmptyChatSection} from "./EmptyChatSection";

import GroupBar from "./ChatLayout Components/GroupBar";
import OptionsBar from "./ChatLayout Components/OptionsBar";
import SearchBar from "./ChatLayout Components/SearchBar";
import ChannelsPanel from "./ChatLayout Components/ChannelsPanel";


import { useUserInfo } from "../../hooks/user_hooks";
import { useCommunityInfo } from "../../hooks/community_hooks";
import { useChannels } from "../../hooks/channel_hooks";

import { get_user_profile, get_communities } from "../../services/user_services";
import { get_community_channels } from "../../services/community_services";


const ChatLayout_Loader=async ({params})=>{
    // const {getUserProfile, getCommunities}=useUserInfo()
    // const {getCommunityChannels}=useCommunityInfo()

    const userInfo=await get_user_profile()
    const userCommunities=await get_communities()

    if(!params.communityId){
        return {userInfo, userCommunities, community_channels:null}
    }

    
    return {userInfo, userCommunities}
}




const ChatLayout = () => {

    const {getUserProfile, getCommunities}=useUserInfo()
    const {getCommunityChannels}=useCommunityInfo()
    const {loading_messages, getMessages}=useChannels()

    const {communityId, channelId}=useParams();

    const [UserProfile, setUserProfile]=useState(null)
    const [UserCommunities, setUserCommunities]=useState(null)

    const [Channels, setChannels]=useState(null)

    const {userInfo, userCommunities}=useLoaderData()

    const matches=useMatches()

    const community_channels_data=useRouteLoaderData("communityChannels")


    useEffect(()=>{

        // getUserProfile().then((user_profile)=>{
        //     const userInfo=user_profile.UserInfo
        //     console.log("user profile: ",userInfo.username)
        //     setUserProfile(user_profile.UserInfo)
        // }).catch((e)=>{
        //     console.log("Error getting user profile: ")
        //     console.error(e)
        // })

        if(userInfo){
            setUserProfile(userInfo.UserInfo)
        }
        
        if(userCommunities){
            setUserCommunities(userCommunities.UserCommunities)
        }


        // getCommunities().then(
        //     (communities)=>{
        //         console.log("fetched communities: ",communities.UserCommunities)
        //         setUserCommunities(communities.UserCommunities)
        //     }
        // ).catch((e)=>{
        //     console.log("Error getting communities: ")
        //     console.error(e)
        // })


        if(!communityId) return;

        // console.log("url parameters: ",communityId,", ",channelId)
        // getCommunityChannels(communityId).then((channels)=>{
        //     console.log("fetched community channels: ",channels.Channels)
        //     setChannels(channels.Channels)
        // }).catch((e)=>{
        //     console.error(`Error while getting Channels for community ${communityId}: \n ${e}`)

        //     throw new Error("user is not authorized to access this channel")
        // })

        // setCurrentCommunity(communityId)

        if(!channelId) return

        // getMessages(communityId,channelId).then((messages)=>{
        //     console.log(messages)
        // }).catch((e)=>{
        //     console.error(`Error while getting Messages for channel ${channelId}: \n ${e}`)
        // })

        // setCurrentChannel(channelId)


    }, [])






    // useEffect(()=>{

    //     if(!communityId) return

    //     // console.log("url parameters: ",communityId,", ",channelId)
    //     getCommunityChannels(communityId).then((channels)=>{
    //         // console.log("Channels: ",channels)
    //         console.log("getting channels in useEffect")
    //         setChannels(channels.Channels)
    //     }).catch((e)=>{
    //         console.error(`Error while getting Channels for community ${communityId}: \n ${e}`)
    //     })


    // }, [communityId])


    // useEffect( ()=>{

    //     if(!channelId || !communityId) return

    //     async function loadMessages() {
            
    //         try{
    //             const messages=await getMessages(communityId,channelId)
    //             console.log(messages)
    //         }catch(e){
    //             console.log("==========================================")
    //             console.log(e.status)
    //             console.log("==========================================")
    //         }
    //     }

    //     loadMessages();
        
    // }, [communityId ,channelId] )





    if(!UserProfile || !UserCommunities ){
        return null;
    }



  return (
    <div className="h-screen w-full bg-green-500 flex flex-row">
        <div className="h-full max-w-[300px] w-full bg-blue-400">

            <div className="w-ful h-full flex flex-row">
                    <GroupBar 
                        username={UserProfile.username} 
                        email={UserProfile.email} 
                        communities={UserCommunities}
                    />
                
                <div className="flex flex-col min-w-0 w-full h-full">
                    <OptionsBar/>
                    <SearchBar/>
                    <Suspense fallback={
                        <div className="w-full h-full bg-amber-50">
                            ...Loading Channels
                        </div>
                    }>

                        <Await resolve={community_channels_data.community_channels}>
                            {(channels)=>{
                                console.log("setting channel values: ",channels.Channels)
                                return(
                                    <ChannelsPanel
                                        channels={channels.Channels}
                                    />
                                )
                            }
                            }
                        </Await>
                        
                    </Suspense>
                    
                </div>

            </div>

        </div>

        <div className="w-full h-full">
            <Outlet />
        </div>
        
      
    </div>
  )
}

export {ChatLayout, ChatLayout_Loader}

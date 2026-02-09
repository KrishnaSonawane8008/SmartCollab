import { useContext, useEffect, useState, Suspense } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom"
import {EmptyChatSection} from "./EmptyChatSection";

import GroupBar from "./ChatLayout Components/GroupBar";
import OptionsBar from "./ChatLayout Components/OptionsBar";
import SearchBar from "./ChatLayout Components/SearchBar";
import ChannelsPanel from "./ChatLayout Components/ChannelsPanel";

import { useAsyncError } from "../../hooks/ErrorHooks";

import { useUserInfo } from "../../hooks/user_hooks";
import { ChatLayout_Context } from "../../contexts/ChatLayout-context-provider";





const ChatLayout = () => {

    const {getUserProfile, getCommunities}=useUserInfo()

    const {user_id, setUserid}=useContext(ChatLayout_Context)
    const throwError=useAsyncError()

    const {communityId, channelId}=useParams();

    const [UserProfile, setUserProfile]=useState(null)
    const [UserCommunities, setUserCommunities]=useState(null)

 

    useEffect(()=>{

        getUserProfile().then((user_profile)=>{
            const userInfo=user_profile.UserInfo
            console.log("user profile: ",userInfo.username)
            setUserProfile(user_profile.UserInfo)
            if(user_profile.UserInfo){
                setUserid(user_profile.UserInfo.user_id)
            }
        }).catch((e)=>{
            console.log("Error getting user profile: ")
            throwError(e)
        })

        // if(userInfo){
        //     setUserProfile(userInfo.UserInfo)
        // }
        
        // if(userCommunities){
        //     setUserCommunities(userCommunities.UserCommunities)
        // }


        getCommunities().then(
            (communities)=>{
                console.log("fetched communities: ",communities.UserCommunities)
                setUserCommunities(communities.UserCommunities)
            }
        ).catch((e)=>{
            console.log("Error getting communities: ")
            console.error(e)
        })


        if(!communityId) return;

        // console.log("url parameters: ",communityId,", ",channelId)
        // getCommunityChannels(communityId).then((channels)=>{
        //     console.log("fetched community channels: ",channels.Channels)
        //     setChannels(channels.Channels)
        // }).catch((e)=>{
        //     console.error(`Error while getting Channels for community ${communityId}: \n ${e}`)
        //     // showBoundary(e)
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
                    <ChannelsPanel />

                    
                </div>

            </div>

        </div>

        {channelId ?(
            <div className="w-full h-full">
                <Outlet />
            </div>
        ):(
            <EmptyChatSection/>
        )
        
        }
        
      
    </div>
  )
}

export {ChatLayout}

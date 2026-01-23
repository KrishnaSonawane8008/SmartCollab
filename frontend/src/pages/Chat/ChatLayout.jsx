import { useEffect, useState, useLayoutEffect } from "react";
import { Outlet, useParams } from "react-router-dom"
import EmptyChatSection from "./EmptyChatSection";

import GroupBar from "./ChatLayout Components/GroupBar";
import OptionsBar from "./ChatLayout Components/OptionsBar";
import SearchBar from "./ChatLayout Components/SearchBar";
import ConversationTabs from "./ChatLayout Components/ConversationTabs";

import { useUserInfo } from "../../hooks/user_hooks";

const ChatLayout = () => {

    const {getUserProfile, getCommunities, loading_communities, doCorsTest}=useUserInfo()

    const url_params=useParams();
    const [ConvId, setConvId]=useState(null)
    const [UserProfile, setUserProfile]=useState(null)
    const [UserCommunities, setUserCommunities]=useState(null)
    const [CommunityChannels, setCommunityChannels]=useState(null)


    useEffect(()=>{

        getUserProfile().then((user_profile)=>{
            const userInfo=user_profile.UserInfo
            console.log("user profile: ",userInfo.username)
            setUserProfile(user_profile.UserInfo)
        }).catch((e)=>{
            console.log("Error getting user profile: ")
            console.error(e)
        })
        

        console.log("getting communities")
        getCommunities().then(
            (communities)=>{
                console.log(communities.UserCommunities)
                setUserCommunities(communities.UserCommunities)
            }
        ).catch((e)=>{
            console.log("Error getting communities: ")
            console.error(e)
        })

        // doCorsTest().then((test_result)=>{
        //     console.log(`Cors Test Resulr: ${test_result}`)
        // }).catch((e)=>{
        //     console.log("Cors test Error: ")
        //     console.error(e)
        // })
    }, [])


    useEffect(()=>{
        console.log("url parameters: ",url_params.conversationId)
        setConvId(url_params.conversationId)
    }, [url_params])

    useEffect( ()=>{

    } )

    // useEffect( ()=>{
    //     setUserProfile(UserProfile)
    // }, [UserProfile] )

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
                
                <div className="flex flex-col w-full h-full">
                    <OptionsBar/>
                    <SearchBar/>
                    <ConversationTabs/>
                </div>

            </div>

        </div>

        { ConvId ? 
            (
                <div className="w-full h-full">
                    <Outlet />
                </div>
            ):(
                <div className="w-full h-full">
                    < EmptyChatSection />
                </div>
            ) 
        }
        
      
    </div>
  )
}

export default ChatLayout

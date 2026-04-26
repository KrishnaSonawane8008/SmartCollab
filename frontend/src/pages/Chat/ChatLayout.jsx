import { useContext, useEffect, useState, Suspense } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom"
import {EmptyChatSection} from "./EmptyChatSection";

import GroupBar from "./ChatLayout Components/GroupBar";
import ChannelsPanel from "./ChatLayout Components/ChannelsPanel";

import { useAsyncError } from "../../hooks/ErrorHooks";

import { useUserInfo } from "../../hooks/user_hooks";
import { ChatLayout_Context } from "../../contexts/ChatLayout-context-provider";
import { Global_Context } from "../../contexts/Global-context-provider";

const ChatLayout = () => {
    const {getUserProfile}=useUserInfo()

    const {user_id, setUserid, user_name, setUserName}=useContext(ChatLayout_Context)
    const {setUserData}=useContext(Global_Context)
    const throwError=useAsyncError()

    const {communityId, channelId}=useParams();

    const [UserProfile, setUserProfile]=useState(null)
    const [UserCommunities, setUserCommunities]=useState(null)

    const [channelOpen, setChannelOpen] = useState(true)
    
  
    useEffect(()=>{

        getUserProfile().then((user_profile)=>{
            const userInfo=user_profile.UserInfo
            console.log("user profile: ",userInfo.username)
            setUserProfile(user_profile.UserInfo)
            if(user_profile.UserInfo){
                setUserData(user_profile.UserInfo)
                setUserid(user_profile.UserInfo.user_id)
                setUserName(user_profile.UserInfo.username)
            }
        }).catch((e)=>{
            console.log("Error getting user profile: ")
            throwError(e)
        })


        


        if(!communityId || !channelId) return;


    }, [])

  if (!UserProfile ) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2F5D50]/20 border-t-[#2F5D50] rounded-full animate-spin" />
          <span className="text-[#8A817C] text-sm">Loading workspace...</span>
        </div>
      </div>
    )
  }

  return (
    <div>

    <div className="chat-wrapper p-4 bg-[#152e24]">


      <div 
        className="w-[68px] h-full flex flex-col flex-shrink-0 z-20 items-center py-4 rounded-[28px] border border-[rgba(255,255,255,0.1)] transition-all mr-4"
        style={{
          background: 'linear-gradient(180deg, #1F4D3A 0%, #153C2E 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 30px rgba(0,0,0,0.25)'
        }}
      >
        <GroupBar
          username={UserProfile.username}
          email={UserProfile.email}
          channelOpen={channelOpen}
          setChannelOpen={setChannelOpen}
        />
      </div>
      
      {/* Main Workspace Card */}
      <div className="main-workspace-card rounded-[32px] bg-[#f8f8f8] shadow-[inset_0_4px_24px_rgba(0,0,0,0.02),0_10px_30px_rgba(0,0,0,0.2)] font-[Inter] text-[var(--sc-text-primary)]">
        
        {/* Channels Panel - Persistent Width Toggle */}

          <div 
            className={`channels-panel-wrapper bg-[#f5f6f5] border-r border-gray-100 ${channelOpen ? "w-[280px]!" : "w-[0px]!"} transition-all duration-200 overflow-hidden`}
            // style={{ width: channelOpen ? "280px" : "0px" }}
          >
            <div className="w-[280px] h-full"> 
              <ChannelsPanel />
            </div>
          </div>
        
        
        {/* Chat Section Area */}
        <div className="chat-section relative">
          
          {/* 1. CHAT AREA (Visible if no active call or if call is minimized/maximized) */}
          {
            channelId ? <Outlet /> : <EmptyChatSection />
          }

          {/* 2. VIDEO CALL (SINGLE INSTANCE) */}
          {/* {callActive && (
            <div
              className={`
                ${maximized ? "fixed inset-0 z-50 p-4 bg-[#152e24]" : "absolute inset-0 z-40"}
                ${minimized ? "hidden" : "block"}
              `}
            >
                <VideoCallSection />
            </div>
          )} */}

          {/* 3. MINIMIZED CALL (Floating Window) */}
          {/* {callActive && minimized && (
            <MinimizedCall />
          )} */}
          
        </div>
      </div>
    </div>

    </div>
  )
}

export { ChatLayout }
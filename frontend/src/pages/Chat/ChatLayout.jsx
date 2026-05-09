import { useContext, useEffect, useState, Suspense, useCallback } from "react";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom"
import { PhoneCall, PhoneOff } from "lucide-react";
import {EmptyChatSection} from "./EmptyChatSection";
import { useQueryClient } from "@tanstack/react-query";

import GroupBar from "./ChatLayout Components/GroupBar";
import ChannelsPanel from "./ChatLayout Components/ChannelsPanel";

import { useAsyncError } from "../../hooks/ErrorHooks";
import ErrorComponent from "../common components/ErrorComponent";

import { useUserInfo } from "../../hooks/user_hooks";
import { ChatLayout_Context } from "../../contexts/ChatLayout-context-provider";
import { Global_Context } from "../../contexts/Global-context-provider";
import Notifications from "./Notifications";

import { wsClient } from "../../api/websocket";
import chalk from "chalk";
import CenterFloatingDiv from "../common components/CenterFloatingDiv";
import { webrtc_client } from "../../api/webrtc_client";




const IncomingCall_UI=({data})=>{
  const {setIncomingCall, OngoingCalls, setJoinedCall}=useContext(ChatLayout_Context)
  const [ShowConfirmAccept, setShowConfirmAccept]=useState(null)
  const navigate=useNavigate()
  return(
    <CenterFloatingDiv parent_classes={"max-w-[70%]"}>

    {
      ShowConfirmAccept===true?(
        <div className="p-6 ">
          <h2 className="text-xl font-bold mb-2 text-red-500">Join this Call?</h2>
          <p className="text-sm text-[var(--sc-on-surface-variant)] mb-6">You Appear to be in another call right now. If you join this call you'll leave the current call you're in.</p>
          <div className="flex justify-end gap-3 mt-4">
            <button 
              className="px-5 py-2 text-sm font-semibold text-[var(--sc-on-surface-variant)] hover:bg-[var(--sc-surface-low)] rounded-xl transition-colors"
              onClick={() =>{ 
                  setShowConfirmAccept(false)
                  setIncomingCall((prev)=>{
                    const {[`${data.community_id}_${data.channel_id}`]:_, ...rest}=prev
                    return rest
                  })
                }
              }
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm bg-red-500 text-white hover:bg-red-600"
              onClick={async ()=>{
                  setShowConfirmAccept(false)
                  setIncomingCall((prev)=>{
                    const {[`${data.community_id}_${data.channel_id}`]:_, ...rest}=prev
                    return rest
                  })
                  webrtc_client.disconnect();
                  setJoinedCall(null)
                  setJoinedCall({community_id:data.community_id, channel_id:data.channel_id})
                  navigate(`/chats/${data.community_id}/${data.channel_id}/videocall`)
                }
              }
            >
              Accept Anyway
            </button>
          </div>
      </div>
      ):(
        <div className="p-6 select-none">
          <h2 className="text-xl font-bold mb-6 text-[var(--sc-on-surface)] flex items-center gap-2">
            Incoming Call
          </h2>

          <label className="block text-xs font-semibold text-[var(--sc-on-surface-variant)] tracking-wider mb-5">
            From {data?.starter_name}
          </label>

          <label className="block text-xs font-semibold text-[var(--sc-on-surface-variant)] tracking-wider mb-5">
            Topic: {data?.call_topic}
          </label>

          <div className="flex justify-center items-center gap-3 mt-4">
            <button 
              className="p-3 rounded-full text-sm font-semibold text-[var(--sc-on-surface-variant)] transition-colors duration-200 shadow-sm cursor-pointer bg-green-400 hover:bg-green-500"
              onClick={()=>{
                if(webrtc_client.device===null){
                  setIncomingCall((prev)=>{
                    const {[`${data.community_id}_${data.channel_id}`]:_, ...rest}=prev
                    return rest
                  })
                  setJoinedCall({community_id:data.community_id, channel_id:data.channel_id})
                  navigate(`/chats/${data.community_id}/${data.channel_id}/videocall`)
                }else{
                  setShowConfirmAccept(true)
                }
              }}
            >
              <PhoneCall stroke="#ffffff"/>
            </button>
            <button
              className={`p-3 rounded-full text-sm font-semibold transition-colors duration-200 shadow-sm cursor-pointer bg-red-400 hover:bg-red-500`}
              onClick={()=>{
                setIncomingCall((prev)=>{
                  const {[`${data.community_id}_${data.channel_id}`]:_, ...rest}=prev
                  return rest
                })
              }}
            >
              <PhoneOff stroke="#ffffff"/>
            </button>
          </div>
        </div>
      )
    }
    </CenterFloatingDiv>
  )
}




const ChatLayout = () => {
    const {getUserProfile}=useUserInfo()

    const {user_id, setUserid, user_name, setUserName, IncomingCall, setIncomingCall, OngoingCalls, setOngoingCalls}=useContext(ChatLayout_Context)
    const {setUserData, setLanguageChanged}=useContext(Global_Context)
    const throwError=useAsyncError()

    const {communityId, channelId}=useParams();
    const location=useLocation()

    const [UserProfile, setUserProfile]=useState(null)

    const [channelOpen, setChannelOpen] = useState(true)

    const queryClient = useQueryClient();
    
    const onlyDigits = (str) => /^\d+$/.test(str);
    
    const VideoCall_Notification_update=useCallback((data, options)=>{
      const profile=options?.profile
      if(!profile) return
      if(data?.type==="VideoCall"){

        if(data?.status==="Ongoing"){
          const community_id=data.community_id
          const channel_id=data.channel_id


          setOngoingCalls((prev)=>({...prev, 
              [community_id]:{
                  ...prev[community_id],
                  [channel_id]:data
              }
          }))
          
          if(profile.user_id===data.starter_id){
            console.log(data)
          }else{
            console.log(data)

            setIncomingCall((prev)=>({...prev, [`${community_id}_${channel_id}`]:data }))
          }
        }else if(data?.status==="Ended"){
            const community_id=data.community_id
            const channel_id=data.channel_id

            queryClient.invalidateQueries({queryKey: ["call_logs", community_id, channel_id]})

            setIncomingCall((prev)=>{
              const {[`${community_id}_${channel_id}`]:_, ...rest}=prev
              return rest
            })

            setOngoingCalls((prev) => {
              const community_calls = prev[community_id]

              if (!community_calls) return prev

              const { [channel_id]: removed, ...remainingChannels } =
                community_calls

              if (Object.keys(remainingChannels).length === 0) {
                const { [community_id]: removedCommunity, ...rest } = prev
                return rest
              }

              return {
                ...prev,
                [community_id]: remainingChannels,
              }
            })

        }

      }
    },[OngoingCalls])

    useEffect(()=>{
        console.log(chalk.green("ChatLayout Mounted"))
        getUserProfile().then((user_profile)=>{
            const userInfo=user_profile.UserInfo
            console.log("user profile: ",userInfo.username)
            setUserProfile(user_profile.UserInfo)
            if(user_profile.UserInfo){
                setUserData(user_profile.UserInfo)
                setLanguageChanged(user_profile.UserInfo.preferred_language)
                setUserid(user_profile.UserInfo.user_id)
                setUserName(user_profile.UserInfo.username)
                wsClient.subscribe("VideoCall", VideoCall_Notification_update, {profile:user_profile.UserInfo})
            }
        }).catch((e)=>{
            console.log("Error getting user profile: ")
            throwError(e)
        })



        if(!communityId || !channelId) return;


    }, [])
  
  // if(communityId && onlyDigits(communityId)===false){
  //   throw new Error("URL not valid")
  // }


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

      {
        Object.keys(IncomingCall).map((key, indx)=>{
          const data=IncomingCall[key]
          console.log(data)
          return(
            <IncomingCall_UI key={key} data={data}/>
          )
        })
      }


      <div 
        className="w-[68px] h-full flex flex-col flex-shrink-0 z-20 items-center py-3 rounded-[28px] border border-[rgba(255,255,255,0.1)] transition-all mr-4"
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
      <div className="main-workspace-card rounded-[32px] shadow-[inset_0_4px_24px_rgba(0,0,0,0.02),0_10px_30px_rgba(0,0,0,0.2)] font-[Inter] text-[var(--sc-text-primary)]">
        
        {/* Channels Panel - Persistent Width Toggle */}

        {
          location.pathname==="/chats/notifications" ?( 
            <div className="relative w-full h-full">
              <Notifications/>
            </div>
          ):(
            <div 
              className={`channels-panel-wrapper bg-[#f5f6f5] border-r border-gray-100 ${channelOpen ? "w-[280px]!" : "w-[0px]!"} transition-all duration-200 overflow-hidden`}
              // style={{ width: channelOpen ? "280px" : "0px" }}
            >
              <div className="w-[280px] h-full"> 
                <ChannelsPanel />
              </div>
            </div>
          )
        }
        
        
        
        
        {/* Chat Section Area */}
        <div className="chat-section relative">
          
          {/* 1. CHAT AREA (Visible if no active call or if call is minimized/maximized) */}
          {
            location.pathname==="/chats/notifications" ?( 
              <></>
            ): communityId ?( 
                onlyDigits(communityId)===true ?(
                  channelId ?(
                    onlyDigits(channelId)===true ?(
                      <Outlet/>
                    ):(
                      <ErrorComponent 
                        err_msg={"URL not valid"}
                        status_code={400}
                      />
                    )
                  ):(
                    <EmptyChatSection/>
                  )
                ):(
                  <ErrorComponent 
                    err_msg={"URL not valid"}
                    status_code={400}
                  />
                )
            ):(
              <EmptyChatSection/>
            )
          }
          
        </div>
      </div>
    </div>

    </div>
  )
}

export { ChatLayout }
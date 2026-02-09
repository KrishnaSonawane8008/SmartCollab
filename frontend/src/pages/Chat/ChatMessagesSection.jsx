import ChatHeader from "./MessageSection Components/ChatHeader"
import TextBox from "./MessageSection Components/TextBox"
import MessageBar from "./MessageSection Components/MessageBar"
import { useParams } from "react-router-dom"
import { useContext, useEffect, useRef, useState } from "react"
import { ChatLayout_Context } from "../../contexts/ChatLayout-context-provider"
import { get_channel_messages } from "../../services/channel_services"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import ScrollBar from "../common components/ScrollBar"
import { WebsocketsContext } from "../../contexts/WebSockets-context-provider"
import { wsClient } from "../../api/websocket"




const ChatMessagesSection = () => {

  const {communityId, channelId}=useParams()

  const scrollbarRef=useRef(null)

  const {setCommunityChannelMap, user_id}=useContext(ChatLayout_Context)

  const wesocket=useContext(WebsocketsContext)
  const queryClient=useQueryClient()
  const [scroll, doScroll]=useState(false)

  const {data, isLoading, isError, error}=useQuery({
    queryKey: ["messages", communityId, channelId],
    queryFn: ()=>{return get_channel_messages(communityId, channelId)},
    enabled: !!channelId && !!communityId,
    staleTime: 1000*60*1
  })


  const update_message_list=({type, sender_id, community_id, channel_id, message})=>{
    // console.log("on recieve:",type, sender_id, typeof(community_id), typeof(channel_id), message)
    if(!type || !sender_id || !community_id || !channel_id || !message) return
    
    const state = queryClient.getQueryState(["messages", String(community_id), String(channel_id)])

    if(!state) return

    queryClient.setQueryData(
      ["messages", String(community_id), String(channel_id)],
      (old) => {
        const prev = old?.Messages ?? []
        console.log(user_id)
        return {
          ...old,
          Messages: [...prev, {type, sender_id:sender_id==user_id?"user":sender_id, community_id, channel_id, message} ],
        }
      }
    )

  }



  useEffect(()=>{
    if(!communityId) return
    if(isError){
      setCommunityChannelMap( (prev)=>{
          return {...prev, [communityId]:null }
      } )
    }

  },[isError, error])


  useEffect(()=>{

    if(wsClient && communityId && channelId){
      console.log("subscribing")
      wsClient.subscribe("session_messages", update_message_list)
    }
    
    
  },[communityId, channelId])

  useEffect(()=>{
    if(scrollbarRef.current){ 
      scrollbarRef.current.scrollToBottom()
    }
  },[data])



  const sendMessage=(value)=>{
    if(!value || !wsClient) return
    wsClient.send(
      { 'type': 'message', 
        'communityId': communityId, 
        'channelId': channelId, 
        "message":value})
    console.log("message Sent: ", value)
  }


  if(isError){
    throw error
  }


  if(isLoading){
    return (
      <div className="w-full h-full flex flex-col">
        <ChatHeader/>
        <div className="w-full h-full bg-gray-600 flex justify-center items-center">
          <Loader2 className="animate-spin"/>
        </div>
        <MessageBar/>
      </div>
    )
  }


  return (
    <div className='bg-amber-500 w-full h-full flex flex-col'>
      {/* Header */}
        <ChatHeader/>

      {/* Messages */} 
      <div className='bg-gray-600 h-full w-full overflow-y-hidden flex'>
        <ScrollBar ref={scrollbarRef} barWidth={10}>
        {
          data && Array.isArray(data.Messages) &&

            data.Messages.map((message_obj, index)=>{
              return(
                <div key={index}>
                  <TextBox fromUser={message_obj.sender_id=="user"} message={message_obj.message} sender_id={message_obj.sender_id}/>
                </div>
              )
            })
          
          
          // Array.from({length:20}, (v,i)=>{return i}).map( (elem)=>{
          //   return (
          //     <div key={elem} className="w-full">
          //       {
          //         elem%2==0 ? (
          //           <TextBox fromUser={true} message={"From User"}/>
          //         ):(
          //           <TextBox fromUser={false} message={"From Sender"}/>
          //         )
          //       }
          //     </div>
          //   )
          // } )
        }
        </ScrollBar>
        
      </div>

      {/* Message Bar */}
      <MessageBar sendMessage_callback={sendMessage}/>

    </div>
  )
}

export default ChatMessagesSection

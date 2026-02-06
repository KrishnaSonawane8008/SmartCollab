import ChatHeader from "./MessageSection Components/ChatHeader"
import TextBox from "./MessageSection Components/TextBox"
import MessageBar from "./MessageSection Components/MessageBar"
import { useParams } from "react-router-dom"
import { useContext, useEffect, useRef } from "react"
import { ChatLayout_Context } from "../../contexts/ChatLayout-context-provider"
import { get_channel_messages } from "../../services/channel_services"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import ScrollBar from "../common components/ScrollBar"
import { WebsocketsContext } from "../../contexts/WebSockets-context-provider"
import { wsClient } from "../../api/websocket"

const ChatMessagesSection = () => {

  const {communityId, channelId}=useParams()

  const scrollbarRef=useRef(null)

  const {setCommunityChannelMap}=useContext(ChatLayout_Context)
  const wesocket=useContext(WebsocketsContext)

  const {data, isLoading, isError, error}=useQuery({
    queryKey: ["messages", communityId, channelId],
    queryFn: ()=>{return get_channel_messages(communityId, channelId)},
    enabled: !!channelId && !!communityId,
    staleTime: 1000*60*1
  })




  useEffect(()=>{
    if(!communityId) return
    if(isError){
      setCommunityChannelMap( (prev)=>{
          return {...prev, [communityId]:null }
      } )
    }

  },[isError, error])


  useEffect(()=>{
    if(!scrollbarRef.current){ 
      console.log("scrollbarRef null, unable to scrollto the bottom")
      return
    }
    console.log("scrolled to the bottom")
    scrollbarRef.current.scrollToBottom()
  },[communityId, channelId])



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
          // data && Array.isArray(data.Messages) &&
          
          
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

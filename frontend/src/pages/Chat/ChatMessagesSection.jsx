import ChatHeader from "./MessageSection Components/ChatHeader"
import TextBox from "./MessageSection Components/TextBox"
import MessageBar from "./MessageSection Components/MessageBar"
import { useParams } from "react-router-dom"
import { useContext, useEffect, useRef } from "react"
import { ChatLayout_Context } from "../../contexts/ChatLayout-context-provider"
import { Global_Context } from "../../contexts/Global-context-provider"
import { get_channel_messages } from "../../services/channel_services"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import ScrollBar from "../common components/ScrollBar"
import { wsClient } from "../../api/websocket"

const ChatMessagesSection = () => {
  const { communityId, channelId } = useParams()
  const scrollbarRef = useRef(null)

  const { setCommunityChannelMap, user_id } = useContext(ChatLayout_Context)
  const { UserData, LanguageChanged } = useContext(Global_Context)

  const queryClient = useQueryClient()

  const { data, isLoading, isError, error, isFetching, isSuccess } = useQuery({
    queryKey: ["messages", communityId, channelId, UserData?.preferred_language],
    queryFn: () => { return get_channel_messages(communityId, channelId, UserData?.preferred_language) },
    enabled: !!channelId && !!communityId,
    
    staleTime: 1000 * 60 * 1,

    refetchOnMount: false,        
    refetchOnWindowFocus: false, 
    refetchOnReconnect: false,   
  })

  const update_message_list = ({ type, sender_id, sender_name, community_id, channel_id, message, sent_at }) => {
    if (!type || !sender_id || !community_id || !channel_id || !message) return
    const state = queryClient.getQueryState(["messages", String(community_id), String(channel_id), UserData?.preferred_language])
    if (!state) return
    queryClient.setQueryData(
      ["messages", String(community_id), String(channel_id), UserData?.preferred_language],
      (old) => {
        const prev = old?.Messages ?? []
        return {
          ...old,
          Messages: [...prev, { type, sender_id: sender_id == user_id ? "user" : sender_id, sender_name, community_id, channel_id, sent_at, message, is_new_message: true }],
        }
      }
    )
  }

  useEffect(() => {
    if (!communityId) return
    if (isError) {
      setCommunityChannelMap((prev) => {
        return { ...prev, [communityId]: null }
      })
    }
  }, [isError, error])

  useEffect(() => {
    let cleanup_subscribe = null
    if (wsClient && communityId && channelId) {
      cleanup_subscribe = wsClient.subscribe("message", update_message_list)
    }
    return () => {
      if (cleanup_subscribe) {
        cleanup_subscribe()
      }
    }
  }, [communityId, channelId, UserData?.preferred_language])

  // Keep this fallback just in case a manual scroll anchor is required during dynamic live updates
  useEffect(() => {
    if (scrollbarRef.current && isSuccess) {
      scrollbarRef.current?.scrollToBottom()
    }
  }, [data, isSuccess, isFetching])

  const sendMessage = (value) => {
    if (!value || !wsClient) return
    wsClient.send({
      'type': 'message',
      'communityId': communityId,
      'channelId': channelId,
      "message": value
    })
  }

  if (isError) {
    throw error
  }

  // Pre-process date variables backwards to align correctly with the inverted map loop
  let next_sent_date = null

  return (
    <div className="chat-section bg-[#F5F3EF] w-full h-full flex flex-col relative">
      <div className="w-full flex-shrink-0 relative">
        <ChatHeader queryClient={queryClient} />
      </div>

      <div className="messages-container py-0! flex-1 w-full relative overflow-y-auto custom-scrollbar">
        
        {isFetching ? (
          <div className="absolute inset-0 bg-[#F5F3EF] flex justify-center items-center z-20">
            <div className="w-6 h-6 border-2 border-[#2F5D50]/20 border-t-[#2F5D50] rounded-full animate-spin" />
          </div>
        ) : null}

        <ScrollBar ref={scrollbarRef}>
          <div className="w-full flex flex-col items-center justify-center">
            {/* FIX: Turned into flex-col-reverse. HTML tree renders from bottom up natively */}
            <div className="flex flex-col-reverse px-8 w-full bg-transparent">
              
              {/* Bottom Spacer is now placed at the TOP of the reverse container */}
              <div className="h-[92px] flex-shrink-0"></div>

              {data?.Messages && Array.isArray(data.Messages) &&
                [...data.Messages].reverse().map((msg, i, arr) => {
                  const CurrentSentDate = new Date(msg.sent_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })

                  // Date header calculations inverted to look ahead at the chronologically preceding message
                  let date_change = false
                  const priorMsg = arr[i + 1] 
                  if (priorMsg) {
                    const PriorSentDate = new Date(priorMsg.sent_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                    if (CurrentSentDate !== PriorSentDate && CurrentSentDate !== "Invalid Date") {
                      date_change = true
                    }
                  } else if (CurrentSentDate !== "Invalid Date") {
                    // First chronological message (which is at the index tail end of a reversed array)
                    date_change = true
                  }

                  const last_message_id = msg.message_id || null
                  const component_key = `${i}-${communityId}-${channelId}-${last_message_id}-${UserData?.preferred_language}`
                  
                  return (
                    <div key={component_key} className="flex flex-col">
                      {date_change && CurrentSentDate && (
                        <div className="text-[var(--sc-on-surface-muted)] py-4 w-full flex justify-center text-xs font-medium order-first">
                          <div className="bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                            {CurrentSentDate}
                          </div>
                        </div>
                      )}
                      <TextBox
                        fromUser={msg.sender_id == "user"}
                        message={msg.message}
                        unique_id={component_key}
                        sender_id={msg.sender_id}
                        sender_name={msg.sender_name}
                        sent_at={msg.sent_at}
                        is_new_message={msg.is_new_message}
                      />
                    </div>
                  )
                })}
            </div>
          </div>
        </ScrollBar>
      </div>

      <div className="absolute bottom-0 w-full z-10 h-[90px] flex flex-col justify-end">
        <div className="w-full relative">
          <div className="absolute inset-0 -z-10 backdrop-blur-md [mask-image:linear-gradient(to_bottom,transparent_0%,black_30%,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_30%,black_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent_0%,rgba(248,248,248,0.6)_30%,rgba(248,248,248,1)_100%)]" />
          <div className="mt-5 pb-7">
            <MessageBar onEnter_callback={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMessagesSection

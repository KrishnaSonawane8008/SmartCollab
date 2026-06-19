import { useQuery, useQueryClient } from "@tanstack/react-query"
import { get_Notifications } from "../../services/user_services"
import { useEffect, useContext } from "react"
import { ChatLayout_Context } from "../../contexts/ChatLayout-context-provider"
import { useNavigate, useParams } from "react-router-dom"
import { MoveLeft, UserPlus } from "lucide-react"
import ScrollBar from "../common components/ScrollBar"
import { accept_invite, reject_invite } from "../../services/user_services"
import { join_channel } from "../../services/channel_services"
import { wsClient } from "../../api/websocket"


const Header=()=>{

    const {CurrentCommunity, CurrentChannel }=useContext(ChatLayout_Context)
    const navigate=useNavigate()
    
    return(
        <div className="w-full h-[2.75rem] py-8 px-4 bg-[#2f5d50] flex flex-row items-center">
            <MoveLeft className="mr-auto ml-2 text-white cursor-pointer" preserveAspectRatio="none"
            onClick={()=>{
                if(CurrentCommunity){
                  if(CurrentChannel){
                    navigate(`/chats/${CurrentCommunity}/${CurrentChannel}`)
                  }else{
                    navigate(`/chats/${CurrentCommunity}`)
                  }
                }else{
                  navigate(`/chats`)
                }
            }}
            />
        </div>
    )
}


const ChannelInvite=({Invite, refetch})=>{
  // {"type":"ChannelInvite",
  //   "community_id":3,
  //   "community_name":"Com3",
  //   "channel_id":2,
  //   "channel_name":"daily-chat",
  //   "inviter_id":2,
  //   "inviter_name":"User2",
  //   "inviter_email":"User2@gmail.com",
  //   "sent_at":"2026-04-29T11:45:06.399595Z"}

  const {JoinedCommunity, setJoinedCommunity}=useContext(ChatLayout_Context)
  const queryClient=useQueryClient()

  const navigate=useNavigate()
  let sent_date=null
  let sent_time=null
  if(Invite.sent_at && typeof(Invite.sent_at)=="string"){
    const dateObj = new Date(Invite.sent_at);
    const date = dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    sent_date=date
    const time = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    sent_time=time
    // console.log( date, time)
  }

  return(
    <div className="w-full my-2 rounded-[0.5rem] flex flex-row bg-[#f4e6c8] p-2">
      <div className="flex flex-row justify-center m-3 items-center">
        <UserPlus stroke="#2f5d50" className=""/>
      </div>
      <div className="flex flex-col">
            <h1 className="text-[0.9rem] font-bold text-[#2f5d50]">Channel Invite</h1>
            <span className="text-[0.7rem] mt-0.5 line-clamp-2 text-[#2f5d50]">You have been invited to join {Invite.channel_name} channel of the {Invite.community_name} by {Invite.inviter_name}</span>

            <span className="text-[0.7rem] mt-0.5 line-clamp-2 text-[#2f5d50]">You can contact {Invite.inviter_name} by their email: {Invite.inviter_email}</span>

            <span className="text-[0.7rem] mt-0.5 line-clamp-2 text-[#2f5d50]">Sent at: {sent_date}, {sent_time}</span>

      </div>
      <div className="flex flex-row items-center ml-auto mr-3">
        <button 
          className="mx-1 text-[#f2f0ec] cursor-pointer p-2 rounded-[0.6rem] bg-[#2a7e66]"
          onClick={()=>{
            join_channel(Invite.community_id, Invite.channel_id)
            .then((response)=>{

              if(response.Success===true){
                try{
                  wsClient.reconnect()
                }catch(e){
                  window.location.reload()
                  console.error(e)
                }
                setJoinedCommunity(!JoinedCommunity)
                queryClient.invalidateQueries({
                  queryKey:["community_channels", `${Invite.community_id}`], 
                  type:'all'
                })
                navigate(`/chats/${Invite.community_id}`)
                accept_invite(Invite)
                .then((response)=>{
                  if(response.Success===true){
                    refetch()
                  }
                })
                .catch((e)=>{
                  console.error(e)
                })
              }

            }).catch((e)=>{
              console.error(e)
            })
          }}
        >
          Accept
        </button>
        <button 
          className="mx-1 text-[#f2f0ec] cursor-pointer p-2 rounded-[0.6rem] bg-[#e5323b]"
          onClick={()=>{
            reject_invite(Invite).then((response)=>{
              if(response.Success===true){
                refetch()
              }
            }).catch((e)=>{
              console.error(e)
            })
          }}
        >
          Reject
        </button>
      </div>
    </div>
  )
}



const Notifications = () => {

  const {data, isLoading, isError, error, refetch, isFetching}=useQuery({
    queryKey: ["Important_Notifications"],
    queryFn: ()=>{ return get_Notifications()},
    enabled: true,
    staleTime: Infinity
  })

  useEffect(()=>{
    if(!data) return
    // console.log(data)
  },[data])

  if (isFetching) {
    return (

      <div className="flex-1 w-full h-full flex flex-col items-center justify-center ">
        <Header/>
        <div className="w-full h-full bg-[#F5F3EF] flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-[#2F5D50]/20 border-t-[#2F5D50] rounded-full animate-spin" />
        </div>
      </div>
    )
  }


  if(!data?.Notifications || !Array.isArray(data?.Notifications) || data?.Notifications?.length===0){
    return(

    <div className="flex-1 w-full h-full flex flex-col items-center justify-center ">

      <Header/>

      <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#F5F3EF]">
        <h1 className="text-[#8A817C] text-sm mt-4 font-medium">No Notifications Yet</h1>
      </div>

    </div>

    )
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center ">

      <Header/>

      <div className="py-0! flex-1 w-full relative overflow-y-auto custom-scrollbar bg-[#F5F3EF]">
        <ScrollBar>
          <div className="w-full flex flex-col items-center justify-center p-5">
            <div className="w-full h-full flex flex-col">
              {
                data.Notifications.map((Notiff, indx)=>{
                  try{
                    const notification=JSON.parse(Notiff)
                    return(
                      <div key={indx}>
                        { notification.type==="ChannelInvite" &&
                          <ChannelInvite
                            Invite={notification}
                            refetch={refetch}
                          />
                        }
                      </div>
                    )
                  }catch(err){
                    console.error(err)
                    return(
                      <></>
                    )
                  }

                })
              }
            </div>
          </div>
        </ScrollBar>
      </div>



      {/* <div className="w-full h-full overflow-y-auto flex flex-col bg-[#F5F3EF]">
        {
          data.Notifications.map((Notiff, indx)=>{
            try{
              const notification=JSON.parse(Notiff)
              return(
                <div key={indx}>
                  { notification.type==="ChannelInvite" &&
                    <ChannelInvite
                      Invite={notification}
                    />
                  }
                </div>
              )
            }catch(err){
              console.error(err)
              return(
                <></>
              )
            }

          })
        }
      </div> */}

    </div>
  )
}

export default Notifications

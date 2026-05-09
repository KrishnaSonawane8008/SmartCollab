import { useContext, useState, useEffect } from 'react'
import { ChatLayout_Context } from '../../../contexts/ChatLayout-context-provider'
import { Global_Context } from '../../../contexts/Global-context-provider'
import { useNavigate, useParams } from 'react-router-dom'
import { EllipsisVertical, Video, Hash, LogOut, UserPlus, Phone, LucideArrowRightLeft, SearchIcon } from 'lucide-react'
import FloatingDiv from '../../common components/FloatingDiv'
import { leave_channel, invite_to_channel } from '../../../services/channel_services'
import CenterFloatingDiv from '../../common components/CenterFloatingDiv'
import { search_users } from '../../../services/user_services'
import { wsClient } from '../../../api/websocket'
import chalk from 'chalk'
import { WebsocketsContext } from '../../../contexts/WebSockets-context-provider'

const SearchUsers=({setShowSearchUsers, url_params})=>{

  const [query, setQuery] = useState("");

  const {CommunityChannelInfo}=useContext(ChatLayout_Context)
  const {UserData} = useContext(Global_Context)
  const {setNotificationsPopup}=useContext(WebsocketsContext)

  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [UserList, setUserList]=useState([])


  const navigate=useNavigate()
  const Empty_Input=()=>{
    setQuery("")
    setUserList([])
  }

  const SendInviteWS=(reciever_id, sender_name, sender_email, community_name, channel_name)=>{


    const data={ 
            'type': 'Channel_Invite',
            'reciever_id': reciever_id, 
            'sender_name': sender_name, 
            'sender_email': sender_email,
            'community_name': community_name,
            'channel_name' : channel_name
          }
    wsClient.send(data)
    console.log("invite Sent: ", data)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [query]);




  const InviteToChannel=(comm_id, channel_id, reciever_id, sender_name, sender_email)=>{
    invite_to_channel(comm_id, channel_id, reciever_id, sender_name, sender_email).then((response)=>{
      if(response.Success===true){
        // navigate(`/chats/${response.NewCommId}`)
        const community_name=CommunityChannelInfo[comm_id]?.community_name
        const channel_name=CommunityChannelInfo[comm_id]?.channels[channel_id]?.channel_name

        if(community_name && channel_name && UserData){
            SendInviteWS(
              reciever_id,
              UserData.username,
              UserData.email,
              community_name,
              channel_name
            )
        }
        setShowSearchUsers(false)
      }else if(response.Success==="Notification Already Sent"){
        setNotificationsPopup(
          prev=>[...prev, {id:Date.now(), timeout_length:2000, 
                            message:{type:"Info", message:"Invitation Already Sent"}
                          }]
        )
        setShowSearchUsers(false)
      }
    }).catch((error)=>{
      console.error(error)
    })
  }


  useEffect(() => {
    if(debouncedQuery.length===0){
      setQuery("")
      setUserList([])
    }
    if (!debouncedQuery) return;
    search_users(url_params.communityId, url_params.channelId, debouncedQuery).then((response)=>{
      setUserList([...response])
    }).catch((e)=>{
      console.error(e)
    })

  }, [debouncedQuery]);


  return(
    <CenterFloatingDiv setOpen={setShowSearchUsers} parent_classes="flex flex-col min-w-[400px]">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--sc-on-surface)] flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-[var(--sc-primary)]" />
          Invite Someone
        </h2>
        <div className="flex flex-col mb-4 bg-[var(--sc-surface-low)] rounded-xl border border-[var(--sc-outline-variant)]">
          <input 
            type="text" 
            placeholder="Search a Username..." 
            className="w-full px-4 py-3 outline-none bg-transparent rounded-xl text-sm"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
        </div>
        
        <div className="max-h-[300px] overflow-y-auto w-full custom-scrollbar flex flex-col gap-2">
          {UserList.length === 0 && debouncedQuery && (
             <div className="text-center text-sm text-[var(--sc-on-surface-variant)] py-4">No Users found.</div>
          )}
          {
            UserList.map((value, index)=>{
              
              return(
                <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--sc-outline-variant)] hover:bg-[var(--sc-surface-low)] transition-colors"
                key={index}
                >
                  <div className='flex flex-col'>
                    <span className="font-semibold text-[var(--sc-on-surface)] text-sm">{value.user_name}</span>
                    <span className="font-semibold text-gray-500 text-[0.7rem] truncate">{value.user_email}</span>
                  </div>
                  {value.status==="not_joined"?
                    (
                      <button className="bg-[var(--sc-primary)] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                        onClick={()=>{
                          InviteToChannel(url_params.communityId, url_params.channelId, value.user_id, value.user_name, value.user_email)
                        }}
                      >
                        Invite
                      </button>
                    ):(
                      <div className="text-[var(--sc-tertiary)] bg-[var(--sc-tertiary)]/10 px-3 py-1.5 text-xs font-bold rounded-lg">
                        Joined
                      </div>
                    )
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    </CenterFloatingDiv>
  )
}



const ChatHeader = ({queryClient}) => {
  const navigate = useNavigate()
  const url_params = useParams()
  const {setLeftChannel, LeftChannelRender, setLeftChannelRender, CommunityChannelInfo, LeftChannel_cb}=useContext(ChatLayout_Context)

  const [ShowSearchUsers, setShowSearchUsers]=useState(false)
  // const [ChannelName, setChannelName]=useState(null)

  const startCall=(communityId, channelId)=>{
    navigate(`/chats/${communityId}/${channelId}/videocall`)
  }

  // useEffect(()=>{
  //   const channel_name=CommunityChannelInfo[url_params.communityId]?.channels[url_params.channelId]?.channel_name
  //   setChannelName(channel_name)
  //   console.log(channel_name)
  // },[CommunityChannelInfo])
  
  const ChannelName=CommunityChannelInfo[url_params.communityId]?.channels[url_params.channelId]?.channel_name

  return (

    <div className="py-8 h-[2.75rem] w-full flex-shrink-0 flex items-center px-8 justify-between border-b border-black/[0.05] bg-transparent">
      {/* Left: channel name & status */}
      <div className="flex flex-col justify-center">
        {ChannelName &&
        <>
          <h2 className="text-gray-900 font-bold text-[17px] leading-tight flex items-center gap-1.5">
            <span className="text-gray-400 font-medium">#</span>
            {ChannelName}
          </h2>
          <div className="flex items-center gap-1.5 text-[10px] text-[#1F7A5A]">
            <span className="w-1 h-1 rounded-full bg-[#22c55e]"></span>
            <span className="font-medium">Online</span>
          </div>
        </>
        }
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        <Video 
          className="w-5 h-5 text-[#1c332b] cursor-pointer hover:opacity-70 transition-opacity" 
          onClick={() => startCall(url_params.communityId, url_params.channelId)} 
        />
        <div className="w-px h-5 bg-gray-200" />
        <FloatingDiv
          ToggleButtonComponent={() => (
            <EllipsisVertical className="w-5 h-5 text-[#1c332b] cursor-pointer hover:opacity-70 transition-opacity" />
          )}
          content_parent_classes=""
          button_parent_styles=""
        >
          {/* Dropdown panel */}
          <div className="bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.5)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-2 min-w-[180px] m-1 right-0 absolute z-50">
            <button
              className="flex w-full outline-none items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-black/[0.05] cursor-pointer select-none text-gray-800 transition-colors close-floating font-medium
              "
              onClick={() =>{
                navigate(`/chats/${url_params.communityId}/${url_params.channelId}/call_logs`)
              }}
            >
              <div className='flex relative'>
                <Phone size={16}/>
                <LucideArrowRightLeft size={13} className=' absolute bottom-2 left-2 rotate-[130deg]'/>
              </div>
              <span>Call Logs</span>
            </button>
            
            <button
              className="flex w-full outline-none items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-black/[0.05] cursor-pointer select-none text-gray-800 transition-colors close-floating font-medium
              "
              onClick={() =>{
                setShowSearchUsers(true)
              }}
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Someone</span>
            </button>

            <button
              className="flex w-full outline-none items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50/80 cursor-pointer select-none transition-colors close-floating font-medium"
              onClick={() =>{
              navigate(`/chats/${url_params.communityId}/`)
              leave_channel(url_params.communityId, url_params.channelId).then((response)=>{
                if(response.Success===true){
                  try{
                    wsClient.reconnect()
                  }catch(e){
                    window.location.reload()
                    console.error(e)
                  }
                  LeftChannel_cb(url_params.communityId, url_params.channelId)
                  setLeftChannel({communityId:url_params.communityId, channelId:url_params.channelId})
                  setLeftChannelRender(!LeftChannelRender)
                }
              }).catch((e)=>{
                console.error(e)
              })
            }}
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Leave Channel</span>
            </button>
          </div>
        </FloatingDiv>
      </div>

      {
        ShowSearchUsers===true &&
        <SearchUsers
          setShowSearchUsers={setShowSearchUsers}
          url_params={url_params}
        />
      }
      

    </div>


  )
}

export default ChatHeader
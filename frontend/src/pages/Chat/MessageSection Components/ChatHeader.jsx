import { useContext } from 'react'
import { ChatLayout_Context } from '../../../contexts/ChatLayout-context-provider'
import { useNavigate, useParams } from 'react-router-dom'
import { EllipsisVertical, Video, Hash, LogOut, Phone, History, Clock, LucideArrowRightLeft } from 'lucide-react'
import FloatingDiv from '../../common components/FloatingDiv'
import { leave_channel } from '../../../services/channel_services'

const ChatHeader = ({queryClient}) => {
  const navigate = useNavigate()
  const url_params = useParams()
  const {setLeftChannel, LeftChannelRender, setLeftChannelRender, CurrentChannel}=useContext(ChatLayout_Context)

  const startCall=(communityId, channelId)=>{
    navigate(`/chats/${communityId}/${channelId}/videocall`)
  }

  return (

    <div className="py-8 h-[2.75rem] w-full flex-shrink-0 flex items-center px-8 justify-between border-b border-black/[0.05] bg-transparent">
      {/* Left: channel name & status */}
      <div className="flex flex-col justify-center">
        {CurrentChannel?.ChannelName &&
        <>
          <h2 className="text-gray-900 font-bold text-[17px] leading-tight flex items-center gap-1.5">
            <span className="text-gray-400 font-medium">#</span>
            {CurrentChannel?.ChannelName}
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
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50/80 cursor-pointer select-none transition-colors close-floating font-medium"
              onClick={() =>{
              navigate(`/chats/${url_params.communityId}/`)
              leave_channel(url_params.communityId, url_params.channelId).then((response)=>{
                if(response.Success===true){
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
    </div>


  )
}

export default ChatHeader
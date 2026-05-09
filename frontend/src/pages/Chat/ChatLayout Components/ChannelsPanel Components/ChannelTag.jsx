import { useParams, useNavigate } from 'react-router-dom'
import { Hash } from 'lucide-react'
import { ChatLayout_Context } from '../../../../contexts/ChatLayout-context-provider'
import { useContext, useEffect } from 'react'

const ChannelTag = ({ channel_name, community_id, channel_id }) => {
  const url_params = useParams()
  const navigate = useNavigate()
  const {setCurrentChannel, OngoingCalls}=useContext(ChatLayout_Context)

  const isActive = url_params.channelId == channel_id
  const OngoingCall= OngoingCalls?.[community_id]?.[channel_id]
  // console.log("Ongoing Calls: ", OngoingCall)

  useEffect(()=>{
    if(isActive){
      setCurrentChannel(channel_id)
    }
  },[isActive])

  return (
    <div
      className={`
        flex items-center justify-between h-10 mx-2 my-1.5 px-3 rounded-[12px]
        cursor-pointer select-none transition-colors duration-200 text-[13px] font-medium
        ${isActive
          ? 'bg-[#F2E8D7] text-[#1c332b]'
          : 'bg-transparent text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'
        }
      `}
      onClick={() =>{ 
          navigate(`/chats/${url_params.communityId}/${channel_id}`)
        }
      }
    >
      <div className="flex items-center gap-2">
        <div className='relative'>
          {
            OngoingCall &&
            <div className={`absolute size-[9px] -top-[30%] -right-[35%] rounded-full bg-blue-400`}>

            </div>
          }
          <Hash className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#1c332b]' : 'text-gray-400'}`} strokeWidth={2} />
        </div>
        <span className="truncate min-w-0">{channel_name}</span>
      </div>
      {isActive && (
        <div className="w-2.5 h-2.5 rounded-full bg-[#1c332b] flex-shrink-0" />
      )}
    </div>
  )
}

export default ChannelTag
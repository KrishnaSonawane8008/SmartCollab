import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChatLayout_Context } from "../../../../contexts/ChatLayout-context-provider"

const CommunityTab = ({ communityId, communityName }) => {
  const { CommunityChannelMap, setCurrentCommunity,  OngoingCalls} = useContext(ChatLayout_Context)

  // const [OngoingCall, setOngoingCall]=useState(null)
  //   IncomingCall, setIncomingCall
  // OngoingCalls, setOngoingCalls
  const navigate = useNavigate()
  const url_params = useParams()


  const isActive = url_params.communityId == communityId

  const OngoingCall= OngoingCalls?.[communityId]

  // console.log("Ongoing Call: ",communityId, OngoingCall)

  useEffect(()=>{
    if(isActive){
      setCurrentCommunity(communityId)
    }
  },[isActive])




  return (
    <div
      title={communityName}
      className={`w-10 h-10 relative min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center cursor-pointer hover:opacity-80 my-1.5 transition-opacity ${isActive ? 'bg-[#E8E4DE]' : 'bg-[#2F5D50]'}`}
      onClick={() => {
        if (url_params.communityId == communityId) return
        const channel_id = CommunityChannelMap[communityId]
        navigate(`/chats/${communityId}/${channel_id ? channel_id : ''}`)
      }}
    >
      {
        OngoingCall &&
        <div className={`absolute size-[13px] -top-[5%] -right-[5%] rounded-full bg-blue-400`}>
          
        </div>
      }
      <span className={`text-base font-bold uppercase select-none ${isActive ? 'text-gray-600' : 'text-white'}`}>
        {communityName ? communityName[0].toUpperCase() : 'C'}
      </span>
    </div>
  )
}

export default CommunityTab

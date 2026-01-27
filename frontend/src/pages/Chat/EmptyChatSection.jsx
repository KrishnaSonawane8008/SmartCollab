import { get_community_channels } from "../../services/community_services"

const CommunityChannels_Loader= ({params})=>{
  const community_channels= get_community_channels(params.communityId)
  return {community_channels}
}

const EmptyChatSection = () => {
  return (
    <div className='bg-amber-500 w-full h-full flex flex-col'>
      {/* Header */}
      <div className='bg-red-500 w-full'>
        Empty Chat Section Header
      </div>
      {/* Messages */}
      <div className='bg-red-300 h-full w-full'>
        Empty Message Section
      </div>
    </div>
  )
}

export { EmptyChatSection, CommunityChannels_Loader}

import { useParams } from "react-router-dom"
import ChannelTag from "./ChannelsPanel Components/ChannelTag"
import { useQuery } from "@tanstack/react-query"
import { get_community_channels } from "../../../services/community_services"
import ScrollBar from "../../common components/ScrollBar"
import { useRef } from "react"


const ChannelsPanel = () => {
  const {communityId} = useParams()
  const scrollbarRef=useRef(null)

  const {data, isLoading, isError, error}=useQuery({
    queryKey:["community_channels", communityId],
    queryFn: ()=>{return get_community_channels(communityId)},
    enabled:!!communityId,
    retry: false,
    staleTime:1000*60*5
  })



  if(isError){
    if(error.status==403){
      throw error
    }
    console.log(error.status)
  }


  if(isLoading && communityId){
    return(
      <div className="w-full h-full font-[Inter] text-white bg-[#363535]">
        ...Loading Channels
      </div>
    )
  }

  return (
      <div className='bg-[#363535] w-full h-full flex overflow-y-hidden'>
        <ScrollBar ref={scrollbarRef}>
          { 
          data && Array.isArray(data.Channels) && (
              data.Channels.map( (channel, index)=>{
                return(
                  <ChannelTag
                    key={index}
                    channel_name={channel.channel_name}
                    channel_id={channel.channel_id}
                  />
                )
              } )
            )
          }

          {/* {
            Array.from({length:20}, (v,i)=>{return i}).map( (elem, index)=>{
              return(
                  <ChannelTag
                    key={index}
                    channel_name={"some name"}
                    channel_id={"some id"}
                  />
                )
            } )
          } */}
          
      </ScrollBar>
      </div>
  
  )
}

export default ChannelsPanel

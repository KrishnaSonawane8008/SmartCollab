import { useEffect } from "react"
import ChannelTag from "./ChannelsPanel Components/ChannelTag"

const ChannelsPanel = ({channels}) => {


  return (
      <div className='bg-[#363535] w-full h-full'>
        <div 
          className="w-full h-full flex flex-col mt-1"
        >
          { 
          Array.isArray(channels) && (
              channels.map( (channel, index)=>{
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
          
        </div>
      </div>
  
  )
}

export default ChannelsPanel

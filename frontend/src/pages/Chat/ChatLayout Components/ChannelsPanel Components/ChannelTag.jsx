import { useParams, useNavigate } from 'react-router-dom'

const ChannelTag = ({channel_name, channel_id, isSelected}) => {


    const url_params=useParams()

    const navigate=useNavigate()

    return (
        <div 
            title={channel_name}
            className={`
                w-full min-w-0
                font-[Inter] text-[1rem] text-white truncate overflow-x-hidden 
                mt-[0.2rem] pl-[0.7rem] py-[0.2rem]
                select-none cursor-pointer transition-colors duration-100
                ${url_params.channelId==channel_id?" bg-[#6d6c6c]":"hover:bg-[#545454] "}
                `}
            onClick={()=>{
                navigate(`/chats/${url_params.communityId}/${channel_id}`)
            }
            }
        >
        #{channel_name}
        </div>
    )
}

export default ChannelTag

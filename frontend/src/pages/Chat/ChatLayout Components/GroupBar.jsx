import { useContext } from "react"
import UserProfile from "./GroupBar Components/UserProfile"
import CommunityTab from "./GroupBar Components/CommunityTab"
import ScrollBar from "../../common components/ScrollBar"
import { ChatLayout_Context } from "../../../contexts/ChatLayout-context-provider"

const GroupBar = ({username,email,communities}) => {
  // console.log("type of communities: ",communities)

  return (
    <div className='bg-[#454545] w-full max-w-[3rem] h-full flex flex-col'>

      {/* <div
        className="bg-red-500 p-[0.25rem] w-full h-full overflow-auto "
      > */}
      <ScrollBar
      >
        {
          communities.map( (community, index)=>{
              return(
                  <div 
                    key={index}
                    className=""
                  >
                    <CommunityTab 
                      communityId={community.community_id}
                      communityName={community.community_name}
                    />
                  </div>
                )

          } )
      }
      
      </ScrollBar>
      

      <div 
        title={`${username}\n${email}`}
        className='mt-auto p-[0.25rem] select-none cursor-pointer w-full bg-amber-600'
      >
        <UserProfile 
          username={username} email={email}
        />
      </div>

    </div>
  )
}

export default GroupBar

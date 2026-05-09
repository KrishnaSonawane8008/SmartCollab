import { useRef, useContext, useEffect, useState } from "react"
import UserProfile from "./GroupBar Components/UserProfile"
import CommunityTab from "./GroupBar Components/CommunityTab"
import ScrollBar from "../../common components/ScrollBar"
import { Sun, Moon, Plus, PlusIcon, SearchIcon, Bell } from "lucide-react"
import { Global_Context } from "../../../contexts/Global-context-provider"
import { ChatLayout_Context } from "../../../contexts/ChatLayout-context-provider"
import FloatingDiv from "../../common components/FloatingDiv"
import CenterFloatingDiv from "../../common components/CenterFloatingDiv"
import { create_community } from "../../../services/community_services"
import { useNavigate, useLocation } from "react-router-dom"
import {get_communities} from "../../../services/user_services"
import { search_communities, join_community } from "../../../services/community_services"
import { wsClient } from "../../../api/websocket"

const SearchCommunities=({already_joined_communities, JoinedCommunity, setJoinedCommunity, setShowSearchCommunity})=>{
  
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [communityList, setCommunityList]=useState([])
  const navigate=useNavigate()
  const Empty_Input=()=>{
    setQuery("")
    setCommunityList([])
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if(debouncedQuery.length===0){
      setQuery("")
      setCommunityList([])
    }
    if (!debouncedQuery) return;
    search_communities(debouncedQuery).then((response)=>{
      setCommunityList([...response])
    }).catch((e)=>{
      console.error(e)
    })
  }, [debouncedQuery]);

  return (

    <CenterFloatingDiv setOpen={setShowSearchCommunity} parent_classes="flex flex-col min-w-[400px]">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--sc-on-surface)] flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-[var(--sc-primary)]" />
          Search Communities
        </h2>
        <div className="flex flex-col mb-4 bg-[var(--sc-surface-low)] rounded-xl border border-[var(--sc-outline-variant)]">
          <input 
            type="text" 
            placeholder="Type community name..." 
            className="w-full px-4 py-3 outline-none bg-transparent rounded-xl text-sm"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
        </div>
        
        <div className="max-h-[300px] overflow-y-auto w-full custom-scrollbar flex flex-col gap-2">
          {communityList.length === 0 && debouncedQuery && (
             <div className="text-center text-sm text-[var(--sc-on-surface-variant)] py-4">No communities found.</div>
          )}
          {
            communityList.map((value, index)=>{
              let joined_community=false
              for(const joined_comm of already_joined_communities){
                if(joined_comm.community_id===value.community_id){
                  joined_community=true
                  break
                }
              }
              return(
                <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--sc-outline-variant)] hover:bg-[var(--sc-surface-low)] transition-colors"
                key={index}
                >
                  <span className="font-semibold text-[var(--sc-on-surface)] text-sm">{value.community_name}</span>
                  {!joined_community?
                    (
                      <button className="bg-[var(--sc-primary)] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                        onClick={()=>{
                          join_community(value.community_id).then((response)=>{
                            if(response.Success===true){
                              try{
                                wsClient.reconnect()
                              }catch(e){
                                window.location.reload()
                                console.error(e)
                              }
                              navigate(`/chats/${response.NewCommId}`)
                              setJoinedCommunity(!JoinedCommunity)
                            }
                          }).catch((error)=>{
                            console.error(error)
                          })
                        }}
                      >
                        Join
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


const CreateCommunity=({AddedCommunity, setAddedCommunity, setShowCreateCommunity})=>{

  const InputRef=useRef("")
  const [InputString, setInputString]=useState('')
  const TextUpdate=(e)=>{
    // console.log(InputRef.current.value.length)
    setInputString(e.target.value)
  }

  const navigate=useNavigate()
  // console.log("hi")
  return (
      <CenterFloatingDiv setOpen={setShowCreateCommunity} parent_classes="flex flex-col min-w-[350px]">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6 text-[var(--sc-on-surface)] flex items-center gap-2">
          <Plus className="w-5 h-5 text-[var(--sc-primary)]" />
          Create Community
        </h2>
        <div className="mb-6">
          <label className="block text-xs font-semibold text-[var(--sc-on-surface-variant)] uppercase tracking-wider mb-2">Community Name</label>
          <input 
            type="text" 
            placeholder="e.g. Acme Design Team" 
            className="w-full px-4 py-3 outline-none bg-[var(--sc-surface-low)] rounded-xl border border-[var(--sc-outline-variant)] focus:border-[var(--sc-primary)] transition-colors text-sm"
            value={InputString}
            onChange={(e)=>{TextUpdate(e)}}
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button 
            className="px-5 py-2 text-sm font-semibold text-[var(--sc-on-surface-variant)] hover:bg-[var(--sc-surface-low)] rounded-xl transition-colors"
            onClick={() => setShowCreateCommunity(false)}
          >
            Cancel
          </button>
          <button
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${InputString.length>0 ? 'bg-[var(--sc-primary)] text-white hover:opacity-90' : 'bg-[var(--sc-surface-variant)] text-[var(--sc-on-surface-variant)] cursor-not-allowed opacity-60'}`}
            disabled={InputString.length === 0}
            onClick={()=>{
              setInputString('')
              create_community(InputString).then((response)=>{
                if(response.Success==true){
                  try{
                    wsClient.reconnect()
                  }catch(e){
                    window.location.reload()
                    console.error(e)
                  }
                  navigate(`/chats/${response.NewCommId}`)
                  setAddedCommunity(!AddedCommunity)
                  setShowCreateCommunity(false)
                  console.log("Community Created")
                }
              }).catch((error)=>{
                console.error(error)
              })
            }}
          >
            Create
          </button>
        </div>
      </div>
    </CenterFloatingDiv>


  )
}


const NotificationsTab=()=>{

  const location=useLocation()
  const navigate=useNavigate()
  const isActive = location.pathname==="/chats/notifications"

  return(
    <div className={`w-[44px] h-[44px] my-1 flex-shrink-0 rounded-[16px] flex items-center justify-center backdrop-blur-[8px] shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] hover:scale-[1.08] transition-all duration-250 cursor-pointer group ${isActive ? 'bg-[#E8E4DE]' : 'bg-[#2F5D50]'} `}                     
      
      title="Notifications"
      onClick={()=>{
        navigate(`/chats/notifications`)
      }}
      >

        <Bell className={`w-[20px] h-[20px] flex-shrink-0 
        ${isActive? 
          "text-gray-600":
          "text-[#DDE6E0] group-hover:text-white"}
        transition-colors`} strokeWidth={2} />

      </div>
  )
}


const GroupBar = ({ username, email, channelOpen, setChannelOpen }) => {
  const scrollbarRef = useRef(null)
  const [communities, setUserCommunities]=useState(null)
  const [AddedCommunity, setAddedCommunity]=useState(false)

  const { theme, toggleTheme } = useContext(Global_Context)
  const {LeftCommunityRender, setCommunityChannelInfo, JoinedCommunity, setJoinedCommunity}=useContext(ChatLayout_Context)

  const [ShowCreateCommunity, setShowCreateCommunity]=useState(false)
  const [ShowSearchCommunity, setShowSearchCommunity]=useState(false)


  useEffect(()=>{
    get_communities().then(
            (comms)=>{
                // console.log("fetched communities: ",comms.UserCommunities)
                setUserCommunities(comms.UserCommunities)
                const community_entries={}
                for(const comm of comms.UserCommunities){
                  community_entries[comm.community_id]={ 
                                        community_name:comm.community_name,
                                        channels:{}
                                      }
                }

                setCommunityChannelInfo({...community_entries})
            }
        ).catch((e)=>{
            console.log("Error getting communities: ")
            console.error(e)
        })
    
    // console.log("First Mount")
  },[AddedCommunity, LeftCommunityRender, JoinedCommunity])

  return (
  
    <div className="w-full flex flex-col items-center h-full overflow-hidden">

      <div className="w-[44px] h-[44px] flex-shrink-0 rounded-[14px] flex items-center justify-center bg-transparent hover:bg-[rgba(255,255,255,0.08)] hover:scale-105 active:bg-[#E6D3B3] active:shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-250 cursor-pointer group" title="Search Communities" >
        <svg className="w-[20px] h-[20px] fill-[#DDE6E0] group-hover:fill-white group-active:fill-[#1F4D3A] transition-colors" viewBox="0 0 24 24">
          <circle cx="12" cy="6" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="12" r="3" />
          <circle cx="12" cy="18" r="3" />
        </svg>
      </div>

      <FloatingDiv
        ToggleButtonComponent={() => (
          <div className="w-[44px] h-[44px] my-1 flex-shrink-0 rounded-[16px] flex items-center justify-center bg-[rgba(255,255,255,0.08)] backdrop-blur-[8px] shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] hover:scale-[1.08] transition-all duration-250 cursor-pointer group" title="Add Community">
            <Plus className="w-[20px] h-[20px] flex-shrink-0 text-[#DDE6E0] group-hover:text-white transition-colors" strokeWidth={2} />
          </div>
        )}
        content_parent_classes=""
        button_parent_styles_tailwind=""
      >
        <div className="mx-3 my-1 flex flex-col bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.5)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] min-w-[200px] overflow-hidden">
          <button 
            className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(0,0,0,0.04)] transition-colors text-[13px] font-semibold text-gray-800 close-floating text-left"
            onClick={() => setShowCreateCommunity(true)}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--sc-primary)]/10 flex items-center justify-center text-[var(--sc-primary)]">
              <Plus className="w-4 h-4" />
            </div>
            Create Community
          </button>
          
          <button 
            className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(0,0,0,0.04)] transition-colors border-t border-[rgba(0,0,0,0.05)] text-[13px] font-semibold text-gray-800 close-floating text-left"
            onClick={() => setShowSearchCommunity(true)}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--sc-tertiary)]/10 flex items-center justify-center text-[var(--sc-tertiary)]">
              <SearchIcon className="w-4 h-4" />
            </div>
            Search Communities
          </button>
        </div>
      </FloatingDiv>
      
      {/* Notifications Icon */}
      <NotificationsTab/>

      {/* Sidebar Channel Toggle Button */}
      <button 
        onClick={() => setChannelOpen(prev => !prev)}
        className="w-[44px] h-[44px] flex-shrink-0 my-1 rounded-[14px] flex items-center justify-center bg-[rgba(255,255,255,0.08)] backdrop-blur-[8px] shadow-[0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] hover:scale-[1.08] transition-all duration-250 cursor-pointer group"
        title="Toggle Channels"
      >
        <div className="text-[#DDE6E0] group-hover:text-white transition-colors">
          {channelOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>
          )}
        </div>
      </button>

      {/* Divider */}
      <div className="w-6 h-px bg-white/20 my-2 flex-shrink-0" />

      {/* Community list */}
      <div className="flex-1 w-full min-h-0 overflow-hidden">
        <ScrollBar ref={scrollbarRef}>
          <div className="flex flex-col items-center w-full">
            { communities && 
              communities.map((community, index) => (
              <CommunityTab
                key={index}
                communityId={community.community_id}
                communityName={community.community_name}
              />
          ))}
          </div>
        </ScrollBar>
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-white/20 mt-2 mb-2 flex-shrink-0" />

      {/* User profile */}
      <div className="flex-shrink-0 mt-auto">
        <UserProfile username={username} email={email} />
      </div>

      {/* Modals */}
      {ShowCreateCommunity && (
          <CreateCommunity
            AddedCommunity={AddedCommunity}
            setAddedCommunity={setAddedCommunity}
            setShowCreateCommunity={setShowCreateCommunity}
          />
      )}
      
      {ShowSearchCommunity && (
          <SearchCommunities
            already_joined_communities={communities}
            JoinedCommunity={JoinedCommunity}
            setJoinedCommunity={setJoinedCommunity}
            setShowSearchCommunity={setShowSearchCommunity}
          />
      )}
    </div>

  )
}

export default GroupBar
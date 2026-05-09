import {useState, createContext, useEffect, useContext} from 'react'
import { useParams } from 'react-router-dom'
import { Global_Context } from './Global-context-provider'

export const ChatLayout_Context=createContext(null)

export const ChatLayout_Context_Provider = ({children}) => {
    
    const [CommunityChannelMap, setCommunityChannelMap]=useState({})
    const [user_id, setUserid]=useState(null)
    const [user_name, setUserName]=useState(null)

    const [LeftChannel, setLeftChannel] = useState(null)
    
    const [LeftCommunityRender, setLeftCommunityRender]=useState(false)
    const [LeftChannelRender, setLeftChannelRender] = useState(false)
    const [JoinedCommunity, setJoinedCommunity]=useState(false)


    const [LocalStreams, setLocalStreams]=useState(new Map())
    const [RemoteVideoStreams, setRemoteVideoStreams]=useState([])
    const [RemoteAudioStreams, setRemoteAudioStreams]=useState([])
    const [ScreenShareToggle, setScreenShareToggle]=useState(false)


    const [IncomingCall, setIncomingCall]=useState(new Map())
    const [OngoingCalls, setOngoingCalls]=useState(new Map())
    const [JoinedCall, setJoinedCall]=useState(null)


    const [CurrentCommunity, setCurrentCommunity]=useState(null)
    const [CurrentChannel, setCurrentChannel]=useState(null)
    const [CommunityChannelInfo, setCommunityChannelInfo]=useState([])
    // { 
    //     commid:{
    //         community_name:"com_name", 
    //         channels:{ channel_id:{channel_name:"ch_name1"}, channel_id2:{channel_name:"ch_name2"},...  } 
    //     }, 
    //     commid2:{
    //         community_name:"com_name2", 
    //         channels:{ channel_id:{channel_name:"ch_name1"}, channel_id2:{channel_name:"ch_name2"},...  } 
    //     }, 
    //     .
    //     .
    //     .
    // }

    const {communityId, channelId}=useParams()

    const {LoggedOut}=useContext(Global_Context)
    
    useEffect(()=>{ 

        if(!channelId || !communityId) return
        setCommunityChannelMap( (prev)=>{
            return {...prev, [communityId]:channelId }
        } )

    }, [communityId, channelId])


    const LeftCommunity_cb=(community_id)=>{
        setCommunityChannelInfo( (prev)=>{
            const {[community_id]:_, ...rest }=prev
            return rest
        })

        setCommunityChannelMap( (prev)=>{
            const {[community_id]:_, ...rest }=prev
            return rest
        } )
    }

    const LeftChannel_cb=(community_id, channel_id)=>{
        setCommunityChannelMap( (prev)=>{
            const {[community_id]:_, ...rest}=prev
            return rest
        } )
    }


    

    useEffect(()=>{
        if(LoggedOut===true){
            setCommunityChannelMap({})
        }
    },[LoggedOut])

    
    return (
        <ChatLayout_Context.Provider value={{
                                        CurrentCommunity, setCurrentCommunity,
                                        CurrentChannel, setCurrentChannel,
                                        CommunityChannelMap, setCommunityChannelMap,
                                        user_id, setUserid,
                                        user_name, setUserName,
                                        LeftCommunityRender, setLeftCommunityRender,
                                        LeftChannelRender, setLeftChannelRender,
                                        CommunityChannelInfo, setCommunityChannelInfo,
                                        LeftCommunity_cb, LeftChannel_cb,
                                        LeftChannel, setLeftChannel,
                                        JoinedCommunity, setJoinedCommunity,
                                        
                                        LocalStreams, setLocalStreams,
                                        RemoteVideoStreams, setRemoteVideoStreams,
                                        RemoteAudioStreams, setRemoteAudioStreams,
                                        ScreenShareToggle, setScreenShareToggle,

                                        IncomingCall, setIncomingCall,
                                        OngoingCalls, setOngoingCalls,
                                        JoinedCall, setJoinedCall
                                        }}>
            {children}
        </ChatLayout_Context.Provider>
    )
}
import {useState, createContext, useEffect} from 'react'
import { useParams } from 'react-router-dom'

export const ChatLayout_Context=createContext(null)

export const ChatLayout_Context_Provider = ({children}) => {
    const [CurrentCommunity, setCurrentCommunity]=useState(null)
    const [CurrentChannel, setCurrentChannel]=useState(null)
    const [CommunityChannelMap, setCommunityChannelMap]=useState({})

    const {communityId, channelId}=useParams()

    useEffect( ()=>{
        if(!communityId || !channelId) return;

        setCommunityChannelMap( (prev)=>{
            return {...prev, [communityId]:channelId }
        } )
    }, [] )

    useEffect( ()=>{
        if(!communityId) return

        setCommunityChannelMap( (prev)=>{
            return {...prev, [communityId]:channelId }
        } )

    }, [channelId] )

    return (
        <ChatLayout_Context.Provider value={{
                                        CurrentCommunity, 
                                        setCurrentCommunity,
                                        CurrentChannel, 
                                        setCurrentChannel,
                                        CommunityChannelMap
                                        }}>
            {children}
        </ChatLayout_Context.Provider>
    )
}


import { useState } from "react";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom"
import EmptyChatSection from "./EmptyChatSection";

import GroupBar from "./ChatLayout Components/GroupBar";
import OptionsBar from "./ChatLayout Components/OptionsBar";
import SearchBar from "./ChatLayout Components/SearchBar";
import ConversationTabs from "./ChatLayout Components/ConversationTabs";


const ChatLayout = () => {

    const url_params=useParams();
    const [ConvId, setConvId]=useState(null)
    useEffect(()=>{
        console.log(url_params.conversationId)
        setConvId(url_params.conversationId)
    }, [url_params])

  return (
    <div className="h-screen w-full bg-green-500 flex flex-row">
        <div className="h-full max-w-[300px] w-full bg-blue-400">

            <div className="w-ful h-full flex flex-row">
                <GroupBar/>
                
                <div className="flex flex-col w-full h-full">
                    <OptionsBar/>
                    <SearchBar/>
                    <ConversationTabs/>
                </div>

            </div>

        </div>

        { ConvId ? 
            (
                <div className="w-full h-full">
                    <Outlet />
                </div>
            ):(
                <div className="w-full h-full">
                    < EmptyChatSection />
                </div>
            ) 
        }
        
      
    </div>
  )
}

export default ChatLayout

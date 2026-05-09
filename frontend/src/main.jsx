import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import {ChatLayout} from './pages/Chat/ChatLayout'
import ChatMessagesSection from './pages/Chat/ChatMessagesSection'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChatLayout_Context_Provider } from './contexts/ChatLayout-context-provider'
import ErrorFallback from './pages/ErrorFallback'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { WebSockets_ContextProvider } from './contexts/WebSockets-context-provider'
import { Global_ContextProvider } from './contexts/Global-context-provider'
import VideoCallSection from './pages/Chat/VideoCallSection'
import CallLogs from './pages/Chat/CallLogs'
import { EmptyChatSection } from './pages/Chat/EmptyChatSection'
import Notifications from './pages/Chat/Notifications'
import ChatNotificationPopup from './pages/Chat/ChatNotificationPopup'
import FloatingVideoCallWindow from './pages/Chat/FloatingVideoCallWindow'

const query_client=new QueryClient()


const router = createBrowserRouter([
  {
    path: '/',
    element: 
      <Home />
    ,
    errorElement:<ErrorFallback/>
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path:"/chats",
    element:
    <QueryClientProvider client={query_client}>
        <ChatLayout_Context_Provider>
          <WebSockets_ContextProvider>
            <ChatLayout />
            <ChatNotificationPopup />
            <FloatingVideoCallWindow/>
          </WebSockets_ContextProvider>
        </ChatLayout_Context_Provider>
    </QueryClientProvider>
    ,
    errorElement:<ErrorFallback/>,
    children: [
      {
        path: "notifications",
        element: 
        
          <Notifications />

      },
      {
        path: ":communityId",
        element: 
        
          <EmptyChatSection />

      },
      {
        path: ":communityId/:channelId",
        element: 
        
          <ChatMessagesSection />

      },
      {
        path:":communityId/:channelId/videocall",
        element: <VideoCallSection/>
      },
      {
        path:":communityId/:channelId/call_logs",
        element: <CallLogs/>
      },
    ]
    ,

  }
])

createRoot(document.getElementById('root')).render(
    <Global_ContextProvider>
        <RouterProvider router={router} />
    </Global_ContextProvider>
  
)

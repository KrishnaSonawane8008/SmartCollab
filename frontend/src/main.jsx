import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home'
import Login from './pages/Login'
import {ChatLayout, ChatLayout_Loader} from './pages/Chat/ChatLayout'
import { EmptyChatSection, CommunityChannels_Loader} from './pages/Chat/EmptyChatSection'
import ChatMessagesSection from './pages/Chat/ChatMessagesSection'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChatLayout_Context_Provider } from './contexts/ChatLayout-context-provider'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path:"/chats",
    element:
      <ChatLayout_Context_Provider>
        <ChatLayout />
      </ChatLayout_Context_Provider>
    ,
    loader: ChatLayout_Loader,
    children: [
      {
        path: ":communityId",
        id:"communityChannels",
        element: <EmptyChatSection />,
        loader:CommunityChannels_Loader,
      },
      {
        path: ":communityId/:channelId",
        element: <ChatMessagesSection />,
      },
    ]

  }
])

createRoot(document.getElementById('root')).render(

    <RouterProvider router={router} />
  
)

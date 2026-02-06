
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/Home'
import Login from './pages/Login'
import {ChatLayout} from './pages/Chat/ChatLayout'
import ChatMessagesSection from './pages/Chat/ChatMessagesSection'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChatLayout_Context_Provider } from './contexts/ChatLayout-context-provider'
import ErrorFallback from './pages/ErrorFallback'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { WebSockets_ContextProvider } from './contexts/WebSockets-context-provider'


const query_client=new QueryClient()


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
    path:"/chats/:communityId?",
    element:
    <QueryClientProvider client={query_client}>
        <ChatLayout_Context_Provider>
          <ChatLayout />
        </ChatLayout_Context_Provider>
    </QueryClientProvider>

    ,
    errorElement:<ErrorFallback/>,
    children: [
      {
        path: ":channelId",
        element: 
        <WebSockets_ContextProvider>
          <ChatMessagesSection />
        </WebSockets_ContextProvider>
        ,
      },
    ]
    ,

  }
])

createRoot(document.getElementById('root')).render(

    <RouterProvider router={router} />
  
)

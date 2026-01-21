import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './pages/Home'
import Login from './pages/Login'
import ChatLayout from './pages/Chat/ChatLayout'
import ChatMessagesSection from './pages/Chat/ChatMessagesSection'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'


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
    element:<ChatLayout />,
    children: [
      {
        path: ":communityId/:channelId",
        element: <ChatMessagesSection />
      },
    ]

  }
])

createRoot(document.getElementById('root')).render(

    <RouterProvider router={router} />
  
)

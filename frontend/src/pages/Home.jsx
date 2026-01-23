import { useNavigate } from "react-router-dom"
import { useUserInfo } from "../hooks/user_hooks"
import { useEffect } from "react"

const Home = () => {

  const navigate=useNavigate()
  const {getUserProfile}=useUserInfo()

  useEffect(()=>{
    getUserProfile().then((user_profile)=>{
            navigate("/chats")
        }).catch((e)=>{
            console.log("Error getting user profile: ")
            console.error(e)
        })
  }, [])


  return (
    <div className='h-full w-full flex flex-col bg-green-400 items-center relative'>
      {/* Header */}
      <div className='w-full top-0 sticky py-[0.5rem] px-[0.5rem]'>
        <div className='w-full bg-red-400 flex flex-row justify-between px-2 py-2.5 h-[3.25rem] rounded-[1.3rem]'>
          {/* Logo */}
          <div className='bg-[#0ea6fe] flex  flex-col p-1 ml-[0.7rem] h-fit rounded-tr-2xl rounded-bl-2xl'>
            <div className='font-extrabold text-[0.8rem] w-fit leading-[0.8rem] font-[Inter]'>Smart</div>
            <div className='font-extrabold text-[0.8rem] w-fit leading-[0.8rem] font-[Inter] pl-[0.5rem]'>Collab</div>
          </div>

          {/* Other Options*/}
          <div className='flex flex-row justify-end  w-full max-w-1/2'>
            <button className='bg-black mr-1 text-white text-[0.8rem] w-fit leading-[0.8rem] py-1.5 px-5 rounded-full'
            onClick={()=>{navigate("/login")}}
            >
              Login
            </button>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className='bg-green-400 w-full h-full'>
        <div className='bg-purple-400 h-screen flex flex-row'>
          <div className='bg-yellow-400 w-full h-full'>
            <h1>Title & Description</h1>
          </div>
          <div className='bg-cyan-400 w-full h-full'>
            <h1>Background</h1>
          </div>
          
        </div>
        <div>
          Other Content
        </div>
      </div>

    </div>
  )
}

export default Home

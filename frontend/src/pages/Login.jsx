import { useNavigate } from "react-router-dom"

const Login = () => {

  const navigate=useNavigate()

  return (
    <div className='h-screen w-full bg-gray-700 flex flex-row justify-center items-center'>
      <div className='bg-red-400 rounded-[10px] flex flex-col justify-center items-center p-6 h-[500px] w-full m-5 max-w-[500px]'>
        <input 
        className='bg-white rounded-[10px] p-3 my-2 w-full text-[0.9rem] leading-[0.9rem]'
        type="text" placeholder='Enter Email'/>

        <input 
        className='bg-white rounded-[10px] p-3 my-2 w-full text-[0.9rem] leading-[0.9rem]'
        type="text" placeholder='Enter Password'/>

        <button className='bg-black my-3  w-fit  py-0.5 px-5 rounded-full'
            onClick={()=>{navigate("/chats")}}
            >
              <div className='text-white text-[0.9rem] leading-[1.5rem] mb-0.5'>
                Login
              </div>
        </button>

      </div>
    </div>
  )
}

export default Login

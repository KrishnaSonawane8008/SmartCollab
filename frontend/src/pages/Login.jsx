import { useNavigate } from "react-router-dom"
import { useUserOperations, useAuth } from "../hooks/user_hooks"
import { useRef, useState } from "react";

const Login = () => {
  // const {}=useUserOperations();
  const navigate=useNavigate()
  const { Login, Login_test }=useAuth()
  
  
  const handleLogin=(formData)=>{
    const username=formData.get("username")
    const email=formData.get("email")
    const password=formData.get("password")
    console.log(`
        Username: ${username}
        Email: ${email}
        Password: ${password}
      `)  
    Login({
      username: username, 
      email: email, 
      password: password
    })
    // Login_test()
    // navigate("/chats"); 
  }


  return (
    <div className='h-screen w-full bg-gray-700 flex flex-row justify-center items-center'>

        <form action={handleLogin}
          className='bg-red-400 rounded-[10px] flex flex-col justify-center items-center p-6 max-h-[500px] h-full w-full m-5 max-w-[500px]'
        >

          <input name="username"
          className='bg-white rounded-[10px] p-3 my-2 w-full text-[0.9rem] leading-[0.9rem]'
          type="text" placeholder='Enter Username'/>
          
          <input name="email"
          className='bg-white rounded-[10px] p-3 my-2 w-full text-[0.9rem] leading-[0.9rem]'
          type="text" placeholder='Enter Email'/>

          <input name="password"
          className='bg-white rounded-[10px] p-3 my-2 w-full text-[0.9rem] leading-[0.9rem]'
          type="text" placeholder='Enter Password'/>

          <button type="submit" className='bg-black my-3  w-fit  py-0.5 px-5 rounded-full'
              >
                <div className='text-white text-[0.9rem] leading-[1.5rem] mb-0.5'>
                  Login
                </div>
          </button>

          <button className='bg-black my-3  w-fit  py-0.5 px-5 rounded-full' type="button"
          onClick={()=>{Login_test()}}
              >
                <div className='text-white text-[0.9rem] leading-[1.5rem] mb-0.5'>
                  Test
                </div>
          </button>
        
        </form>


    </div>
  )
}

export default Login

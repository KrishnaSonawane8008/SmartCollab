import { useEffect, useState } from "react"
import { login_user, test, get_communities, cors_test, get_user_profile, autologin } from "../services/user_services"




export function useAuth(){
    
    const [login_loading, setLoginLoading] = useState(false) 


    const handleLogin=async ({username, email, password})=>{
        //async function, cannot use as-is to return a value, 
        // have to useState and useEffect for confirming user login
        try{
            setLoginLoading(true)

            const login_result=await login_user(
                {username: username, email: email, password: password}
            )

            return login_result;

        }catch(e){
            setLoginLoading(false)
            console.error(e)
            throw e

        }finally{
            setLoginLoading(false)
        }

    }

    const AutoLogin_user= async ()=>{
        return await autologin();
    }

    const Login_test=()=>{
        test()
    }

    return {
        handleLogin,
        AutoLogin_user,
        Login_test,
        login_loading
    }
}


export function useUserInfo(){

    const [loading_communities, setLoadingCommunities]=useState(false)

    const getCommunities=async ()=>{ 

        try{
            setLoadingCommunities(true)

            const communities=await get_communities()

            return communities;

        }catch(e){
            setLoadingCommunities(false)
            console.error(e)
            throw e

        }finally{
            setLoadingCommunities(false)
        }

    }

    const doCorsTest=async ()=>{
        return await cors_test()
    }


    const getUserProfile=async ()=>{
        return await get_user_profile()
    }


    return {
        getUserProfile,
        getCommunities,
        loading_communities,
        doCorsTest
    }

}
import { useEffect } from "react"
import { get_user, login_user, test } from "../services/user_services"


export function useUserOperations(){
   
    useEffect( ()=>{
        get_user()
    }, [] )

    return "hi" 
}

export function useAuth(){
    const Login=({username, email, password})=>{
        login_user(
            {username: username, email: email, password: password}
        )
    }

    const Login_test=()=>{
        test()
    }

    return {
        Login,
        Login_test
    }
}
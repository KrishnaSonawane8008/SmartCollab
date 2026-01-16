import { FetchRequest } from "../api/client";


export function get_user(){
    FetchRequest(
        "/get_user",
        {}
    )
}

export function login_user({username, email, password}){
    FetchRequest(
        "/user_login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: username, email: email, password: password }),
        }
    )
}

export function get_refresh_token(){
    FetchRequest(
        "/auth_refresh",
        {
            method: "POST",
            credentials: "include"
        }
    )
}


export function test(){
    FetchRequest(
        "/test",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: "username", email: "name@email.com", password: "pass" }),
        }
    )
}
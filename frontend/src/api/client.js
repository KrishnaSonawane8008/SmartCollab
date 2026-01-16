
const BASE_URL=import.meta.env.VITE_API_BASE_URL


let access_token=null

async function attach_AccessToken(request_options){

    if( !request_options.credentials ){
        request_options.credentials="include"
    }

    if( !request_options.headers ){
        request_options.headers={
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token? access_token: "" }`
        }
    }else if(!request_options.headers.Authorization){
        request_options.headers.Authorization=`Bearer ${access_token? access_token: "" }`
    }



}


export async function FetchRequest( 
        endpoint,
        options
){
    const some_url = `${BASE_URL}${endpoint}`;
    try {

        
        attach_AccessToken(options)
        console.log(options)

        const response = await fetch(some_url, {...options});

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        if(response.status==401){
            if(endpoint=="/auth_refresh"){
                return "authorization failed"
            }else{
                return "unauthorized"
            }
        }

        const result = await response.json();

        if(endpoint=="/user_login" && result.AccessToken){
            access_token=result.AccessToken
        }

        console.log(result)
        return result
    } catch (error) {
        console.error(error.message);
        return null;
    }
}
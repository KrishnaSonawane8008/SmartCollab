
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
    }
    request_options.headers.Authorization=`Bearer ${access_token? access_token: "" }`

}




export async function FetchRequest( 
        endpoint,
        options,
){
    const some_url = `${BASE_URL}${endpoint}`;
    try {

        
        attach_AccessToken(options)
        console.log("sending request with options:","\n", options)

        const response = await fetch(some_url, {...options});

        if (!response.ok) {

            if(response.status==401){
                console.log("response status 401, sending response to /auth_refresh")
                const refresh_response= await fetch(`${BASE_URL}/auth/refresh`, 
                                                        {
                                                            method: "POST",
                                                            credentials: "include"
                                                        } 
                                                    );

                if(!refresh_response.ok){
                    access_token=null
                    if(refresh_response.status==401){
                        throw new Error(`Authorization Error: ${response.status}`);
                        // logout user
                    }
                    throw new Error(`Response status: ${response.status}`);
                    
                }

                const refresh_result = await refresh_response.json();
                access_token=refresh_result.new_AccessToken;
                console.log("new access token set")
                //retry the previous request
                console.log("retrying the same request")
                return await FetchRequest( endpoint, options )


            }

            throw new Error(`Response status: ${response.status}`);
        }

        

        const result = await response.json();

        if(endpoint=="/user_login" && result.AccessToken){
            access_token=result.AccessToken
        }

        console.log("Server Response:","\n",result)
        return result
    } catch (error) {
        console.error(error.message);
        return null;
    }
}
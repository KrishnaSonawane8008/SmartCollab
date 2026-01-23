
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export async function FetchRequest( 
        endpoint,
        options,
){
    try{
        const some_url = `${BASE_URL}${endpoint}`;

        
        attach_AccessToken(options)
        // console.log(`sending request to ${BASE_URL}${endpoint} with options:`,"\n", options)

        const response = await fetch(some_url, {...options});

        if (!response.ok) {

            if(response.status==401){

                if(endpoint=="/auth/login"){
                    console.log("Error while login")
                    throw new Error(`Login Error: ${await response.text()}`);
                }


                console.log(`response status 401, sending request to ${BASE_URL}/auth/refresh`)

                try{
                    const refresh_response= await fetch(`${BASE_URL}/auth/refresh`, 
                                                            {
                                                                method: "POST",
                                                                credentials: "include",
                                                                headers: {
                                                                    "Content-Type": "application/json",
                                                                }
                                                            } 
                                                        );

                    if(!refresh_response.ok){
                        access_token=null
                        if(refresh_response.status==401){
                            throw new Error(`Authorization Error: ${await response.text()}`);
                        }
                        throw new Error(`Access Token Refresh Error: ${await response.text()}`);
                        
                    }

                    const refresh_result = await refresh_response.json();
                    access_token=refresh_result.new_AccessToken;
                    console.log("new access token set")
                    //retry the previous request
                    console.log("retrying the same request")
                    return await FetchRequest( endpoint, options )
                }catch(e){
                    //rethrow error
                    console.log(e)
                    throw e;
                }


            }

            throw new Error(`Response status: ${response.status}`);
        }

        

        const result = await response.json();

        if(endpoint=="/auth/login" && result.AccessToken){
            console.log("manual login, setting up access token")
            access_token=result.AccessToken
        }

        // console.log("Server Response:","\n",JSON.stringify(result, null, 2))
        return result
    }catch(e){
        //rethrow error
        throw e
    }

}
import { ws_authenticate } from "../services/user_services"

const BASE_URL=import.meta.env.VITE_CHATS_WEBSOCKET_BASE_URL

class WebSocketAPI{
    socket=null
    url=null
    listeners=new Map()
    run_on_start=new Map()

    connect(url){
        if(this.socket) return


        this.url=url
        this.socket=new WebSocket(url)

        this.socket.onopen=()=>{
            console.log("WS Connected")
            this.run_on_start.forEach((fn, key) => {fn()});
        }

        this.socket.onmessage=(event)=>{
            const data= JSON.parse(event.data)
            // console.log("data recieved: ",data)
            let type=data?.type
            if(type==="TempMessage"){ 
                type="message" 
            }
            this.listeners.forEach((val, key)=>{
                if(key===type){
                    console.log("WS data recieved: ", data)
                    val.callback(data, val.options)
                }
            })
        }

        this.socket.onclose=()=>{
            console.log("WS Disconnected")
            this.socket=null
        }

    }

    disconnect(){
        this.socket?.close()
        this.socket=null
        this.url=null
        this.listeners=new Map()
        this.run_on_start=new Map()
    }

    reconnect(){
        this.socket?.close()
        this.socket=null
        this.url=null

        ws_authenticate().then((response)=>{
            if(response.Success===true){
                this.connect(`${BASE_URL}/ws/socket_test`)
            }
        }).catch((err)=>{
            throw new Error(err)
        })
    }

    send(data){
        if(!this.socket || this.socket.readyState!==WebSocket.OPEN){
            console.log("WS not Connected")
            return
        }

        this.socket.send(JSON.stringify(data))
        console.log(`Sent: ${JSON.stringify(data)} `)
    }

    subscribe(key, fn, options){
        if(!key || !fn){
            console.error(`key:${key} or function:${fn} is undefined, cannot subscribe`)
            return
        }
        console.log(`subscribed the function ${fn.name}`)
        this.listeners.set(key, {callback:fn, options: options})

        return ()=>{
            console.log(`cleaned up the function ${fn.name}`)
            this.listeners.delete(key)
        }
    }

    subscribe_initializer(key, fn){
        if(!key || !fn){
            console.error("key or function is undefined, cannot sunscribe")
            return
        }
        this.run_on_start.set(key, fn)

        return ()=>this.run_on_start.delete(key)
    }

}


export const wsClient=new WebSocketAPI()
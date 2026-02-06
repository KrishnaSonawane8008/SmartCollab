

class WebSocketAPI{
    socket=null
    url=null
    listeners=new Set()
    run_on_start=new Set()

    connect(url){
        if(this.socket) return


        this.url=url
        this.socket=new WebSocket(url)

        this.socket.onopen=()=>{
            console.log("WS Connected")
            this.run_on_start.forEach(fn=>fn())
        }

        this.socket.onmessage=(event)=>{
            const data= JSON.parse(event.data)
            console.log("data recieved: ",data)
            this.listeners.forEach(fn=>fn(data))
        }

        this.socket.onclose=()=>{
            console.log("WS Disconnected")
            this.socket=null
        }

    }

    disconnect(){
        this.socket?.close()
        this.socket=null
    }


    send(data){
        if(!this.socket || this.socket.readyState!==WebSocket.OPEN){
            console.log("WS not Connected")
            return
        }

        this.socket.send(JSON.stringify(data))
        console.log(`Sent: ${JSON.stringify(data)} `)
    }

    subscribe(fn){
        this.listeners.add(fn)

        return ()=>this.listeners.delete(fn)
    }

    subscribe_initializer(fn){
        this.run_on_start.add(fn)

        return ()=>this.run_on_start.delete(fn)
    }

}


export const wsClient=new WebSocketAPI()
import React, { useEffect } from 'react'

const TextBox = ({fromUser=null, message=null, sender_id=null }) => {

    useEffect( ()=>{
        // console.log(fromUser)
    }, [fromUser] )

    return (

            message && (
                <div className={`w-full flex flex-row ${fromUser ? "justify-end": "justify-start"}`}>
                    {
                        fromUser ? (
                            <div className='flex flex-row w-fit max-w-[60%] justify-between mx-2 my-2 pr-[13px] relative'>
                                <div className='bg-cyan-400 w-full px-2 py-1 flex flex-col rounded-l-[10px] rounded-br-[10px] z-[2]'>
                                    <span className='flex flex-row justify-end text-[0.7rem] font-[Inter] font-bold pr-[0.2rem]'>You</span>
                                    <span className='font-[Inter] text-[0.95rem] text-wrap break-words'>{message}</span>
                                </div>
                                <div className='bg-cyan-400 min-h-[17px] min-w-[20px] top-0 right-0 absolute z-[1]'
                                    style={{ clipPath: "polygon(0% 0%, 100% 0%, 0% 100%, 0% 0%)" }}
                                >
                                    
                                </div>
                            </div>
                        ):(
                            <div className='flex flex-row w-fit max-w-[60%] justify-between mx-2 my-2 pl-[13px] relative'>
                                <div className='bg-green-400 w-full px-2 py-1 flex flex-col rounded-r-[10px] rounded-bl-[10px] z-[2]'>
                                    <span className='flex flex-row justify-start text-[0.7rem] font-[Inter] font-bold pr-[0.2rem]'>{sender_id?`User${sender_id}`:""}</span>
                                    <span className='font-[Inter] text-[0.95rem] text-wrap break-words'>{message}</span>
                                </div>
                                <div className='bg-green-400 min-h-[17px] min-w-[20px] top-0 left-0 absolute z-[1]'
                                    style={{ clipPath: "polygon(100% 0%, 100% 100%, 0% 0%, 100% 0%)" }}
                                >
                                </div>
                            </div>
                        )
                    }
                    

                </div>
            )

    )
  
}

export default TextBox

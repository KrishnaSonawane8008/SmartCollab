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
                            <div className='flex flex-row w-fit max-w-[60%]  mx-2 my-2 '>
                                <div className='bg-cyan-400 w-full px-2 py-1 flex flex-col rounded-l-[10px] rounded-br-[10px]'>
                                    <span className='flex flex-row justify-end text-[0.7rem] font-[Inter] font-bold pr-[0.2rem]'>You</span>
                                    <span className='font-[Inter] text-[0.95rem]'>{message}</span>
                                </div>
                                <div className='bg-cyan-400 h-[10px] w-[10px]'
                                style={{
                                            clipPath: "polygon(-10px 0px, 100% 0px, -10px 19px, 0px 0px)"
                                        }}
                                >
                                </div>
                            </div>
                        ):(
                            <div className='flex flex-row w-fit max-w-[60%]  mx-2 my-2 '>
                                <div className='bg-green-400 h-[10px] w-[10px]'
                                style={{
                                            clipPath: "polygon(0px 0px, 20px 19px, 20px 0px, 0px 0px)"
                                        }}
                                >
                                </div>
                                <div className='bg-green-400 w-full px-2 py-1 rounded-r-[10px] rounded-bl-[10px]'>
                                    <span className='flex flex-row justify-start text-[0.7rem] font-[Inter] font-bold pr-[0.2rem]'>{sender_id?`User${sender_id}`:""}</span>
                                    <span className='font-[Inter] text-[0.95rem]'>{message}</span>
                                </div>
                            </div>
                        )
                    }
                    

                </div>
            )

    )
  
}

export default TextBox

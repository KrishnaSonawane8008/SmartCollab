import React, { useEffect } from 'react'

const TextBox = ({fromUser=null, message=null }) => {

    useEffect( ()=>{
        console.log(fromUser)
    }, [fromUser] )

    return (

            message && (
                <div className={`bg-cyan-600 w-full flex flex-row ${fromUser ? "justify-end": "justify-start"}`}>
                    {
                        fromUser ? (
                            <div className='flex flex-row w-fit max-w-[60%]  mx-2 my-2 '>
                                <div className='bg-cyan-400 w-full px-2 py-1 rounded-l-[10px] rounded-br-[10px]'>
                                    {message}
                                </div>
                                <div className='bg-cyan-400 h-[10px] w-[10px]'
                                style={{
                                            clipPath: "polygon(0px 0px, 100% 0px, 0px 100%, 0px 0px)"
                                        }}
                                >
                                </div>
                            </div>
                        ):(
                            <div className='flex flex-row w-fit max-w-[60%]  mx-2 my-2 '>
                                <div className='bg-cyan-400 h-[10px] w-[10px]'
                                style={{
                                            clipPath: "polygon(0px 0px, 100% 100%, 100% 0px, 0px 0px)"
                                        }}
                                >
                                </div>
                                <div className='bg-cyan-400 w-full px-2 py-1 rounded-r-[10px] rounded-bl-[10px]'>
                                    {message}
                                </div>
                            </div>
                        )
                    }
                    

                </div>
            )

    )
  
}

export default TextBox

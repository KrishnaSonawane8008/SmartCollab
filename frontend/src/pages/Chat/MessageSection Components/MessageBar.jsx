import { SendHorizonal } from "lucide-react"
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { useParams, useLocation } from "react-router-dom"




const TextArea=forwardRef((props, ref)=>{

  const {max_height=100, onEnter_callback}=props

  const textareaRef=useRef()
  const mirror_textareaRef=useRef()

  const handleChange=(event)=>{
    // console.log(event.target.value)
    const element=textareaRef.current
    const mirror_element=mirror_textareaRef.current
    if(!element || !mirror_element) return
    
    
    mirror_element.value=event.target.value
    if(mirror_element.scrollHeight>max_height){
      mirror_element.style.width=`${element.offsetWidth}px`
      element.style.overflowY="auto"
    }else{
      mirror_element.style.width=`${element.offsetWidth+15}px`
      element.style.overflowY="hidden"
      element.style.height = `${mirror_element.scrollHeight}px`
    }

  }


  const handleKeyDown = (e) => {
    const element=textareaRef.current
    const mirror_element=mirror_textareaRef.current
    if(!element || !mirror_element) return

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault() // stop newline
      // console.log("sent message: ", element.value)
      if(onEnter_callback && typeof onEnter_callback === "function"){
        onEnter_callback(element.value)
      }
      clearTextArea()
    }
  }

  const EnterText=()=>{
    const element=textareaRef.current
    const mirror_element=mirror_textareaRef.current
    if(!element || !mirror_element) return

    // console.log("sent message: ", element.value)
    if(onEnter_callback && typeof onEnter_callback === "function"){
      onEnter_callback(element.value)
    }
    clearTextArea()
    
  }

  const clearTextArea=()=>{
    const element=textareaRef.current
    const mirror_element=mirror_textareaRef.current
    if(!element || !mirror_element) return

    element.value=""
    mirror_element.value=""
    element.style.overflowY="hidden"
    element.style.height = `${mirror_element.scrollHeight}px`
  }

  const FillTextArea=(value)=>{
    const element=textareaRef.current
    const mirror_element=mirror_textareaRef.current
    if(!element || !mirror_element) return
    
    
    mirror_element.value=value
    if(mirror_element.scrollHeight>max_height){
      mirror_element.style.width=`${element.offsetWidth}px`
      element.style.overflowY="auto"
    }else{
      mirror_element.style.width=`${element.offsetWidth+15}px`
      element.style.overflowY="hidden"
      element.style.height = `${mirror_element.scrollHeight}px`
    }
  }

  useImperativeHandle(ref, () => ({
    clearTextArea,
    FillTextArea,
    EnterText
  }))

  return(
    <>
      <textarea 
        ref={textareaRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        name="ChatMessageBar" 
        id="ChatMessageBar"
        rows={1}
        className="
        text-white overflow-hidden
        w-full border-1 resize-none
        px-1  !max-h-[500px] rounded-[0.4rem] text-[0.9rem]
        h-auto
        "
        >
          
      </textarea>

      <textarea 
      ref={mirror_textareaRef}
      name="textarea_mirror" 
      id="ta_mirror"
      rows={1}
      className="
      text-white -z-[50]
        w-full border-1 resize-none
        px-1 rounded-[0.4rem] text-[0.9rem]
        h-auto
        absolute top-0 right-0 bg-amber-500
      "
      >

      </textarea>
    </>
  )
})





const MessageBar = ({sendMessage_callback}) => {

  const textareaRef=useRef()

  const location=useLocation()


  useEffect(()=>{
    console.log(location)
    if(!textareaRef.current) return
    textareaRef.current.clearTextArea()
    
  },[location])

  const sendText=()=>{
    if(!textareaRef.current) return
    textareaRef.current.EnterText()
  }

  return (
    <div className='w-full max-h-fit min-h-[2.5rem] h-full py-2 flex flex-row bg-gray-800  items-end justify-center'>
      <div className="w-full  h-full flex items-center px-[0.5rem]">
        {/* <input type="text" className="w-full border-1 text-wrap px-1 h-[1.7rem] rounded-[0.4rem] text-[0.9rem]"/> */}
        <TextArea ref={textareaRef} onEnter_callback={sendMessage_callback} max_height={150}/>
      </div>

      <div className="
      !h-[2rem] cursor-pointer aspect-square mr-1.5 
      bg-gray-600 hover:bg-white rounded-full flex justify-center items-center">
        <SendHorizonal className="h-full w-full max-h-[1.2rem] max-w-[1.2rem] mt-[0.1rem] ml-[0.1rem]"
      onClick={()=>{
        sendText();
      }}
      />
      </div>
    </div>
  )
}

export default MessageBar

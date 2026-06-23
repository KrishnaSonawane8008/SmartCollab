import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SendHorizonal } from 'lucide-react'

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
    <div className="relative w-full flex flex-row items-center overflow-hidden">
      <textarea 
        ref={textareaRef}
        // value={"\u0930\u094D"}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        name="ChatMessageBar" 
        id="ChatMessageBar"
        rows={1}
        className=" text-sm  border-none outline-none
        overflow-hidden bg-transparent
        w-full resize-none
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
      disabled={true}
      className="
        -z-[50] text-white
        w-full border-1 resize-none
        px-1 rounded-[0.4rem] text-[0.9rem]
        h-auto 
        absolute top-[9999px] bg-white
      "
      >

      </textarea>
    </div>
  )
})

TextArea.displayName = 'TextArea'

const MessageBar = ({ onEnter_callback }) => {
  const textAreaRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    textAreaRef.current?.clearTextArea()
  }, [location.pathname])

  const sendText = (text) => {
    if (onEnter_callback) onEnter_callback(text)
  }

  return (
    // <div className="w-full flex justify-center pb-4 bg-transparent">
    //   <div className="w-full max-w-3xl">
    //     <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E8E4DE] shadow-sm">

    //       <TextArea
    //         ref={textAreaRef}
    //         onEnter_callback={sendText}
    //       />

    //       {/* Send button */}
    //       <button
    //         type="button"
    //         onClick={() => textAreaRef.current?.EnterText()}
    //         className="w-9 h-9 flex items-center justify-center rounded-full bg-[#2F5D50] text-white hover:opacity-90 transition"
    //       >
    //         <SendHorizonal className="w-4 h-4" />
    //       </button>

    //     </div>
    //   </div>
    // </div>

     <div className="w-full flex justify-center">
      <div className="flex items-center w-[60%] gap-2.5">
        <div className="flex-1 flex items-center px-4 py-[12px] rounded-[28px] bg-[rgba(255,255,255,0.6)] backdrop-blur-[14px] border-none shadow-[0_8px_20px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all">
          <TextArea
            ref={textAreaRef}
            onEnter_callback={sendText}
          />
        </div>
        
        <button
            type="button"
            onClick={() => textAreaRef.current?.EnterText()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#2F5D50] text-white hover:opacity-90 transition"
          >
            <SendHorizonal className="w-4 h-4" />
          </button>
      </div>
    </div>

  )
}

export default MessageBar
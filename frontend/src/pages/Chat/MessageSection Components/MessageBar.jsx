import { forwardRef, useImperativeHandle, useRef, useEffect, useState, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import mappings from './key_mappings.json'
import { Global_Context } from '../../../contexts/Global-context-provider'
import { SendHorizonal, Keyboard, KeyboardOff } from 'lucide-react'
import KeyboardReact from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import KeyBoard from './KeyBoard'
import { useLayoutEffect } from 'react'

const TextArea=forwardRef((props, ref)=>{

  const {max_height=100, onEnter_callback, setisFocused, keys, useKeys}=props

  const textareaRef=useRef()
  const mirror_textareaRef=useRef()
  const useKeysRef=useRef(useKeys)
  const cursorPositionRef = useRef(null);

  const [Text, setText]=useState("")

  useEffect(()=>{
    useKeysRef.current=useKeys
  },[useKeys])
  
  useLayoutEffect(() => {
    // Only run if we actually have a position saved
    if (cursorPositionRef.current !== null) {
      const element = textareaRef.current;
      
      // THIS is the command that moves the cursor
      element.setSelectionRange(
        cursorPositionRef.current, 
        cursorPositionRef.current
      );
      
      // Reset the ref so it doesn't trigger again on accidental re-renders
      cursorPositionRef.current = null;
    }
    adjustHeight()
  }, [Text]);

  const handleChange=(event)=>{
    // console.log(event.target.value)
    const value = event.target.value;
    setText(value); 

  }


  const adjustHeight = () => {
    const element = textareaRef.current;
    const mirror_element = mirror_textareaRef.current;
    if (!element || !mirror_element) return;

    // Ensure the mirror has the most current text
    mirror_element.value = element.value; 
    mirror_element.style.width = `${element.offsetWidth}px`;
    if (mirror_element.scrollHeight > max_height) {
      
      element.style.overflowY = "auto";
      element.style.height = `${max_height}px`;
      element.scrollTop = element.scrollHeight;
    } else {
      element.style.overflowY = "hidden";
      element.style.height = `${mirror_element.scrollHeight}px`;
    }
  };


  const handleKeyDown = (e) => {
    const element=textareaRef.current
    const mirror_element=mirror_textareaRef.current
    if(!element || !mirror_element) return

    if(keys && useKeysRef.current){

      if (e.key === 'Backspace') {
        e.preventDefault(); // Stop default browser behavior
        
        const start = element.selectionStart;
        const end = element.selectionEnd;

        cursorPositionRef.current = start !== end ? start : Math.max(0, start - 1);

        setText(prev => {
          if (start !== end) {
            return prev.slice(0, start) + prev.slice(end);
          }
          if(start==0){
            return prev
          }
          return prev.slice(0, start - 1) + prev.slice(start);
        });
        return; // Exit to prevent normal backspace behavior
      }


      if (e.key === ' ') {
        e.preventDefault(); // Stop default browser behavior
        
        const start = element.selectionStart;
        const end = element.selectionEnd;

        cursorPositionRef.current = start+1;

        // 2. Update state
        setText(prev => {
          if (start !== end) {
            return prev.slice(0, start) + " " + prev.slice(end);
          }
          return prev.slice(0, start) + " " + prev.slice(start);
        });
        return; // Exit to prevent normal backspace behavior
      }

      if (e.key === "Enter") {
        if (e.shiftKey) {
          
          return; // Exit to prevent normal backspace behavior
        }

      }

      if (e.ctrlKey) {
        if(e.key){ 
          return; // Exit to prevent normal backspace behavior
        }
      }


      const new_key=keys[e.key]
      if(new_key){
        e.preventDefault(); // Stop default browser behavior
        
        const start = element.selectionStart;
        const end = element.selectionEnd;

        cursorPositionRef.current = start+1;

        // 2. Update state
        setText(prev => {
          if (start !== end) {
            return prev.slice(0, start) + new_key + prev.slice(end);
          }
          return prev.slice(0, start) + new_key + prev.slice(start);
        });
        return; // Exit to prevent normal backspace behavior
      }
    }

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

    setText("")
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
        onFocus={() => setisFocused(true)}   /* Turn ON blinking */
        onBlur={() => setisFocused(false)}   /* Turn OFF blinking */
        // value={"\u0930\u094D"}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={Text}
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

const FloatingKeyboard = ({ isFocused }) => {
  const [input, setInput] = useState("");

  const onChange = (inputData) => {
    setInput(inputData);
  };

  const keyboardLayouts = {
    default: [
      "~/১/` !/২/১ @/৩/২ #/४/३ $/५/४ %/६/५ ^/७/६ &/८/७ */९/८ (/(/) )/)/) _/ঃ/- +/ঋ/=",
      "Q/ঔ/ো W/ঐ/ৈ E/आ/ा R/ई/ী T/ऊ/ू Y/भ/ब U/ङ/ह I/घ/ग O/ध/দ P/झ/ज {/}/[ }/|/]",
      "A/ঔ/ো S/ए/े D/अ/् F/इ/ि G/उ/ु H/फ/প J/र/र K/ख/क L/थ/त :/:/; \"/\"/' {enter}",
      "{shiftleft} Z/ः/ং X/ঁ/ং C/ण/म V/न/न B/भ/ब N/ল/ল M/श/स </</, >/>/. ?/?// {shiftright}",
      "{space}"
    ]
  };

  const unifiedHighlightMapping = {
    "q": "Q/ঔ/ো", "Q": "Q/ঔ/ো",
    "w": "W/ঐ/ৈ", "W": "W/ঐ/ৈ",
    "e": "E/आ/ा", "E": "E/आ/ा",
    "r": "R/ई/ী", "R": "R/ई/ী",
    "t": "T/ऊ/ू", "T": "T/ऊ/ू",
    "y": "Y/भ/ब", "Y": "Y/भ/ब",
    "u": "U/ङ/ह", "U": "U/ङ/ह",
    "i": "I/घ/ग", "I": "I/घ/ग",
    "o": "O/ध/দ", "O": "O/ध/দ",
    "p": "P/झ/ज", "P": "P/झ/ज",
    "a": "A/ঔ/ো", "A": "A/ঔ/ো",
    "s": "S/ए/े", "S": "S/ए/े",
    "d": "D/अ/्", "D": "D/अ/्",
    "f": "F/इ/ि", "F": "F/इ/ि",
    "g": "G/उ/ु", "G": "G/उ/ु",
    "h": "H/फ/প", "H": "H/फ/প",
    "j": "J/र/र", "J": "J/र/र",
    "k": "K/ख/क", "K": "K/ख/क",
    "l": "L/थ/त", "L": "L/थ/ত",
    "z": "Z/ः/ং", "Z": "Z/ः/ং",
    "x": "X/ঁ/ং", "X": "X/ঁ/ং",
    "c": "C/ण/म", "C": "C/ण/म",
    "v": "V/न/न", "V": "V/न/न",
    "b": "B/भ/ब", "B": "B/भ/ব",
    "n": "N/ল/ল", "N": "N/ল/ল",
    "m": "M/श/स", "M": "M/श/स"
  };

  return (
    /* Adjust this width setting to dynamically size all keycaps across rows */
    <div style={{ padding: '20px', maxWidth: '780px', margin: '0 auto' }}>
      <KeyboardReact 
        onChange={onChange} 
        inputName="default"
        physicalKeyboardHighlight={isFocused}
        physicalKeyboardHighlightPress={isFocused}
        physicalKeyboardHighlightMapping={unifiedHighlightMapping}
        layout={keyboardLayouts}
        layoutName={"default"}
      />
    </div>
  );
};

function get_language_full_name(lc){
  if(lc==="doi" || lc==="hi" || lc==="hi" || lc==="gom" || lc==="mai" || lc==="mr" || lc==="ne" || lc==="sa" || lc==="sat-Latn" || lc==="sd"){
        return "Devanagari"
    }

    if(lc==="as"){
        return "Assamese"
    }

    if(lc==="bn" || lc==="mni-Mtei"){
        return "Bangla-Manipuri"
    }

    if(lc==="gu"){
        return "Gujarati"
    }

    if(lc==="kn"){
        return "Kannada"
    }

    if(lc==="ml"){
        return "Malayalam"
    }

    if(lc==="or"){
        return "Oriya"
    }

    if(lc==="ta"){
        return "Tamil"
    }

    if(lc==="te"){
        return "Telugu"
    }

}

function get_mappings(lc){

    if(lc==="doi" || lc==="hi" || lc==="hi" || lc==="gom" || lc==="mai" || lc==="mr" || lc==="ne" || lc==="sa" || lc==="sat-Latn" || lc==="sd"){
        return mappings.Devanagari
    }

    if(lc==="as"){
        return mappings.Assamese
    }

    if(lc==="bn" || lc==="mni-Mtei"){
        return mappings.Bangla_Manipuri
    }

    if(lc==="gu"){
        return mappings.Gujarati
    }

    if(lc==="kn"){
        return mappings.Kannada
    }

    if(lc==="ml"){
        return mappings.Malayalam
    }

    if(lc==="or"){
        return mappings.Oriya
    }

    if(lc==="ta"){
        return mappings.Tamil
    }

    if(lc==="te"){
        return mappings.Telugu
    }

    return null
}

const MessageBar = ({ onEnter_callback, setKeyboardOpen }) => {
  const textAreaRef = useRef(null)
  const location = useLocation()

  const { UserData } = useContext(Global_Context)
  const [DisplayKeyboard, setDisplayKeyboard]=useState(false)
  const [isFocused, setisFocused]=useState(false)

  const [keys, setKeys]=useState(get_mappings(UserData?.preferred_language))

  useEffect(()=>{
    if(!UserData?.preferred_language) return
    setKeys(get_mappings(UserData?.preferred_language))
    if(!get_mappings(UserData?.preferred_language)){
      setDisplayKeyboard(false)
      setKeyboardOpen(false)
      return
    }
  },[UserData?.preferred_language])

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

     <div className="w-full flex flex-col items-center">
      {
        DisplayKeyboard===true &&
        <KeyBoard isFocused={isFocused} keys={keys}/>
      }
      <div className="flex items-center w-[60%] gap-2.5">
        <button
            type="button"
            onClick={() => {
              setDisplayKeyboard(!DisplayKeyboard)
              setKeyboardOpen(!DisplayKeyboard)
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-full ${!keys? "bg-[#78918b] cursor-not-allowed":"bg-[#2F5D50] cursor-pointer"} text-white hover:opacity-90 transition`}

            title={!keys?"No Keyboard available for this language":
              DisplayKeyboard===false?
              `open ${get_language_full_name(UserData?.preferred_language) || ""} typing Keyboard`
              :
              `close ${get_language_full_name(UserData?.preferred_language) || ""} typing Keyboard`
            }

            disabled={!keys}
          >
            {
              DisplayKeyboard===true?(
                <KeyboardOff className="w-5 h-5" />
              ):(
                <Keyboard className="w-5 h-5" />
              )
            }
        </button>

        <div className="flex-1 flex items-center px-4 py-[12px] rounded-[28px] bg-[rgba(255,255,255,0.6)] backdrop-blur-[14px] border-none shadow-[0_8px_20px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all">
          <TextArea
            ref={textAreaRef}
            onEnter_callback={sendText}
            setisFocused={setisFocused}
            keys={keys}
            useKeys={DisplayKeyboard}
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
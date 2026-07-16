import {CornerDownLeft} from 'lucide-react'
import mappings from './key_mappings.json'
import { useEffect, useState, useRef } from 'react'



const Key=({keyName, shift_key, inscript_key, inscript_shift_key, activeKey})=>{


    const pressed = activeKey === keyName || activeKey === shift_key;
    const [displayKey, setDisplayKey] = useState(null);

    const timerRef = useRef(null);

    useEffect(() => {
        if (!pressed){ 
            clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                setDisplayKey(null);
            }, 300);
            return;
        }

        setDisplayKey(
            activeKey === keyName
                ? inscript_key
                : inscript_shift_key
        );


    }, [pressed]);

    const keybase_bg="bg-white"
    const keyactive_bg="bg-[#dadce4]"

    return(
        <div className="max-w-[60px] max-h-[50px]  w-full h-full p-[0.2%]">
            <div className={` w-full h-full rounded-[0.5rem] p-[5%]  ${pressed ? keyactive_bg : keybase_bg} shadow-sm text-[#4c4c4c] flex justify-center items-center flex-col relative`}>
                <div className={` ${displayKey ? "opacity-0" : "opacity-100"} w-full h-full justify-center items-center flex flex-row`}>
                    <span className="mx-auto flex justify-center  items-center text-[100%]">{shift_key}</span>
                    {
                        (inscript_shift_key!=shift_key && inscript_shift_key.replaceAll(" ", "").length>0)?(
                            <span className="mx-auto flex justify-center  items-center text-[100%]">{inscript_shift_key}</span>
                        ):(
                            <span className="mx-auto flex justify-center  items-center text-[100%]">{""}</span>
                        )
                        
                    }
                </div>
                <div className={`${displayKey ? "opacity-0" : "opacity-100"} w-full h-full justify-center items-center flex flex-row`}>
                    <span className="mx-auto flex justify-center  items-center text-[100%]">{keyName}</span>
                    {
                        (inscript_key!=keyName && inscript_key.replaceAll(" ", "").length>0)?(
                            <span className="mx-auto flex justify-center  items-center text-[100%]">{inscript_key}</span>
                        ):(
                            <span className="mx-auto flex justify-center  items-center text-[100%]">{""}</span>
                        )
                    }
                </div>
                <div
                    className={`absolute inset-0 ${keyactive_bg}
                    rounded-[0.5rem]
                    flex justify-center items-center transition-opacity duration-300 ease-out m-0.5
                    ${displayKey ? "opacity-100" : "opacity-0"}`}
                >
                    {displayKey}
                </div>
            </div>
        </div>
    )
}

const OtherKey=({keyName, styles, isActive})=>{

    return(
        <div className={`w-full flex flex-row ${isActive?"bg-[#dadce4]":"bg-white"} shadow-sm text-[#4c4c4c] text-[90%] rounded-[0.5rem] justify-center items-center m-[0.2%] p-2 ${styles}`}>
            {keyName}
        </div>
    )
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

const KeyBoard = ({isFocused, keys}) => {

    if(!keys) return null

    const [activeKey, setActiveKey]=useState(null)

    const [BackspaceActive, setBackspaceActive]=useState(false)
    const [CapslockActive, setCapslockActive]=useState(false)
    const [ShiftActive, setShiftActive]=useState(false)
    const [CtrlActive, setCtrlActive]=useState(false)
    const [SpaceActive, setSpaceActive]=useState(false)

    useEffect(()=>{
        const handleKeyDown = (event) => {
            setActiveKey(event.key);
            switch(event.key){
                case "Backspace":
                    setBackspaceActive(true)
                    break;
                case "CapsLock":
                    setCapslockActive(true)
                    break;
                case "Shift":
                    setShiftActive(true)
                    break;
                case "Control":
                    setCtrlActive(true)
                    break;
                case " ":
                    setSpaceActive(true)
                    break;
                
            }
        };

        const handleKeyUp = (event) => {
            setActiveKey(null);
            switch(event.key){
                case "Backspace":
                    setBackspaceActive(false)
                    break;
                case "CapsLock":
                    setCapslockActive(false)
                    break;
                case "Shift":
                    setShiftActive(false)
                    break;
                case "Control":
                    setCtrlActive(false)
                    break;
                case " ":
                    setSpaceActive(false)
                    break;
                
            }
        };

        if(isFocused===true){
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };

    },[isFocused])

    return (
        <div className="w-full max-w-[670px] mb-2 h-full max-h-[366px]  flex flex-col items-center p-2 font-">
            <div className="w-full bg-[#eaeaeb] p-1.5 rounded-2xl">
                <div className="flex flex-row">
                    <Key activeKey={activeKey} shift_key={"~"} keyName={"`"} inscript_shift_key={keys["~"]} inscript_key={keys["`"]}/>
                    <Key activeKey={activeKey} shift_key={"!"} keyName={"1"} inscript_shift_key={keys["!"]} inscript_key={keys["1"]}/>
                    <Key activeKey={activeKey} shift_key={"@"} keyName={"2"} inscript_shift_key={keys["@"]} inscript_key={keys["2"]}/>
                    <Key activeKey={activeKey} shift_key={"#"} keyName={"3"} inscript_shift_key={keys["#"]} inscript_key={keys["3"]}/>
                    <Key activeKey={activeKey} shift_key={"$"} keyName={"4"} inscript_shift_key={keys["$"]} inscript_key={keys["4"]}/>
                    <Key activeKey={activeKey} shift_key={"%"} keyName={"5"} inscript_shift_key={keys["%"]} inscript_key={keys["5"]}/>
                    <Key activeKey={activeKey} shift_key={"^"} keyName={"6"} inscript_shift_key={keys["^"]} inscript_key={keys["6"]}/>
                    <Key activeKey={activeKey} shift_key={"&"} keyName={"7"} inscript_shift_key={keys["&"]} inscript_key={keys["7"]}/>
                    <Key activeKey={activeKey} shift_key={"*"} keyName={"8"} inscript_shift_key={keys["*"]} inscript_key={keys["8"]}/>
                    <Key activeKey={activeKey} shift_key={"("} keyName={"9"} inscript_shift_key={keys["("]} inscript_key={keys["9"]}/>
                    <Key activeKey={activeKey} shift_key={")"} keyName={"0"} inscript_shift_key={keys[")"]} inscript_key={keys["0"]}/>
                    <Key activeKey={activeKey} shift_key={"_"} keyName={"-"} inscript_shift_key={keys["_"]} inscript_key={keys["-"]}/>
                    <Key activeKey={activeKey} shift_key={"+"} keyName={"="} inscript_shift_key={keys["+"]} inscript_key={keys["="]}/>

                    <OtherKey keyName={"BCKSP"} isActive={BackspaceActive}/>

                </div>

                <div className="flex flex-row">
                    <OtherKey keyName={"CAPS"} isActive={CapslockActive}/>

                    <Key activeKey={activeKey} shift_key={"Q"} keyName={"q"} inscript_shift_key={keys["Q"]} inscript_key={keys["q"]}/>
                    <Key activeKey={activeKey} shift_key={"W"} keyName={"w"} inscript_shift_key={keys["W"]} inscript_key={keys["w"]}/>
                    <Key activeKey={activeKey} shift_key={"E"} keyName={"e"} inscript_shift_key={keys["E"]} inscript_key={keys["e"]}/>
                    <Key activeKey={activeKey} shift_key={"R"} keyName={"r"} inscript_shift_key={keys["R"]} inscript_key={keys["r"]}/>
                    <Key activeKey={activeKey} shift_key={"T"} keyName={"t"} inscript_shift_key={keys["T"]} inscript_key={keys["t"]}/>
                    <Key activeKey={activeKey} shift_key={"Y"} keyName={"y"} inscript_shift_key={keys["Y"]} inscript_key={keys["y"]}/>
                    <Key activeKey={activeKey} shift_key={"U"} keyName={"u"} inscript_shift_key={keys["U"]} inscript_key={keys["u"]}/>
                    <Key activeKey={activeKey} shift_key={"I"} keyName={"i"} inscript_shift_key={keys["I"]} inscript_key={keys["i"]}/>
                    <Key activeKey={activeKey} shift_key={"O"} keyName={"o"} inscript_shift_key={keys["O"]} inscript_key={keys["o"]}/>
                    <Key activeKey={activeKey} shift_key={"P"} keyName={"p"} inscript_shift_key={keys["P"]} inscript_key={keys["p"]}/>
                    <Key activeKey={activeKey} shift_key={"{"} keyName={"["} inscript_shift_key={keys["{"]} inscript_key={keys["["]}/>
                    <Key activeKey={activeKey} shift_key={"}"} keyName={"]"} inscript_shift_key={keys["}"]} inscript_key={keys["]"]}/>
                </div>

                <div className="flex flex-row">
                    <OtherKey keyName={"SHIFT"} isActive={ShiftActive}/>

                    <Key activeKey={activeKey} shift_key={"A"} keyName={"a"} inscript_shift_key={keys["A"]} inscript_key={keys["a"]}/>
                    <Key activeKey={activeKey} shift_key={"S"} keyName={"s"} inscript_shift_key={keys["S"]} inscript_key={keys["s"]}/>
                    <Key activeKey={activeKey} shift_key={"D"} keyName={"d"} inscript_shift_key={keys["D"]} inscript_key={keys["d"]}/>
                    <Key activeKey={activeKey} shift_key={"F"} keyName={"f"} inscript_shift_key={keys["F"]} inscript_key={keys["f"]}/>
                    <Key activeKey={activeKey} shift_key={"G"} keyName={"g"} inscript_shift_key={keys["G"]} inscript_key={keys["g"]}/>
                    <Key activeKey={activeKey} shift_key={"H"} keyName={"h"} inscript_shift_key={keys["H"]} inscript_key={keys["h"]}/>
                    <Key activeKey={activeKey} shift_key={"J"} keyName={"j"} inscript_shift_key={keys["J"]} inscript_key={keys["j"]}/>
                    <Key activeKey={activeKey} shift_key={"K"} keyName={"k"} inscript_shift_key={keys["K"]} inscript_key={keys["k"]}/>
                    <Key activeKey={activeKey} shift_key={":"} keyName={";"} inscript_shift_key={keys[":"]} inscript_key={keys[";"]}/>
                    <Key activeKey={activeKey} shift_key={"\""} keyName={"'"} inscript_shift_key={keys["\""]} inscript_key={keys["'"]}/>
                    <Key activeKey={activeKey} shift_key={"|"} keyName={"\\"} inscript_shift_key={keys["|"]} inscript_key={keys["\\"]}/>

                </div>

                <div className="flex flex-row">
                    
                    <OtherKey keyName={"CTRL"} isActive={CtrlActive}/>

                    <Key activeKey={activeKey} shift_key={"Z"} keyName={"z"} inscript_shift_key={keys["Z"]} inscript_key={keys["z"]}/>
                    <Key activeKey={activeKey} shift_key={"X"} keyName={"x"} inscript_shift_key={keys["X"]} inscript_key={keys["x"]}/>
                    <Key activeKey={activeKey} shift_key={"C"} keyName={"c"} inscript_shift_key={keys["C"]} inscript_key={keys["c"]}/>
                    <Key activeKey={activeKey} shift_key={"V"} keyName={"v"} inscript_shift_key={keys["V"]} inscript_key={keys["v"]}/>
                    <Key activeKey={activeKey} shift_key={"B"} keyName={"b"} inscript_shift_key={keys["B"]} inscript_key={keys["b"]}/>
                    <Key activeKey={activeKey} shift_key={"N"} keyName={"n"} inscript_shift_key={keys["N"]} inscript_key={keys["n"]}/>
                    <Key activeKey={activeKey} shift_key={"M"} keyName={"m"} inscript_shift_key={keys["M"]} inscript_key={keys["m"]}/>
                    <Key activeKey={activeKey} shift_key={"<"} keyName={","} inscript_shift_key={keys["<"]} inscript_key={keys[","]}/>
                    <Key activeKey={activeKey} shift_key={">"} keyName={"."} inscript_shift_key={keys[">"]} inscript_key={keys["."]}/>
                    <Key activeKey={activeKey} shift_key={"?"} keyName={"/"} inscript_shift_key={keys["?"]} inscript_key={keys["/"]}/>

                </div>

                <div className="flex flex-row h-[40px]">


                    <OtherKey keyName={"SPACE"} isActive={SpaceActive}/>


                </div>

            </div>

        </div>
    )
}

export default KeyBoard

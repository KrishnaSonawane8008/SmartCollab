import { SendHorizonal } from "lucide-react"

const MessageBar = () => {
  return (
    <div className='w-full h-full max-h-[2.5rem] flex flex-row bg-gray-800 text-white items-center pl-1'>
      <div className="w-full px-[0.5rem]">
        <input type="text" className="w-full border-1 px-1 h-[1.7rem] rounded-[0.4rem] text-[0.9rem]"/>
      </div>
      <div className="h-[1.9rem] w-[1.9rem] mr-1.5 bg-gray-600 rounded-full flex justify-center items-center p-[0.3rem]">
        <SendHorizonal className="h-full w-full"/>
      </div>
    </div>
  )
}

export default MessageBar

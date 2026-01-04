import ChatHeader from "./MessageSection Components/ChatHeader"
import TextBox from "./MessageSection Components/TextBox"
import MessageBar from "./MessageSection Components/MessageBar"

const ChatMessagesSection = () => {
  return (
    <div className='bg-amber-500 w-full h-full flex flex-col'>
      {/* Header */}
        <ChatHeader/>

      {/* Messages */} 
      <div className='bg-emerald-300 h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent'>
        {
          Array.from({length:20}, (v,i)=>{return i}).map( (elem)=>{
            return (
              <div key={elem} className="w-full">
                {
                  elem%2==0 ? (
                    <TextBox fromUser={true} message={"From User"}/>
                  ):(
                    <TextBox fromUser={false} message={"From Sender"}/>
                  )
                }
              </div>
            )
          } )
        }
      </div>

      {/* Message Bar */}
      <MessageBar/>

    </div>
  )
}

export default ChatMessagesSection

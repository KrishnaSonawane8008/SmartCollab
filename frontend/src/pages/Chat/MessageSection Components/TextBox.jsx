import { useContext } from "react"
import { translate } from "../../../services/translation_service"
import { Loader2 } from "lucide-react"
import { Global_Context } from "../../../contexts/Global-context-provider"
import { useQuery } from "@tanstack/react-query"

const TextBox = ({ fromUser = null, message = null, unique_id, sender_id = null, sender_name = null, sent_at = null, message_language='en', is_new_message = null }) => {

  const { UserData } = useContext(Global_Context)
  const { data, isError, isFetching } = useQuery({
    queryKey: ["translated_message", message, UserData?.preferred_language],
    queryFn: () => { return translate({text:message, source_lang:message_language}, UserData?.preferred_language) },
    enabled: !!is_new_message,
    staleTime: Infinity
  })

  // FIX: Compute active text dynamically on every render pass
  // Displays the translated result if ready, falls back instantly to raw message otherwise
  const activeMessageText = data?.translated ? data.translated : message

  let sent_time = null
  if (sent_at && typeof sent_at == "string") {
    const dateObj = new Date(sent_at);
    sent_time = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    message && (
      <div className="w-full flex px-4 py-0.5">
        {fromUser ? (
          <div className="flex justify-end w-full">
            <div className="bg-[#F4E6C8] text-[#2F5D50] px-2.5 pt-2.5 pb-2 rounded-2xl rounded-br-none flex flex-col max-w-[70%] shadow-sm">
              {isError ? (
                <div className="flex w-full justify-end">
                  <span className="min-w-0 wrap-anywhere">
                    {message}
                  </span>
                </div>
              ) : isFetching ? (
                <div className="flex w-full break-all justify-end">
                  <Loader2 className="animate-spin size-3 m-1" />
                  {/* Instantly shows current raw text prop instead of stale state */}
                  <span className="min-w-0 wrap-anywhere overflow-wrap-break-word animate-pulse">
                    {message}
                  </span>
                </div>
              ) : (
                <div className="flex w-full justify-end">
                  <span className="min-w-0 wrap-anywhere">
                    {activeMessageText}
                  </span>
                </div>
              )}
              <div className="font-[Inter] bg-gree pt-1 text-[0.6rem] w-full flex justify-end">
                {sent_time}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-start w-full">
            <div className="bg-[#2F5D50] text-white px-4 py-2 rounded-2xl rounded-bl-none max-w-[70%] shadow-sm">
              <div className="text-[0.7rem] pb-1">{sender_name}</div>

              {isError ? (
                <div className="flex w-full justify-start">
                  <span className="min-w-0 wrap-anywhere">
                    {message}
                  </span>
                </div>
              ) : isFetching ? (
                <div className="flex w-full break-all justify-start">
                  <Loader2 className="animate-spin size-3 m-1" />
                  {/* Instantly shows current raw text prop instead of stale state */}
                  <span className="min-w-0 wrap-anywhere overflow-wrap-break-word animate-pulse">
                    {message}
                  </span>
                </div>
              ) : (
                <div className="flex w-full justify-start">
                  <span className="min-w-0 wrap-anywhere">
                    {activeMessageText}
                  </span>
                </div>
              )}

              <div className="font-[Inter] pt-2 text-[0.6rem] w-full flex justify-start">
                {sent_time}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  )
}

export default TextBox

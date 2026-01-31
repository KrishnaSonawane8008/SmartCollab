import { useEffect } from "react"
import { useRouteError } from "react-router-dom"

const ErrorFallback = () => {
    const error=useRouteError()
  return (
    <div className=" 
        absolute w-full h-full z-50 bg-red-400 flex flex-col items-center pt-4 text-black
        font-[Inter]
        ">
        <span>Error Status: {error.status}</span>
        <span>{error.message}</span>
        <span>{error.dat}</span>
    </div>
  )
}

export default ErrorFallback

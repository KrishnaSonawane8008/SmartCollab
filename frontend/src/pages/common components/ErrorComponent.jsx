

const ErrorComponent = ({err_msg, status_code}) => {
    if(err_msg){
        const error=new Error(err_msg)
        if(status_code){
            error.status=status_code
        }
        throw error
    }
  return (
    <></>
  )
}

export default ErrorComponent

import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

const ScrollBar = ({children}) => {
  return (
    <SimpleBar 
      className="
        flex-1 min-h-0
        sb-scope
        
        [--sb-thumb:#c7c7c7]
        [--sb-track:#ff000000]
        [--sb-width:9px]
      "
    >
        {children}
    </SimpleBar>
  )
}

export default ScrollBar

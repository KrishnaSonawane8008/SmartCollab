import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

const ScrollBar = ({children, barWidth}) => {
  // The Parent of the ScrollBar compoenent needs to have diaplay:flex
  return (
    <SimpleBar 
      className={`
        flex-1 min-h-0
        sb-scope
        
        [--sb-thumb:#c7c7c7]
        [--sb-track:#ff000000]
        [--sb-width:${barWidth?barWidth:9}px]
      `}
    >
        {children}
    </SimpleBar>
  )
}

export default ScrollBar

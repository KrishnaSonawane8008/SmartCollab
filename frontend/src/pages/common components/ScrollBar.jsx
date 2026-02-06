import { useRef,useEffect,forwardRef,useImperativeHandle } from "react"
import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"

const ScrollBar = forwardRef((props, ref) => {
  const scrollbarRef=useRef(null)
  const {children, barWidth, scroll_to_bottom=false}=props

  const scrollToBottom = () => {
    if(!scrollbarRef.current) return
    const scrollEl = scrollbarRef.current.getScrollElement();
    scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  useImperativeHandle(ref, () => ({
    scrollToBottom
  }))

  // The Parent of the ScrollBar compoenent needs to have diaplay:flex
  return (
    <SimpleBar 
      ref={scrollbarRef}
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
})

export default ScrollBar

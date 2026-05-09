import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { forwardRef, useImperativeHandle, useRef } from 'react'

const ScrollBar = forwardRef(({ children, styles }, ref) => {
  const scrollbarRef = useRef(null)

  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (scrollbarRef.current) {
        const el = scrollbarRef.current.getScrollElement()
        if (el) el.scrollTop = el.scrollHeight
      }
    }
  }))

  return (
    <SimpleBar
      ref={scrollbarRef}
      className={`flex-1 min-h-0 h-full ${styles}`}
      style={{ height: '100%', width: '100%' }}
    >
        {children}
    </SimpleBar>
  )
})

ScrollBar.displayName = 'ScrollBar'

export default ScrollBar
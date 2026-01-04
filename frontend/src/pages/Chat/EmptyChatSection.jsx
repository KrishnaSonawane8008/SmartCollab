import React from 'react'

const EmptyChatSection = () => {
  return (
    <div className='bg-amber-500 w-full h-full flex flex-col'>
      {/* Header */}
      <div className='bg-red-500 w-full'>
        Empty Chat Section Header
      </div>
      {/* Messages */}
      <div className='bg-red-300 h-full w-full'>
        Empty Message Section
      </div>
    </div>
  )
}

export default EmptyChatSection

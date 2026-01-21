

const UserProfile = ({username,email}) => {
  return (
        <div
            className='
            bg-amber-500 w-full aspect-square max-w-[100px]
            flex flex-col items-center justify-center
            rounded-[0.4rem]
            '
          >
            <div
            className='leading-[1.069rem] 
            mt-[0.2rem] text-[1.5rem]  font-[Inter] font-[1000] 
            min-h-0 min-w-0'
            >
              {username[0]?.toUpperCase()}
            </div>
        </div>
  )
}

export default UserProfile

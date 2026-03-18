import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'

const Navbartwo = () => {
  const { ownerUser, logoutOwner } = useAppContext()

  return (
    <div className='flex items-center justify-between px-4 md:px-8 
    border-b border-gray-300 py-3 bg-white transition-all duration-300'>
      
      <Link to='/'>
        <img src={assets.logo} alt="logo" className='h-9 invert opacity-80' />
      </Link>

      <div className='flex items-center gap-3'>
        {/* User avatar/initial */}
        <div className='h-9 w-9 rounded-full bg-blue-600 flex items-center 
        justify-center text-white font-medium text-sm'>
          {ownerUser?.username?.charAt(0).toUpperCase() || "O"}
        </div>

        {/* Owner name */}
        <span className='text-sm text-gray-700 hidden sm:block'>
          {ownerUser?.username?.split(" ")[0] || "Owner"}
        </span>

        {/* Logout button */}
        <button
          onClick={logoutOwner}
          className='text-sm text-red-500 hover:text-red-600 border border-red-200 
          hover:border-red-400 px-3 py-1.5 rounded-lg transition'
        >
          Logout
        </button>
      </div>

    </div>
  )
}

export default Navbartwo
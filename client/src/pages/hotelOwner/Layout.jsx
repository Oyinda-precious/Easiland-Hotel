import React, { useEffect, useState } from 'react'
import Navbartwo from '../../components/hotelOwner/Navbartwo'
import Sidebar from '../../components/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
  const { isOwner, navigate, user, userLoading } = useAppContext()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      navigate('/owner/login')
      return
    }

    if (user && !isOwner) {
      navigate('/')
      return
    }

    setIsReady(true)
  }, [isOwner, user, userLoading])

  if (!isReady) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
          <p className='text-gray-500 text-sm'>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    
    <div className='flex flex-col h-screen overflow-hidden'>
      <Navbartwo />
      
      <div className='flex flex-1 min-h-0'>
        <Sidebar />
      
        <div className='flex-1 p-4 pt-10 md:px-10 overflow-y-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
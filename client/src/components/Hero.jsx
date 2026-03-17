import React, { useState } from 'react'
import { assets, cities } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Hero = () => {

  const { navigate, getToken, axios, setSearchedCities } = useAppContext();
  const [destination, setDestination] = useState("")

  const onSearch = async (e) => {
    e.preventDefault();
    navigate(`/rooms?destination=${destination}`)
    await axios.post('/api/user/store-recent-search',
      { recentSearchedCity: destination },
      { headers: { Authorization: `Bearer ${await getToken()}` } }
    )
    setSearchedCities((prevSearchedCities) => {
      const updatedSearchedCities = [...prevSearchedCities, destination];
      if (updatedSearchedCities.length > 3) {
        updatedSearchedCities.shift();
      }
      return updatedSearchedCities;
    })
  }

  return (
    // Outer div — background image
    <div className='relative flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 h-screen bg-[url("/src/assets/welcomeimage.webp")] bg-no-repeat bg-cover bg-center'>

      {/* Dark overlay — adjust /50 to control darkness e.g /40 lighter /60 darker */}
      <div className='absolute inset-0 bg-black/50'></div>

      {/* Content — sits above the overlay */}
      <div className='relative z-10'>

        {/* Welcome badge */}
        <p className='bg-white/20 backdrop-blur-sm text-white px-3.5 py-1 rounded-full mt-20 w-fit text-sm font-medium border border-white/30'>
          Welcome to Easiland
        </p>

        {/* Main heading */}
        <h1 className='font-playfair text-2xl md:text-5xl md:text-[56px] font-bold md:font-extrabold max-w-xl mt-4 text-white leading-tight'>
          Discover Your Perfect Gateway Destination
        </h1>

        {/* Subheading */}
        <p className='max-w-130 mt-2 text-sm md:text-base text-gray-200'>
          Discover our premium accommodations and exceptional service. Start your journey today.
        </p>

        {/* Search form */}
        <form onSubmit={onSearch} className='bg-white text-gray-500 rounded-xl px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto shadow-2xl'>

          {/* Check In */}
          <div>
            <div className='flex items-center gap-2'>
              <img src={assets.calenderIcon} alt="" className='h-4' />
              <label htmlFor="checkIn" className='text-sm font-medium text-gray-600'>Check in</label>
            </div>
            <input
              id="checkIn"
              type="date"
              className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none focus:border-blue-400 transition"
            />
          </div>

          {/* Divider */}
          <div className='w-px bg-gray-200 max-md:hidden self-stretch mt-6'></div>

          {/* Check Out */}
          <div>
            <div className='flex items-center gap-2'>
              <img src={assets.calenderIcon} alt="" className='h-4' />
              <label htmlFor="checkOut" className='text-sm font-medium text-gray-600'>Check out</label>
            </div>
            <input
              id="checkOut"
              type="date"
              className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none focus:border-blue-400 transition"
            />
          </div>

          {/* Divider */}
          <div className='w-px bg-gray-200 max-md:hidden self-stretch mt-6'></div>

          {/* Guests */}
          <div className='flex md:flex-col max-md:gap-2 max-md:items-center'>
            <label htmlFor="guests" className='text-sm font-medium text-gray-600'>Guests</label>
            <input
              min={1}
              max={4}
              id="guests"
              type="number"
              className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16 focus:border-blue-400 transition"
              placeholder="0"
            />
          </div>

          {/* Search button */}
          <button className='flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all py-3 px-6 text-white my-auto cursor-pointer max-md:w-full max-md:py-2 font-medium'>
            {/* <img src={assets.searchIcon} alt="search" className='h-5 invert' /> */}
            <span>Search</span>
          </button>

        </form>
      </div>
    </div>
  )
}

export default Hero
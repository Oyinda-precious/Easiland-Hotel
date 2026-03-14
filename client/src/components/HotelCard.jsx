import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const HotelCard = ({ room, index }) => {
  const { currency } = useAppContext()
  const location = useLocation()

  // Show price only on /rooms page, NOT on home page
  const showPrice = location.pathname !== '/'

  if (!room || !room.hotel) return null;

  return (
    <Link
      to={'/rooms/' + room._id}
      onClick={() => scrollTo(0, 0)}
      key={room._id}
      className='relative w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)] flex flex-col'
    >
      {/* Fixed height image so all cards are same size */}
      <div className='relative h-48 w-full overflow-hidden'>
        <img
          src={room.images[0]}
          alt="room"
          className='w-full h-full object-cover'
        />
        {/* {index % 2 === 0 && (
          <p className='px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full'>
            Best Seller
          </p>
        )} */}
      </div>

      {/* Card content */}
      <div className='p-4 pt-3 flex flex-col flex-1'>
        <div className='flex items-center justify-between'>
          <p className='font-playfair text-lg font-medium text-gray-800 truncate'>
            {room.hotel?.name || "Hotel Name"}
          </p>
          <div className='flex items-center gap-1 ml-2 shrink-0'>
            <img src={assets.starIconFilled} alt="star" className='w-4 h-4' />
            <span className='text-sm'>4.5</span>
          </div>
        </div>

        <div className='flex items-center gap-1 text-sm mt-1'>
          <img src={assets.locationIcon} alt="location" className='w-4 h-4 shrink-0' />
          <span className='truncate'>{room.hotel?.address || "Location unavailable"}</span>
        </div>

        <div className='flex items-center justify-between mt-4'>
          {/* {showPrice ? (
            <p className='text-lg font-medium text-gray-800'>
              {currency}{room?.pricePerNight.toLocaleString()}
              <span className='text-sm text-gray-500'>/night</span>
            </p>
          ) : (
            <p className='text-sm text-blue-500 font-medium'>
              View Details →
            </p>
          )} */}

          <button className='px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-all cursor-pointer shrink-0'>
            Book Now
          </button>
        </div>
      </div>
    </Link>
  )
}

export default HotelCard
import React, { useMemo, useState } from 'react'
import { assets, facilityIcons } from '../assets/assets'
import { useNavigate, useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer mt-2 text-sm">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(e.target.checked, label)}
        className="w-4 h-4 text-blue-600 rounded"
      />
      <span className="font-light select-none">{label}</span>
    </label>
  )
}

const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer mt-2 text-sm">
      <input
        type="radio"
        name="sortOption"
        checked={selected}
        onChange={() => onChange(label)}
        className="w-4 h-4 text-blue-600 rounded"
      />
      <span className="font-light select-none">{label}</span>
    </label>
  )
}

const AllRooms = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, navigate, currency } = useAppContext();

  const [openFilters, setOpenFilters] = useState(false)

  
  const [selectedFilters, setSelectedFilters] = useState({
    roomType: searchParams.get('roomType') ? [searchParams.get('roomType')] : [],
    priceRange: [],
  });

  const [selectedSort, setSelectedSort] = useState('')

  const roomTypes = [
    'Single Bed',
    'Double Bed',
    'Luxury Room',
    'Family Suite',
  ]

  const sortOptions = [
    'Price: Low to High',
    'Price: High to Low',
    'Newest First',
  ]

  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (checked) {
        updatedFilters[type].push(value)
      } else {
        updatedFilters[type] = updatedFilters[type].filter(item => item !== value);
      }
      return updatedFilters;
    })
  }

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
  }

  
  const matchesRoomType = (room) => {
    const urlRoomType = searchParams.get('roomType');
    const activeFilters = selectedFilters.roomType.length > 0
      ? selectedFilters.roomType
      : urlRoomType ? [urlRoomType] : [];
    return activeFilters.length === 0 || activeFilters.includes(room.roomType);
  }

  const matchesPriceRange = (room) => {
    return selectedFilters.priceRange.length === 0 ||
      selectedFilters.priceRange.some(range => {
        const [min, max] = range.split('to').map(Number);
        return (
          typeof room?.pricePerNight === "number" &&
          room.pricePerNight >= min &&
          room.pricePerNight <= max
        );
      })
  }

  const sortRooms = (a, b) => {
    const priceA = a?.pricePerNight ?? 0;
    const priceB = b?.pricePerNight ?? 0;
    if (selectedSort === 'Price: Low to High') return priceA - priceB;
    if (selectedSort === 'Price: High to Low') return priceB - priceA;
    if (selectedSort === 'Newest First') {
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    }
    return 0;
  };

  const filterDestination = (room) => {
    const destination = searchParams.get('destination');
    if (!destination) return true;
    return room.hotel?.city?.toLowerCase().includes(destination.toLowerCase()) ?? false;
  }

  const filteredRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];
    return rooms
      .filter(room =>
        matchesRoomType(room) &&
        matchesPriceRange(room) &&
        filterDestination(room)
      )
      .sort(sortRooms);
  }, [rooms, selectedFilters, selectedSort, searchParams]);

  const clearFilters = () => {
    setSelectedFilters({
      roomType: [],
      priceRange: [],
    });
    setSelectedSort('');
    setSearchParams({});
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between 
      pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">

     
      <div>
        <div className="flex flex-col items-start text-left">
          <h1 className="font-playfair text-4xl md:text-[40px]">Hotel Rooms</h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-174">
            Take advantage of our limited-time offers and special packages to
            enhance your stay and create unforgettable memories.
          </p>
        </div>

       
        {searchParams.get('roomType') && (
          <div className="flex items-center gap-2 mt-4">
            <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
              {searchParams.get('roomType')}
            </span>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-red-500 underline"
            >
              Clear
            </button>
          </div>
        )}

        {filteredRooms.length === 0 ? (
          <div className="mt-10 text-gray-500 text-center py-20">
            <p className="text-lg">No rooms found for the selected filters.</p>
            <button onClick={clearFilters} className="mt-4 text-blue-600 underline text-sm">
              Clear filters
            </button>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room._id}
              className="flex flex-col md:flex-row items-start py-10 gap-6 border-b 
              border-gray-300 last:pb-30 last:border-0"
            >
              <img
                onClick={() => {
                  navigate(`/rooms/${room._id}`)
                  window.scrollTo(0, 0)
                }}
                src={room.images?.[0]}
                alt="hotel-img"
                title="View Room Details"
                className="max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer"
              />

              <div className="md:w-1/2 flex flex-col gap-2">
                <p className="text-gray-500">{room.hotel?.city}</p>
                <p
                  onClick={() => {
                    navigate(`/rooms/${room._id}`)
                    window.scrollTo(0, 0)
                  }}
                  className="text-gray-800 text-3xl font-playfair cursor-pointer"
                >
                  {room.hotel?.name}
                </p>
                <div className="flex items-center">
                  <StarRating />
                  <p className="ml-2">200+ reviews</p>
                </div>
                <div className="flex items-center gap-1 text-gray-500 mt-2 text-sm">
                  <img src={assets.locationIcon} alt="location-icon" />
                  <span>{room.hotel?.address}</span>
                </div>
                <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
                  {room.amenities?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70"
                    >
                      <img src={facilityIcons[item]} alt={item} className="w-5 h-5" />
                      <p className="text-xs">{item}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xl font-medium text-gray-700">
                  ₦{room?.pricePerNight.toLocaleString() ?? 0} / night
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FILTERS */}
      <div className="bg-white w-80 border border-gray-300 text-gray-600
        max-lg:mb-8 min-lg:mt-16">
        <div
          className="flex items-center justify-between px-5 py-2.5 border-b 
          border-gray-300 cursor-pointer"
          onClick={() => setOpenFilters(!openFilters)}
        >
          <p className="text-base font-medium text-gray-800">FILTERS</p>
          <span className="text-xs lg:hidden">
            {openFilters ? 'HIDE' : 'SHOW'}
          </span>
        </div>

        <div className={`${openFilters ? 'h-auto' : 'h-0 lg:h-auto'} overflow-hidden transition-all duration-700`}>
          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2">Popular Filters</p>
            {roomTypes.map((room, index) => (
              <CheckBox key={index} label={room}
                selected={selectedFilters.roomType.includes(room)}
                onChange={(checked) => handleFilterChange(checked, room, 'roomType')} />
            ))}
          </div>

          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2">Price Range</p>
            {[
              { label: '₦0 to ₦50,000', value: '0 to 50000' },
              { label: '₦50,000 to ₦100,000', value: '50000 to 100000' },
              { label: '₦100,000 to ₦200,000', value: '100000 to 200000' },
              { label: '₦200,000 and above', value: '200000 to 999999999' },
            ].map((range, index) => (
              <CheckBox key={index} label={range.label}
                selected={selectedFilters.priceRange.includes(range.value)}
                onChange={(checked) => handleFilterChange(checked, range.value, 'priceRange')} />
            ))}
          </div>

          <div className="px-5 pt-5 pb-7">
            <p className="font-medium text-gray-800 pb-2">Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton key={index} label={option}
                selected={selectedSort === option}
                onChange={() => handleSortChange(option)} />
            ))}
          </div>

         
          <div className="px-5 pb-5">
            <button
              onClick={clearFilters}
              className="w-full text-sm text-red-500 border border-red-300 rounded-lg py-2 hover:bg-red-50 transition"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllRooms
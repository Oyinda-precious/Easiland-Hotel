import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { assets, facilityIcons, roomCommonData } from '../assets/assets';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const RoomDetails = () => {
    const {id} = useParams();
    const {rooms, getToken, axios, navigate} = useAppContext();
    const [room, setRoom] = useState(null)
    const [mainImage, setMainImage] = useState(null)
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [guests, setGuests] = useState(1);

    const [isAvailable, setIsAvailable] = useState(false);

    //check if room is available.
    const checkAvailability = async () => {
      try {
        //check Is check-In Date is greater than check-Out Date
        if (checkInDate >= checkOutDate) {
          toast.error('Check-In Date should be less than Check-Out Date');
          return;
          
        }
        const {data} = await axios.post(`/api/bookings/check-availability`,
         {roomId: id, checkInDate, checkOutDate})
         if (data.success) {
          if (data.isAvailable) {
            setIsAvailable(true)
            toast.success("Room is available! You can proceed to book.")
          }else{
            setIsAvailable(false)
            toast.error("Room is not available for the selected dates. Please choose different dates.")
          }
         }else{
          toast.error(data.message)
         }
        
      } catch (error) {
          toast.error("Error checking room availability")
         
      }
    }

    //onSubmit function to check availability & book the room
    const onSubmitHandler = async (e) => {
  try {
    e.preventDefault();

    if (!isAvailable) {
      return checkAvailability();
    }

    const token = await getToken();
    // console.log("Token:", token);

    if (!token) {
      toast.error("Please login to book a room");
      return navigate("/login");
    }

    const { data } = await axios.post(
      "/api/bookings/book",
      { roomId: id, checkInDate, checkOutDate, guests, paymentMethod: "Pay At Hotel" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (data.success) {
      toast.success(data.message);
      navigate("/my-bookings");
      scrollTo(0, 0);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.log(error);
    toast.error("Error booking room");
  }
};
    // const onSubmitHandler = async (e) => {
    //  try {
    //   e.preventDefault();
    //   if (!isAvailable) {
    //     return checkAvailability();
    //   }else{
    //       const token = await getToken();
      
      
    //     const {data} = await axios.post('/api/bookings/book', 
    //       {roomId: id, checkInDate, checkOutDate, guests, paymentMethod: "Pay At Hotel"},
    //       {headers: {Authorization: `Bearer ${await getToken()}`}})
    //       if (data.success) {
    //         toast.success(data.message)
    //         navigate('/my-bookings')
    //         scrollTo(0, 0)
    //       }else{
    //         toast.error(data.message)
    //       }
    //   }

    //  } catch (error) {
    //    toast.error("Error booking room")
    //    console.log(error)

    //  } 
    // }

    useEffect(() => {
  if (!Array.isArray(rooms) || rooms.length === 0) return;
  const foundRoom = rooms.find(r => r._id === id);
  if (foundRoom) {
    setRoom(foundRoom);
    setMainImage(foundRoom.images?.[0] || null);
  }
}, [rooms, id])


// 🔽 AFTER your useEffect

if (!room) {
  return (
    <div className="pt-40 text-center text-lg">
      Loading room details...
    </div>
  )
}
  return  (
    <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
        {/* Room Details */}
        <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
           <h1 className='text-3xl md:text-4xl font-playfair'>{room.hotel?.name}
            <span className='font-inter text-sm'>({room.roomType})</span>
            </h1> 
            <p className=' flex fel-col text-xs font-inter py-1.5 px-3
             text-white bg-orange-500 rounded-full'>20% OFF</p>
        </div>
        {/* Room Rating */}
        <div className='flex items-center mt-2 gap-1'>
            <StarRating/>
            <p className='ml-2'>200+ reviews</p>
        </div>
        {/* Room Address */}
        <div className='flex items-center gap-1 text-gray-500 mt-2'>
            <img src={assets.locationIcon} alt="location-icon" />
            <span>{room.hotel?.address}</span>
        </div>

        {/* Room images */}
        <div className='flex flex-col lg:flex-row  mt-6 gap-6    '>
        <div className='lg:w-1/2 w-full '>
            <img src={mainImage} alt="Room Image" className='w-full rounded-xl shadow-lg object-cover ' />
        </div>
            <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
                {room?.images.length > 1 && room.images.map((image, index)=>(
                    <img onClick={()=>setMainImage(image)}
                    key={index} src={image} alt="Room Image" className= {`w-full rounded-xl shadow-lg object-cover cursor-pointer 
                     ${mainImage === image && 'outline-3 outline-orange-500'}`} />
                ))}
            </div>
        </div>
        {/* Room Highlight */}
        <div className='flex flex-col md:flex-row md:justify-between mt-10'>
               <div className='flex flex-col'>
                 <h1 className='text-3xl md:text-4xl font-playfair'>Experience Luxury Like Never Before</h1>
               
               <div className='flex flex-wrap items-center gap-4 mt-3 md:6 '>
                {room.amenities?.map((item, index)=>(
                    <div key={index} className='flex item-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                        <img src={facilityIcons[item]} alt={item} className='w-5 h-5'/>
                       <p className='text-x5'>{item}</p>
                    </div>
                ))}
               </div>
               </div>
               {/* Room price */}
               <p className='text-2xl font-medium'>${room?.pricePerNight}/night</p>
        </div>
        {/* CheckIn CheckOut Form */}
        <form onSubmit={onSubmitHandler} className='flex flex-col md:flex-row items-start  
        md:item-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)]
        p-6 rounded-xl mx-auto mt-16 max-w-6xl '>
            <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>
                {/* //checkIn input */}
                <div className='flex flex-col'>
                    <label htmlFor="checkInDate" className='font-medium'>Check-In</label>
                    <input onChange={(e)=>setCheckInDate(e.target.value)}
                     min={new Date().toISOString().split('T')[0]} 
                     type="date" id='checkInDate' placeholder='Check-In' 
                    className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' required/>
                </div>
                  {/* //checkOut input */}
                  <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
                  <div className='flex flex-col'>
                    <label htmlFor="checkOutDate" className='font-medium'>Check-Out</label>
                    <input onChange={(e)=>setCheckOutDate(e.target.value)}
                     min={checkInDate} disabled={!checkInDate}
                    type="date" id='checkOutDate' placeholder='Check-Out' 
                    className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' required/>
                </div>
                {/* //guests input */}
                <div className='w-px h-15 bg-gray-300/70 max-md:hidden'></div>
                  <div className='flex flex-col'>
                    <label htmlFor="guests" className='font-medium'>Guests</label>
                    <input onChange={(e)=>setGuests(Number(e.target.value))} value={guests}
                      type="number" id='guests' placeholder='1' 
                    className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' required/>
                </div>

            </div>
            <button type='submit' className='bg-primary hover:bg-primary-dull active:scale-95 
            transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 
            text-base cursor-pointer' >
               {isAvailable ? "Book Now" : "Check Availability"}
            </button>
        </form>

                {/* Common Specifications */}
                <div className='mt-25 space-y-4'>
                  {roomCommonData.map((spec, index)=>(
                    <div key={index} className='flex items-start gap-2'>
                        <img src={spec.icon} alt={`${spec.title}`} className='w-6.5' />
                        <div>
                           <p className='text-base'>{spec.title}</p> 
                           <p className='text-gray-500'>{spec.description}</p> 
                        </div>
                    </div>
                  ))}
                </div>

                  <div  className='max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500'> 
                    <p>
                       Guests will be allocated on the fround floor according to the availability at the time of check-in.
                       Special requests are subject to availability and cannot be guaranteed. Additional charges may apply.
                    </p>
                  </div>
                  {/* Hosted by */}
                  <div className='flex flex-col items-start gap-4'>
                    <div className='flex gap-4'>
                        <img src={room.hotel?.owner?.image} alt="Host" className='h-14 w-14 md:h-18 md:w-18 rounded-full' />
                  <div>
                    <p>Hosted by {room.hotel?.name}</p>
                    <div className='flex items-center mt-1'>
                        <StarRating/>
                        <p className='ml-2'>200+ reviews</p>
                    </div>
                  </div>

                    </div>
                   <button className='px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer'>Contact Now</button>
                  </div>
    </div>
  )
}

export default RoomDetails
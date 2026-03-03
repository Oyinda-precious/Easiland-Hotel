import React from 'react'
import Hero from '../components/Hero'
import FeauturedDestination from '../components/FeauturedDestination'
import ExclusiveOffers from '../components/ExclusiveOffers'
import Testimonial from '../components/Testimonial'
import Newsletter from '../components/Newsletter'
// import RecommendedHotels from '../components/RecommendedHotels'

const Home = () => {
  return (
    <>
        <Hero />
        {/* <RecommendedHotels/> */}
        <FeauturedDestination/>
        <ExclusiveOffers/>
        <Testimonial/>
        <Newsletter/>
    </>
  )
}

export default Home
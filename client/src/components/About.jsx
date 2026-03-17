import React from 'react'

const About = () => {
  return (
    <div>
       <section className="max-w-5xl mx-auto px-6 py-20">

  {/* About Title */}
  <div className="text-center">
    <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
      About Easiland Hotel
    </h1>

    <p className="mt-6 text-gray-600 leading-relaxed max-w-3xl mx-auto text-lg">
      Easiland Hotel is a modern hospitality platform designed to make hotel
      booking simple, comfortable, and reliable for travelers. Our goal is to
      provide guests with a seamless experience where they can easily discover,
      book, and enjoy quality accommodation.
    </p>
  </div>

</section>

<section className="max-w-6xl mx-auto px-6 py-16">

  <div className="grid md:grid-cols-2 gap-10">

    {/* Vision */}
    <div className="bg-white shadow-md rounded-xl p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Our Vision
      </h2>
      <p className="text-gray-600 leading-relaxed">
        To become a trusted and innovative hospitality platform that provides
        convenient, reliable, and comfortable accommodation experiences for
        travelers everywhere.
      </p>
    </div>

    {/* Mission */}
    <div className="bg-white shadow-md rounded-xl p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Our Mission
      </h2>
      <p className="text-gray-600 leading-relaxed">
        Our mission is to simplify the hotel booking experience by providing
        a user-friendly platform where guests can easily discover, book, and
        manage their stays while enjoying excellent hospitality and customer
        satisfaction.
      </p>
    </div>

  </div>

</section>

<section className="max-w-6xl mx-auto px-6 py-16">

  <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
    Our Core Values
  </h2>

  <div className="grid md:grid-cols-3 gap-8">

    <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Customer Satisfaction</h3>
      <p className="text-gray-600">
        We prioritize the comfort and happiness of our guests by delivering
        quality service and a seamless booking experience.
      </p>
    </div>

    <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Integrity</h3>
      <p className="text-gray-600">
        We operate with honesty and transparency in our pricing and services.
      </p>
    </div>

    <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Innovation</h3>
      <p className="text-gray-600">
        We continuously improve our platform through modern technology.
      </p>
    </div>

    <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Excellence</h3>
      <p className="text-gray-600">
        We maintain high standards in hospitality and service delivery.
      </p>
    </div>

    <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Reliability</h3>
      <p className="text-gray-600">
        Guests can trust Easiland for dependable bookings and smooth stays.
      </p>
    </div>

  </div>

</section>
        </div>
    
  )
}

export default About
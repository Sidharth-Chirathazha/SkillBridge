import React from 'react'
import hero_img from '../../assets/images/hero_img.jpg'
import { FaBook, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";


const HeroSection = () => {
  return (
    <section id="home" className="bg-gradient-to-r from-primary to-secondary text-white">
      <div className="container mx-auto flex flex-col md:flex-row items-center py-16 px-6">
        {/* Left Column */}
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Learn From the Best</h1>
          <p className="text-lg mb-6">Explore top courses and categories to excel in your career.</p>
          <div className="relative w-full md:w-2/3">
            <input
                type="text"
                placeholder="Search for courses..."
                className="px-4 py-2 w-full rounded bg-white text-text border border-gray-300 focus:border-secondary focus:ring focus:ring-secondary/40 outline-none transition-all duration-300 pr-12"
            />
            <button
                type="submit"
                className="absolute inset-y-0 right-0 px-4 bg-primary text-white font-bold rounded-r hover:bg-secondary transition-all duration-300"
            >
                Search
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1">
          <img src={hero_img} alt="Hero" className="rounded shadow-lg" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto py-10 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Courses */}
          <div className="bg-white text-text rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300">
            <FaBook className="text-primary text-4xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold">Total Courses</h3>
            <p className="text-4xl font-bold text-primary mt-2">1,200+</p>
          </div>

          {/* Total Students */}
          <div className="bg-white text-text rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300">
            <FaUserGraduate className="text-primary text-4xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold">Total Students</h3>
            <p className="text-4xl font-bold text-primary mt-2">25,000+</p>
          </div>

          {/* Total Tutors */}
          <div className="bg-white text-text rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300">
            <FaChalkboardTeacher className="text-primary text-4xl mx-auto mb-4" />
            <h3 className="text-2xl font-bold">Total Tutors</h3>
            <p className="text-4xl font-bold text-primary mt-2">500+</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
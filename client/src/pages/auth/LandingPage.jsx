import React from 'react'
import Navbar from '../../components/home/Navbar'
import HeroSection from '../../components/home/HeroSection'
import TopTutors from '../../components/home/TopTutors'
import TopCourses from '../../components/home/TopCourses'
import Footer from '../../components/home/Footer'
import ChatBot from '../../components/home/ChatBot'


const LandingPage = () => {
  return (
    <> 
      <Navbar/>
      <div id="home">
        <HeroSection/>
      </div>
      <div id="courses-section">
        <TopCourses/>
      </div>
      <div id="tutors-section">
        <TopTutors/>
      </div>
      <Footer/>
      <ChatBot/>
    </>
  )
}

export default LandingPage
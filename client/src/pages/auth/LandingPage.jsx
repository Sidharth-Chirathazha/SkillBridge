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
      <HeroSection/>
      <TopCourses/>
      <TopTutors/>
      <Footer/>
      <ChatBot/>
    </>
  )
}

export default LandingPage
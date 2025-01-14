import React from 'react'
import Navbar from '../../components/home/Navbar'
import HeroSection from '../../components/home/HeroSection'
import TopCategories from '../../components/home/TopCategories'
import TopTutors from '../../components/home/TopTutors'
import TopCourses from '../../components/home/TopCourses'
import Footer from '../../components/home/Footer'


const LandingPage = () => {
  return (
    <> 
      <Navbar/>
      <HeroSection/>
      <TopCategories/>
      <TopCourses/>
      <TopTutors/>
      <Footer/>
    </>
  )
}

export default LandingPage
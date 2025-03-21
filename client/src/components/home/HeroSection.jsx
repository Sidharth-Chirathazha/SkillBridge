import React, { useEffect, useState } from 'react';
import hero_img_3 from '../../assets/images/hero_img_3.png'
import { FaBook, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import axiosInstance from '../../api/axios.Config';
import { useNavigate } from 'react-router-dom';


const HeroSection = () => {

  const [heroSectionData, setHeroSectionData] = useState({});
  const navigate = useNavigate();

  console.log("Hero section data:", heroSectionData);
  

  useEffect(()=>{
    const fetchHeroSectionData = async () =>{

      // setIsLoading(true);
      try{
        const response = await axiosInstance.get('/admin/global-summary/');
        setHeroSectionData(response.data);
      }catch (error){
        console.error("Error fetching herosection data:", error);
      }
    };
    fetchHeroSectionData();
  }, []);


  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-secondary-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-primary-300 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto flex flex-col lg:flex-row items-center py-20 px-12 relative z-10">
        {/* Left Column */}
        <div className="flex-1 max-w-2xl mb-10 lg:mb-0">
          <div className="inline-block px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            Learn. Excel. Succeed.
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Elevate Your <span className="text-secondary">Skills</span> With Expert-Led Courses
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-lg">
            Join thousands of students and professionals enhancing their careers through our tailored learning paths and industry-leading instructors.
          </p>
          <button className="group flex items-center gap-2 px-8 py-3.5 bg-secondary hover:bg-secondary-600 rounded-full text-lg font-medium transition-all duration-300 hover:shadow-lg"
            onClick={() => navigate('/login')}
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Right Column */}
        <div className="flex-1 lg:pl-10">
          <div className="relative">
            {/* <div className="absolute -top-4 -left-4 w-full h-full bg-secondary rounded-2xl"></div> */}
            <img 
              src={hero_img_3} 
              alt="Students learning" 
              className="relative rounded-2xl shadow-xl object-cover w-[500px] h-[500px] z-10" 
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto py-10 px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Courses */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform duration-300 border border-white/20">
            <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <FaBook className="text-secondary text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-2">Total Courses</h3>
            <p className="text-4xl font-bold text-secondary mt-2">{heroSectionData?.total_courses}+</p>
          </div>

          {/* Total Students */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform duration-300 border border-white/20">
            <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <FaUserGraduate className="text-secondary text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-2">Total Students</h3>
            <p className="text-4xl font-bold text-secondary mt-2">{heroSectionData?.total_students}+</p>
          </div>

          {/* Total Tutors */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform duration-300 border border-white/20">
            <div className="bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <FaChalkboardTeacher className="text-secondary text-2xl" />
            </div>
            <h3 className="text-xl font-bold mb-2">Total Tutors</h3>
            <p className="text-4xl font-bold text-secondary mt-2">{heroSectionData?.total_tutors}+</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
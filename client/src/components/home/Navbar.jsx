import React from "react"
import { useNavigate } from "react-router-dom"
import { FaGraduationCap } from "react-icons/fa6";



const Navbar = () => {
  
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-10 bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer group ">
            {/* Logo Icon */}
            <FaGraduationCap className="text-primary text-2xl group-hover:text-secondary transition-all duration-700" />
            {/* Logo Text */}
            <div className="text-primary text-xl font-bold group-hover:text-secondary transition-all duration-700">
              SkillBridge
            </div>
          </div>


        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-6 text-text-500">
          <li><a href="#home" className="hover:text-secondary hover:underline hover:underline-offset-8 decoration-slice transition-all duration-200">Home</a></li>
          <li><a href="#about" className="hover:text-secondary hover:underline hover:underline-offset-8 decoration-slice transition-all duration-200">About Us</a></li>
          <li><a href="#categories" className="hover:text-secondary hover:underline hover:underline-offset-8 decoration-slice transition-all duration-200">Categories</a></li>
        </ul>

        {/* Auth Buttons */}
        <div className="hidden md:flex space-x-4">
          <button onClick={()=>navigate('/login')} className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300">Login</button>
          <button onClick={()=>navigate('/register')} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-all duration-300">Register</button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button>☰</button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
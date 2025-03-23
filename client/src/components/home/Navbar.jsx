import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa6";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({behavior:'smooth'});
    }
    if(isMenuOpen){
      setIsMenuOpen(false);
    } 
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg backdrop-blur-md bg-white/95">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer group">
          <div className="bg-primary rounded-lg p-1.5 group-hover:bg-secondary transition-all duration-500">
            <FaGraduationCap className="text-white text-xl" />
          </div>
          <div className="text-primary text-xl font-bold group-hover:text-secondary transition-all duration-500">
            SkillBridge
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-8 text-text-500">
          <li>
            <a
              href="#home"
              className="relative py-2 hover:text-secondary transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#courses"
              className="relative py-2 hover:text-secondary transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('courses-section');
              }}
            >
              Courses
            </a>
          </li>
          <li>
            <a
              href="#tutors"
              className="relative py-2 hover:text-secondary transition-all duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:after:w-full"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('tutors-section');
              }}
            >
              Tutors
            </a>
          </li>
        </ul>

        {/* Auth Buttons */}
        <div className="hidden md:flex space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-primary border-2 border-primary rounded-full font-medium hover:bg-primary hover:text-white transition-all duration-300"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-secondary text-white rounded-full font-medium hover:brightness-110 hover:shadow-md transition-all duration-300"
          >
            Register
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-primary p-2 focus:outline-none"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white absolute w-full left-0 shadow-lg transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 py-4' : 'max-h-0 overflow-hidden'
        }`}
      >
        <ul className="flex flex-col space-y-4 px-6 pb-6">
          <li>
            <a href="#home" className="block py-2 text-text-500 hover:text-secondary">
              Home
            </a>
          </li>
          <li>
            <a href="#courses" className="block py-2 text-text-500 hover:text-secondary"
             onClick={(e) => {
              e.preventDefault();
              scrollToSection('courses-section');
            }}
            >
              Courses
            </a>
          </li>
          <li>
            <a href="#tutors" className="block py-2 text-text-500 hover:text-secondary"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('tutors-section');
            }}
            >
              Tutors
            </a>
          </li>
          <li className="pt-4 flex flex-col space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 text-primary border border-primary rounded-full hover:bg-primary hover:text-white transition-all duration-300"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full px-4 py-2 bg-secondary text-white rounded-full hover:brightness-110 transition-all duration-300"
            >
              Register
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
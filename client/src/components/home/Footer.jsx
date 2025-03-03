import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { FaGraduationCap } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary-600 text-white">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12">
          {/* Company Info */}
          <div className="space-y-5">
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="bg-secondary/20 rounded-lg p-2">
                <FaGraduationCap className="text-secondary text-2xl" />
              </div>
              <div className="text-white text-xl font-bold">
                SkillBridge
              </div>
            </div>
            <p className="text-primary-100 text-sm">
              Empowering minds through quality education. Join our community of learners and expert instructors to reach your full potential.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-primary-100 hover:text-secondary transition-colors p-2 bg-primary-500 rounded-full">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-primary-100 hover:text-secondary transition-colors p-2 bg-primary-500 rounded-full">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-primary-100 hover:text-secondary transition-colors p-2 bg-primary-500 rounded-full">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-primary-100 hover:text-secondary transition-colors p-2 bg-primary-500 rounded-full">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 relative after:absolute after:w-12 after:h-1 after:bg-secondary after:left-0 after:-bottom-2">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-primary-100 hover:text-secondary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-secondary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                  Our Courses
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-secondary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                  Become an Instructor
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-secondary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-secondary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-secondary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 relative after:absolute after:w-12 after:h-1 after:bg-secondary after:left-0 after:-bottom-2">
              Contact Info
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-primary-100 group">
                <div className="p-2 bg-primary-500 rounded-full group-hover:bg-secondary transition-colors duration-300">
                  <Mail size={16} />
                </div>
                <span className="group-hover:text-white transition-colors duration-300">support@skillbridge.com</span>
              </li>
              <li className="flex items-center gap-3 text-primary-100 group">
                <div className="p-2 bg-primary-500 rounded-full group-hover:bg-secondary transition-colors duration-300">
                  <Phone size={16} />
                </div>
                <span className="group-hover:text-white transition-colors duration-300">+1 234 567 890</span>
              </li>
              <li className="flex items-start gap-3 text-primary-100 group">
                <div className="p-2 bg-primary-500 rounded-full group-hover:bg-secondary transition-colors duration-300 mt-1">
                  <MapPin size={16} />
                </div>
                <span className="group-hover:text-white transition-colors duration-300">
                  123 Education Street, Learning City, ED 12345
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="py-6 border-t border-primary-500 text-center text-primary-200 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© {currentYear} SkillBridge. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-secondary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-secondary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
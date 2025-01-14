import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { FaGraduationCap } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 cursor-pointer group ">
                        {/* Logo Icon */}
                        <FaGraduationCap className="text-white text-2xl group-hover:text-secondary-400 transition-all duration-700" />
                        {/* Logo Text */}
                        <div className="text-white text-xl font-bold group-hover:text-secondary-400 transition-all duration-700">
                          SkillBridge
                        </div>
                      </div>
            <p className="text-primary-100 text-sm">
              Empowering minds through quality education. Join our community of learners and expert instructors.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-primary-100 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-primary-100 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-primary-100 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-primary-100 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-primary-100 hover:text-white transition-colors text-sm">About Us</a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-white transition-colors text-sm">Our Courses</a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-white transition-colors text-sm">Become an Instructor</a>
              </li>
              <li>
                <a href="#" className="text-primary-100 hover:text-white transition-colors text-sm">Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-100 text-sm">
                <Mail size={16} />
                <span>support@edulearn.com</span>
              </li>
              <li className="flex items-center gap-2 text-primary-100 text-sm">
                <Phone size={16} />
                <span>+1 234 567 890</span>
              </li>
              <li className="flex items-start gap-2 text-primary-100 text-sm">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>123 Education Street, Learning City, ED 12345</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-primary-100 text-sm mb-4">
              Subscribe to our newsletter for updates and special offers.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-primary-600 text-white placeholder-primary-300 border border-primary-400 focus:outline-none focus:border-secondary"
              />
              <button className="w-full px-4 py-2 bg-secondary hover:bg-secondary-600 transition-colors rounded-lg text-white">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-600 py-6 text-center text-primary-100 text-sm">
          <p>© {new Date().getFullYear()} EduLearn. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
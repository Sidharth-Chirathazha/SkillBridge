import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-text">
      <div className="w-full max-w-md md:max-w-2xl text-center">
        {/* 404 Error Display */}
        <h1 className="text-primary-500 text-9xl md:text-[12rem] font-bold tracking-tight leading-none">
          404
        </h1>
        
        {/* Error Message */}
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-text-500">
          Page Not Found
        </h2>
        
        {/* Description */}
        <p className="mt-4 text-lg md:text-xl text-text-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Decorative Element */}
        <div className="mt-8 mb-8 flex justify-center">
          <div className="w-16 h-1 bg-secondary-500 rounded"></div>
        </div>
        
        {/* Back to Home Button */}
        <Link to="/" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary-500 rounded-md shadow-md hover:bg-primary-600 transition-colors duration-300 ease-in-out">
          Back to Home
        </Link>
        
        {/* Alternative Links */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-text-400">
          <a href="/contact" className="hover:text-secondary-500 transition-colors duration-200">
            Contact Support
          </a>
          <span className="hidden md:inline">•</span>
          <a href="/sitemap" className="hover:text-secondary-500 transition-colors duration-200">
            Sitemap
          </a>
          <span className="hidden md:inline">•</span>
          <a href="/help" className="hover:text-secondary-500 transition-colors duration-200">
            Help Center
          </a>
        </div>
      </div>
      
      {/* Decorative Patterns */}
      <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-300"></div>
      <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-secondary-500 via-primary-500 to-secondary-300"></div>
    </div>
  );
};

export default NotFound;
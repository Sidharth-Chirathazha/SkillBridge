import React from 'react';
import {Star, Users, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import the TutorCard component
const TutorCard = ({ tutor, isPublicView }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (isPublicView) {
      navigate('/login'); // Redirect to login page in public view
    } else {
      navigate(`/student/tutors/${tutor.id}`); // Navigate to tutor profile in student view
    }
  };

  return (
    <div
      className="bg-background-50 rounded-xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 overflow-hidden group h-full border border-background-300 cursor-pointer p-6">
      {/* Profile Picture Section */}
      <div className="flex justify-center mb-4">
        <div className="w-24 h-24 rounded-full border-4 border-primary-100 bg-background-50 overflow-hidden shadow-md">
          <img
            src={tutor.profile_pic_url || "/api/placeholder/100/100"}
            alt={`${tutor.full_name || `${tutor.first_name} ${tutor.last_name}`} avatar`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Tutor Information */}
      <div className="text-center">
        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300 text-text">
          {tutor.full_name || `${tutor.first_name} ${tutor.last_name}`}
        </h3>
        
        <p className="text-secondary text-sm font-medium mb-3">
          {tutor.cur_job_role || 'Professional Educator'}
        </p>

        <p className="text-text-400 text-sm mb-4">
          {tutor.city}, {tutor.country}
        </p>
        
          <>
            {/* Rating badges for public view */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-1 bg-secondary-50 px-3 py-1 rounded-full text-xs text-secondary">
                <Star className="w-3 h-3 fill-secondary" />
                <span>{tutor.rating || "4.8"}</span>
              </div>
              <div className="flex items-center gap-1 bg-primary-50 px-3 py-1 rounded-full text-xs text-primary">
                <Users className="w-3 h-3" />
                <span>{tutor.total_students || "0"} students</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4 text-text-400 text-sm">
              <div className="flex items-center justify-center gap-1 bg-background-200 py-2 rounded-lg">
                <BookOpen className="w-4 h-4" />
                <span>{tutor.total_courses || "0"} Courses</span>
              </div>
              <div className="flex items-center justify-center gap-1 bg-background-200 py-2 rounded-lg">
                <MessageCircle className="w-4 h-4" />
                <span>{tutor.total_reviews || "0"} Reviews</span>
              </div>
            </div>
            
            <button className="w-full flex items-center justify-center gap-1 py-2.5 bg-background-50 border border-primary text-primary rounded-full hover:bg-primary hover:text-background-50 transition-all duration-300 text-sm font-medium"
              onClick={handleProfileClick}
            >
              View Profile
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
      </div>
    </div>
  );
};


export default TutorCard;
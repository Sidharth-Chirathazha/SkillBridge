import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TutorCard = ({ tutor }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/student/tutors/${tutor.id}`);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 overflow-hidden cursor-pointer p-6"
      onClick={handleCardClick}
    >
      {/* Profile Picture Section */}
      <div className="flex justify-center mb-4">
        <img
          src={tutor.profile_pic_url || '/default-avatar.jpg'}
          alt={`${tutor.first_name} ${tutor.last_name}`}
          className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
        />
      </div>

      {/* Tutor Information */}
      <div className="text-center">
        <h3 className="font-bold text-text-900 text-xl mb-1">
          {tutor.first_name} {tutor.last_name}
        </h3>
        
        <p className="text-primary-500 font-medium mb-2">
          {tutor.cur_job_role || 'Professional Educator'}
        </p>

        <p className="text-text-400 text-sm mb-4">
          {tutor.city}, {tutor.country}
        </p>

        {/* Rating */}
        <div className="flex items-center justify-center bg-gray-50 rounded-lg py-2 px-4 mx-auto w-fit">
          <Star size={18} className="text-yellow-500 mr-1" />
          <span className="text-sm font-medium text-text-500">{tutor.rating || '4.5'}</span>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
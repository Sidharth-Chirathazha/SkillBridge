import { Star, ShoppingCart, Clock, User, Heart, BookOpen, PlayCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';

const CourseCard = ({ course, onLike, onBuy, isPurchased = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!isPurchased) {
      navigate(`/student/courses/${course.id}`);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100 overflow-hidden ${
        !isPurchased ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Thumbnail Section */}
      <div className="relative">
        <img
          src={course.thumbnail || '/default-thumbnail.jpg'}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        {!isPurchased && (
          <>
            <div className="absolute top-2 left-2 bg-primary-400 text-white px-3 py-1 rounded-full text-xs font-medium">
              {course.skill_level}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(course.id);
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-gray-100 transition-colors"
            >
              <Heart
                size={20}
                className={course.isLiked ? 'text-secondary-500 fill-secondary-500' : 'text-text-600'}
              />
            </button>
          </>
        )}
      </div>

      {/* Course Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title and Tutor */}
        <h3 className="font-bold text-text-900 text-lg mb-2 truncate">{course.title}</h3>

        <div className="flex items-center mb-4">
          <img
            src={course.tutor?.profile_pic || '/default-avatar.jpg'}
            alt={course.tutor?.first_name}
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          />
          <span className="ml-2 text-sm text-text-400 truncate">
            {course.tutor?.first_name && course.tutor?.last_name
              ? `${course.tutor.first_name} ${course.tutor.last_name}`
              : 'Unknown Tutor'}
          </span>
        </div>

        {/* Conditionally render based on isPurchased */}
        {isPurchased ? (
          <>
            {/* Progress Bar */}
            <div className="mb-4">
              <ProgressBar progress={course.progress || 0} />
            </div>

            {/* Go to Course Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/student/learning/${course.id}`);
              }}
              className="w-full flex items-center justify-center bg-primary-500 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <PlayCircle size={18} className="mr-2" />
              <span className="text-sm">Go to Course</span>
            </button>
          </>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
                <Star size={16} className="text-yellow-500 mr-1" />
                <span className="text-sm font-medium text-text-500">{course.rating || '4.5'}</span>
              </div>
              <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
                <Clock size={16} className="text-text-500 mr-1" />
                <span className="text-sm">{course.total_duration || '0'}min</span>
              </div>
              <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
                <BookOpen size={16} className="text-text-500 mr-1" />
                <span className="text-sm">{course.total_modules || '0'}</span>
              </div>
            </div>

            {/* Price and Action */}
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-baseline">
                <span className="text-lg font-bold text-secondary-500">₹{course.price || '0'}</span>
                {course.originalPrice && (
                  <span className="ml-2 text-sm text-gray-400 line-through">
                    ₹{course.originalPrice}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBuy(course.id);
                }}
                className="flex items-center bg-primary-500 hover:bg-primary-700 text-white px-3 py-2 rounded-md transition-colors"
              >
                <ShoppingCart size={18} className="mr-2" />
                <span className="text-sm">Enroll Now</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
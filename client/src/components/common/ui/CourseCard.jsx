import { Star, LayoutGrid, Clock, User, Heart, BookOpen, PlayCircle, Repeat, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { useEffect, useState } from 'react';
import TradeModal from '../../tutor/TradeModal';

const CourseCard = ({ 
  course, 
  onLike, 
  onBuy, 
  onTrade, 
  isPurchased = false, 
  role,
  isPublicView = false
}) => {
  const navigate = useNavigate();
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  
  const handleCardClick = () => {
    if (isPublicView) {
      navigate('/login');
    } else if (!isPurchased) {
      navigate(`/${role}/courses/${course.id}`);
    }
  };

  const handleEnrollClick = (e) => {
    e.stopPropagation();
    if (isPublicView) {
      navigate('/login');
    } else {
      onBuy(course.id);
    }
  };

  const openTradeModal = (e) => {
    e.stopPropagation();
    setIsTradeModalOpen(true);
  };

  const closeTradeModal = () => {
    setIsTradeModalOpen(false);
  };

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col group ${
        !isPurchased || isPublicView ? 'cursor-pointer' : ''
      }`}
      onClick={handleCardClick}
    >
      {/* Thumbnail Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <img
          src={course.thumbnail || "/api/placeholder/400/250"}
          alt={course.title}
          className="w-full aspect-video object-cover"
        />
        {!isPurchased && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isPublicView) onLike(course.id);
                else navigate('/login');
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white transition-colors z-20"
            >
              <Heart 
                className={`w-4 h-4 ${course.isLiked ? 'text-secondary fill-secondary' : 'text-gray-600 hover:text-secondary'} transition-colors`} 
              />
            </button>
            <div className="absolute top-4 left-4 px-3 py-1 bg-secondary/90 text-white text-xs font-medium rounded-full z-20">
              {course.skill_level}
            </div>
          </>
        )}
        <div className="absolute -bottom-4 left-4 z-20">
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-primary">
            <img
              src={course.tutor?.profile_pic || "/api/placeholder/400/250"}
              alt="Tutor"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-5 pt-8 flex-1 flex flex-col">
        {/* Category */}
        <div className="flex items-center gap-2 text-secondary text-sm font-medium mb-2">
          <LayoutGrid className="w-4 h-4" />
          <span>{course.category_details?.name || "Uncategorized"}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-3 text-text line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

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
                navigate(`/${role}/learning/${course.id}`);
              }}
              className="w-full flex items-center justify-center bg-primary text-white px-4 py-2 rounded-full transition-colors hover:bg-secondary"
            >
              <PlayCircle size={18} className="mr-2" />
              <span className="text-sm">Go to Course</span>
            </button>
          </>
        ) : (
          <>
            {/* Metrics */}
            <div className="flex items-center gap-4 text-sm text-text-400 mb-4">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.total_purchases || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.total_duration || 0}min</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{course.total_modules || 0}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= (course.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-medium ml-1">{course.rating || 0}</span>
              <span className="text-xs text-text-400 ml-1">({course.total_reviews || 0})</span>
            </div>

            {/* Price and Action */}
            <div className={`flex mt-auto pt-4 border-t border-gray-100 ${role === 'tutor' && !isPublicView ? 'flex-col' : 'items-center justify-between'}`}>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-secondary">
                  ₹{course.price || 0}
                </span>
                {course.originalPrice && (
                  <span className="text-sm text-text-400 line-through">
                    ₹{course.originalPrice}
                  </span>
                )}
              </div>

              {course.is_under_trade ? (
                // "Under Trade" button
                <button
                  disabled
                  className="px-4 py-1.5 bg-gray-400 text-white text-sm rounded-full cursor-not-allowed mt-3"
                >
                  Under Trade
                </button>
              ) : (
                <div className={`flex ${role === 'tutor' && !isPublicView ? 'flex-col w-full gap-2 mt-3' : 'items-center gap-2'}`}>
                  {/* Enroll Button */}
                  <button
                    onClick={handleEnrollClick}
                    className={`px-4 py-1.5 bg-primary text-white text-sm rounded-full hover:bg-primary-600 transition-colors ${
                      role === 'tutor' && !isPublicView ? 'w-full' : ''
                    }`}
                  >
                    {role === 'tutor' && !isPublicView ? 'Enroll' : 'Enroll Now'}
                  </button>

                  {/* Trade Button (Only for Tutors and not public view) */}
                  {role === 'tutor' && !isPublicView && (
                    <button
                      onClick={openTradeModal}
                      className="w-full py-1.5 bg-secondary text-white text-sm rounded-full hover:bg-secondary-600 transition-colors flex items-center justify-center"
                    >
                      <Repeat size={14} className="mr-1" />
                      <span>Trade</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Trade Modal (only render if not public view) */}
      {!isPublicView && role === 'tutor' && (
        <TradeModal
          isOpen={isTradeModalOpen}
          closeModal={closeTradeModal}
          requestedCourseData={course}
        />
      )}
    </div>
  );
};

export default CourseCard;
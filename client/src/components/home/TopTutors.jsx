import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminTutors } from '../../redux/slices/adminSlice';
import { toast } from 'react-hot-toast'; // Assuming you're using react-hot-toast for notifications
import TutorCard from '../tutor/TutorCard'
import { useNavigate } from 'react-router-dom';

const TopTutors = ({ isPublicView = true }) => {
  const dispatch = useDispatch();
  const { adminTutorsData } = useSelector((state) => state.admin);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleCards, setVisibleCards] = useState(4);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle responsiveness
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(4);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch tutors data
    const fetchData = async () => {
      try {
        await dispatch(fetchAdminTutors({
          page: 1,
          pageSize: 10,
          activeStatus: true,
          verifiedStatus: true
        })).unwrap();
      } catch (error) {
        toast.error("Failed to fetch Tutors");
        console.error('Failed to fetch tutors:', error);
      }
    };
    
    fetchData();
  }, [dispatch]);

  // Use the tutors data without fallback
  const tutors = adminTutorsData?.length ? 
    adminTutorsData.slice(0, Math.min(adminTutorsData.length, 8)) : [];

  // Fix for mobile navigation - calculate max index to prevent jumping
  const maxIndex = Math.max(0, tutors.length - visibleCards);

  const nextSlide = () => {
    if (isAnimating || tutors.length <= visibleCards) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating || tutors.length <= visibleCards) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? maxIndex : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index) => {
    if (isAnimating || index > maxIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // If no tutors are available, return null or a placeholder
  if (!tutors.length) {
    return (
      <section id="tutors" className="py-20 bg-background-100">
        <div className="container mx-auto px-6 text-center">
          <p>Loading tutors...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="tutors" className="py-20 bg-background-100 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-block px-4 py-1 bg-primary-50 rounded-full text-primary font-medium mb-4 text-sm">
            Expert Educators
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text">Meet Our Top Instructors</h2>
          <p className="text-lg text-text-400">
            Learn from industry experts with years of real-world experience
          </p>
        </div>
  
        <div className="relative">
          {/* Only show navigation if there are more tutors than visible cards */}
          {tutors.length > visibleCards && (
            <>
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 z-10">
                <button 
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full bg-background-50 shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-background-50 transition-all duration-300"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                <button 
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full bg-background-50 shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-background-50 transition-all duration-300"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
  
          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / tutors.length)}%)`,
                width: tutors.length <= visibleCards 
                  ? '100%' 
                  : `${(tutors.length / visibleCards) * 100}%`
              }}
            >
              {tutors.map((tutor, index) => (
                <div 
                  key={tutor.id || index} 
                  className="px-3"
                  style={{ 
                    width: `${100 / (tutors.length <= visibleCards ? tutors.length : tutors.length)}%` 
                  }}
                >
                  <TutorCard tutor={tutor} isPublicView={isPublicView} />
                </div>
              ))}
            </div>
          </div>
  
          {/* Carousel Indicators - only show if needed */}
          {tutors.length > visibleCards && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.min(tutors.length, maxIndex + 1) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index ? 'w-6 bg-primary' : 'bg-background-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        
        {isPublicView && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-primary text-background-50 rounded-full font-medium hover:bg-primary-600 transition-all duration-300"
            onClick={() => navigate('/register')}
            >
              Become an Instructor
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopTutors;
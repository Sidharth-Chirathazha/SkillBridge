import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, fetchCategories } from '../../redux/slices/courseSlice';
import CourseCard from '../common/ui/CourseCard';
import { useNavigate } from 'react-router-dom';

const Courses = () => {
  const [activeCategory, setActiveCategory] = useState({ id: null, name: 'All' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { coursesData, currentPage, totalPages, isCourseLoading, categoriesData } = useSelector((state) => state.course);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchCourses({ page: 1, pageSize: 10, status: 'Approved', categoryId: null, limit: 8 })).unwrap();
        await dispatch(fetchCategories({categoryPage:1, pageSize:100})).unwrap();
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  // Function to handle category change
  const handleCategoryChange = async (category) => {
    setActiveCategory(category);
    try {
      await dispatch(fetchCourses({ page: 1, pageSize: 10, status: 'Approved', categoryId: category.id || null, limit: 8 })).unwrap();
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };
  
  // Categories array
  const categories = [{ id: null, name: 'All' }, ...(categoriesData || [])];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-block px-4 py-1 bg-secondary/10 rounded-full text-secondary text-sm font-medium mb-4">
            Trending Courses
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">Discover Popular Courses</h2>
          <p className="text-lg text-text-400">
            Expand your knowledge and advance your career with our expert-crafted courses
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide justify-center">
          {categories.map((category) => (
            <button
              key={category.id ?? 'all'}
              onClick={() => handleCategoryChange(category)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full transition-all duration-300 ${
                activeCategory.id === category.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-background-300 text-text-400 hover:bg-background-400'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {coursesData?.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course}
              isPublicView={true} // This tells the component it's being used in public view
              role="student" // Default role for public view
              onLike={() => {}} // Empty function as we'll redirect to login anyway
              onBuy={() => {}} // Empty function as we'll redirect to login anyway
              onTrade={() => {}} // Empty function as we'll redirect to login anyway
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/courses')}
            className="px-8 py-3 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary hover:text-white transition-all duration-300"
          >
            View All Courses
          </button>
        </div>
      </div>
    </section>
  );
};

export default Courses;
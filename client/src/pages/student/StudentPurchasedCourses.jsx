import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { fetchPurchasedCourses } from '../../redux/slices/courseSlice';
import UserLayout from '../../components/common/UserLayout';
import Pagination from '../../components/common/ui/Pagination';
import CourseCard from '../../components/common/ui/CourseCard';
import { Loader } from 'lucide-react';



const StudentPurchasedCourses = () => {
  
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { coursesData, currentPage, totalPages, isCourseLoading, isCourseError, } = useSelector((state) => state.course);

  useEffect(()=>{
    dispatch(fetchPurchasedCourses({ page, pageSize}))
  }, [dispatch, page])

  return (
    <UserLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                   Continue Learning
                </h1>
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                   Dive back into your courses and continue learning.
                </p>
            </div>
            {isCourseLoading? (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin h-10 w-10 text-primary" />
            </div>
            ) : isCourseError ? (
                <div>Error occured</div>
            ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {coursesData?.map((course) => (
                <CourseCard 
                    key={course.id} 
                    course={course}
                    isPurchased={true}
                    onLike={() => handleLike(course.id)}
                />
                ))}
            </div>
            <div className='w-full mt-10'>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
            />
            </div>
            </>
            )}
        </div>
    </UserLayout>
    )
}

export default StudentPurchasedCourses
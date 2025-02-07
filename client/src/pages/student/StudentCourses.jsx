import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CourseCard from '../../components/common/ui/CourseCard';
import Pagination from '../../components/common/ui/Pagination';
import { fetchCourses, initiateCheckout, resetCheckout } from '../../redux/slices/courseSlice';
import { Loader } from 'lucide-react';
import UserLayout from '../../components/common/UserLayout';
import {loadStripe} from '@stripe/stripe-js'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const stripePromise = loadStripe('pk_test_51Qp6mdRZhgmNkKQoW8Hp4xmJjjpuuC9iwjD0s1utEDyqLsByg7yXK81XadWBK751vQE8nbAMV5RmL11nw25aQrFh00zV21sORj')

const StudentCourses = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const navigate = useNavigate();
  
  const { coursesData, currentPage, totalPages, 
    isCourseLoading, isCourseError, isCheckoutLoading, checkoutError, checkoutSession } = useSelector(
    (state) => state.course
  );


  useEffect(() => {
    dispatch(fetchCourses({ page, pageSize, status :'Approved', user:true }));
  }, [dispatch, page]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      dispatch(resetCheckout());
    };
  }, [dispatch]);

  useEffect(()=>{
    const redirectToCheckout = async()=>{
      if(checkoutSession?.sessionId){
        const stripe = await stripePromise;
        const {error} = await stripe.redirectToCheckout({
          sessionId: checkoutSession.sessionId
        });
        if(error){
          console.error('Stripe redirect error:', error);
        }
      }
    };
    redirectToCheckout();
  }, [checkoutSession])

  const handleLike = (courseId) => {
    // Handle like logic
  };

  const handleBuy = async (courseId) => {
    try{
      await dispatch(initiateCheckout(courseId));
    }catch(error){
      toast.error("Unexpected error occured")
    }
  };

  console.log(coursesData);
  
  return (
    <UserLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Discover Your Next Learning Adventure
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Browse through diverse courses and enhance your skills today!
          </p>
        </div>

        
        {isCourseLoading || isCheckoutLoading ? (
            <div className="flex justify-center items-center h-screen">
            <Loader className="animate-spin h-10 w-10 text-primary" />
                </div>
        ) : isCourseError ? (
            <div>Error occured</div>
        ) : checkoutError?(
              <div className="text-red-500 mb-4">
              Error: {checkoutError}
              </div>
        ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {coursesData?.map((course) => (
                <CourseCard 
                    key={course.id} 
                    course={course}
                    onLike={() => handleLike(course.id)}
                    onBuy={() => handleBuy(course.id)}
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
  );
};

export default StudentCourses;
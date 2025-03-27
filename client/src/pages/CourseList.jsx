import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CourseCard from '../components/common/ui/CourseCard';
import Pagination from '../components/common/ui/Pagination';
import { fetchCourses, initiateCheckout, resetCheckout, fetchTutorCourses, fetchCategories } from '../redux/slices/courseSlice';
import {loadStripe} from '@stripe/stripe-js'
import toast from 'react-hot-toast';
import TutorVerificationMessage from '../components/tutor/TutorVerificationMessage';
import SearchBar from '../components/common/ui/SearchBar';
import DropdownMenu from '../components/common/ui/DropdownMenu';



const CourseList = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const pageSize = 8;
  const [stripe, setStripe] = useState(null);
  
  const { coursesData, currentPage, totalPages, 
    isCourseLoading, isCourseError, isCheckoutLoading, checkoutError, checkoutSession, categoriesData } = useSelector(
    (state) => state.course
  );

  const {role, userData} = useSelector((state)=>state.auth)

  const tutorId = userData?.id || null;

   // Stripe Initialization
   useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        console.log('Stripe Initialized:', !!stripeInstance);
        setStripe(stripeInstance);
      } catch (error) {
        console.error('Stripe Initialization Error:', error);
        toast.error('Payment system could not be loaded');
      }
    };

    initializeStripe();
  }, []);

  


  useEffect(() => {
    if (!tutorId) return;

    const fetchData = async()=>{
      try{
        await dispatch(fetchTutorCourses({ tutorId, statues:"Approved" }));
        
      }catch(error){
       console.error("Failed to fetch Courses");
       
      }
    }
    fetchData();

  }, [dispatch,tutorId]);

  useEffect(() => {
    dispatch(fetchCategories({categoryPage:1, pageSize:100}));
    
  }, [dispatch]);


  useEffect(() => {
    const fetchData = async () => {
        try {
          await dispatch(fetchCourses({ page, pageSize, status :'Approved', user:true, search:searchQuery, categoryId:selectedCategory })).unwrap();
        } catch (error) {
          console.error('Failed to fetch Course:', error);
        } 
    };
    fetchData();
    
  }, [dispatch, page, searchQuery, selectedCategory]);

  

  useEffect(() => {
    // Clear any existing checkout session when component mounts
    dispatch(resetCheckout());
  }, [dispatch]);

  // Checkout Redirect Effect
  useEffect(() => {
    const handleCheckoutRedirect = async () => {
      console.log('Checkout Debug:', {
        session: checkoutSession,
        stripeReady: !!stripe
      });

      if (!checkoutSession || !stripe) return;

      try {
        const { error } = await stripe.redirectToCheckout({
          sessionId: checkoutSession
        });

        if (error) {
          console.error('Checkout Redirect Error:', error);
          toast.error(error.message || 'Payment redirection failed');
        }
      } catch (error) {
        console.error('Checkout Process Exception:', error);
        toast.error('Payment processing encountered an error');
      } finally {
        dispatch(resetCheckout());
      }
    };

    handleCheckoutRedirect();
  }, [checkoutSession, stripe, dispatch]);



  const handleSearch = (query) => {
    // setPage(1);
    setSearchQuery(query);
  };

  const handleCategoryChange = (categoryId) => {
    setPage(1);
    setSelectedCategory(categoryId);
  };

  const handleBuy = async (courseId) => {
    
    try {
      const result = await dispatch(initiateCheckout(courseId)).unwrap();
      console.log('Checkout Initiation Result:', result);
    } catch (error) {
      console.error('Checkout Initiation Error:', {
        message: error.message,
        details: error
      });
      toast.error(error.message || 'Failed to start payment process');
    }
  };

  
  return (
    <>
    { role === "tutor" && userData?.is_verified === false ? (
        <TutorVerificationMessage/>
      ) :(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {role === "student"
                  ? "Discover Your Next Learning Adventure"
                  : "Expand Your Expertise with New Courses"}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                {role === "student"
                  ? "Browse through diverse courses and enhance your skills today!"
                  : "Find valuable courses to strengthen your knowledge and teaching skills!"}
              </p>
          </div>

        {isCourseLoading || isCheckoutLoading ? (
            <div className="flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        ) : checkoutError?(
              <div className="text-red-500 mb-4">
              Error: {checkoutError}
              </div>
        ) : (
            <>
            {/* Add Filters Section Here */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <SearchBar value={searchQuery} onChange={handleSearch} placeholder='Search courses...' />
              <DropdownMenu
                dropDownItems={categoriesData.map((cat) => ({value:cat.id, label:cat.name}))} 
                value={selectedCategory} 
                onChange={handleCategoryChange}
                defaultLabel={"All Categories"} 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {coursesData?.map((course) => (
                <CourseCard 
                    key={course.id} 
                    course={course}
                    onLike={() => handleLike(course.id)}
                    onBuy={() => handleBuy(course.id)}
                    role={role}
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
      )}
      </>
  );
};

export default CourseList;
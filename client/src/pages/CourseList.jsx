import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CourseCard from '../components/common/ui/CourseCard';
import Pagination from '../components/common/ui/Pagination';
import { fetchCourses, initiateCheckout, resetCheckout, fetchTutorCourses, fetchCategories } from '../redux/slices/courseSlice';
import { Loader } from 'lucide-react';
import {loadStripe} from '@stripe/stripe-js'
import toast from 'react-hot-toast';
import TutorVerificationMessage from '../components/tutor/TutorVerificationMessage';
import SearchBar from '../components/common/ui/SearchBar';
import DropdownMenu from '../components/common/ui/DropdownMenu';

const stripePromise = loadStripe('pk_test_51Qp6mdRZhgmNkKQoW8Hp4xmJjjpuuC9iwjD0s1utEDyqLsByg7yXK81XadWBK751vQE8nbAMV5RmL11nw25aQrFh00zV21sORj')


const CourseList = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const pageSize = 8;
  
  const { coursesData, currentPage, totalPages, 
    isCourseLoading, isCourseError, isCheckoutLoading, checkoutError, checkoutSession, categoriesData } = useSelector(
    (state) => state.course
  );

  const {role, userData} = useSelector((state)=>state.auth)

  const tutorId = userData?.id || null;


  useEffect(() => {
    if (!tutorId) return;
    console.log(tutorId);

    const fetchData = async()=>{
      try{
        await dispatch(fetchTutorCourses({ tutorId, statues:"Approved" }));
        console.log("Courses Fetched Successfully");
        
      }catch(error){
       console.log("Failed to fetch Courses");
       
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

  // console.log("All Course details in course list:", coursesData);
  // console.log("Categories data in course list:", categoriesData);
  

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

  const handleSearch = (query) => {
    // setPage(1);
    setSearchQuery(query);
  };

  const handleCategoryChange = (categoryId) => {
    setPage(1);
    setSelectedCategory(categoryId);
  };

  const handleBuy = async (courseId) => {
    console.log("Inside handle buy",courseId);
    
    try{
      await dispatch(initiateCheckout(courseId));
    }catch(error){
      toast.error("Unexpected error occured")
    }
  };

  
  return (
    <>
    { role === "tutor" && userData?.is_verified === false ? (
        <TutorVerificationMessage/>
      ) :(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div>
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
            <div className="flex justify-center items-center h-screen">
            <Loader className="animate-spin h-10 w-10 text-primary" />
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
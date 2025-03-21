import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ManagementCourseCard from '../../components/common/ui/ManagementCourseCard';
import Pagination from '../../components/common/ui/Pagination';
import { deleteCourse, fetchCategories, fetchTutorCourses } from '../../redux/slices/courseSlice';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import TutorVerificationMessage from '../../components/tutor/TutorVerificationMessage';
import SearchBar from '../../components/common/ui/SearchBar';
import DropdownMenu from '../../components/common/ui/DropdownMenu';


const TutorTeaching = () => {

  // const [isCoursesAvailable, setIsCoursesAvailable] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const pageSize = 8;
  
  const { tutorCoursesData, currentPage, totalPages, isCourseLoading, isCourseError, categoriesData } = useSelector(
    (state) => state.course
  );
  const {userData} = useSelector( (state)=> state.auth)

  const tutorId = userData?.id || null;

  useEffect(() => {
      dispatch(fetchCategories({categoryPage:1, pageSize:100}));
    }, [dispatch]);

  useEffect(() => {
    if (!tutorId) return;
    console.log(tutorId);

    const fetchData = async()=>{
      try{
        await dispatch(fetchTutorCourses({ tutorId, page, pageSize, status:null, search:searchQuery, categoryId:selectedCategory }));
        console.log("Courses Fetched Successfully");
        
      }catch(error){
       console.log("Failed to fetch Courses");
       
      }
    }
    fetchData();

  }, [dispatch, page, tutorId, searchQuery, selectedCategory, navigate]);

  const handleSearch = (query) => {
    setPage(1);
    setSearchQuery(query);
  };

  const handleCategoryChange = (categoryId) => {
    setPage(1);
    setSelectedCategory(categoryId);
  };

  const handleEdit = (courseId) => {
    navigate(`/tutor/teaching/edit/${courseId}`)
  };
  const handleDelete = async (courseId)=>{
    try{
      await(dispatch(deleteCourse(courseId)))
      dispatch(fetchTutorCourses({ tutorId, page, pageSize }));
      toast.success("Course deleted successfully!");
    }catch(error){
      toast.error("An error occured while deleting the course")
    }
  }

  return (
    <>
      {userData?.is_verified === false ?(
        <TutorVerificationMessage/>
      ):(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Explore Your Courses
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1 mb-2">
                Manage and update your courses. Track student engagement and grow your learning community.
              </p>
            </div>
          </div>
          
          {/* Similar loading/error handling as StudentCourses */}
          {isCourseError ? (
          <div className="flex justify-center items-center h-96">
            <h1 className='text-lg text-text-600'>You haven't added any courses yet.</h1>
          </div>
          ) : isCourseLoading? (
            <div className="flex justify-center items-center h-screen">
              <Loader className="animate-spin h-10 w-10 text-primary" />
            </div>
          ) : (
              <>

                  {/* Add Filters Section Here */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <SearchBar value={searchQuery} onChange={handleSearch} />
                    <DropdownMenu 
                      dropDownItems={categoriesData.map((cat) => ({value:cat.id, label:cat.name}))} 
                      value={selectedCategory} 
                      onChange={handleCategoryChange}
                      defaultLabel={"All Categories"} 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {tutorCoursesData?.map((course) => (
                      <ManagementCourseCard
                        key={course.id}
                        course={course}
                        variant='tutor'
                        onEdit={ handleEdit}
                        onDelete={handleDelete}
                      />
                      ))}
                  </div>
                  <div className='w-auto mt-10'>
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

export default TutorTeaching;
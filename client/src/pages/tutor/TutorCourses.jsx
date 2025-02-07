import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ManagementCourseCard from '../../components/common/ui/ManagementCourseCard';
import Pagination from '../../components/common/ui/Pagination';
import { deleteCourse, fetchTutorCourses } from '../../redux/slices/courseSlice';
import UserLayout from '../../components/common/UserLayout';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import TutorVerificationMessage from '../../components/tutor/TutorVerificationMessage';


const TutorCourses = () => {

  // const [isCoursesAvailable, setIsCoursesAvailable] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 8;
  
  const { coursesData, currentPage, totalPages, isCourseLoading, isCourseError } = useSelector(
    (state) => state.course
  );
  const {userData} = useSelector( (state)=> state.auth)

  const tutorId = userData?.id || null;

  useEffect(() => {
    if (!tutorId) return;
    console.log(tutorId);

    const fetchData = async()=>{
      try{
        await dispatch(fetchTutorCourses({ tutorId, page, pageSize }));
        console.log("Courses Fetched Successfully");
        
      }catch(error){
       console.log("Failed to fetch Courses");
       
      }
    }
    fetchData();

  }, [dispatch, page, tutorId]);

  const handleEdit = (courseId) => {
    navigate(`/tutor/courses/edit/${courseId}`)
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
    <UserLayout>
      {userData?.is_verified === false ?(
        <TutorVerificationMessage/>
      ):(
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Courses - Manage & Grow Your Teaching Portfolio</h1>
          
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {coursesData?.map((course) => (
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
    </UserLayout>
  );
};

export default TutorCourses;
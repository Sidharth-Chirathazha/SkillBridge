import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ManagementCourseCard from '../../components/common/ui/ManagementCourseCard';
import Pagination from '../../components/common/ui/Pagination';
import { fetchCourses } from '../../redux/slices/courseSlice';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminCourseManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 8;
  
  const { coursesData, currentPage, totalPages, isCourseLoading, isCourseError } = useSelector(
    (state) => state.course
  );
  
  useEffect(() => {
    dispatch(fetchCourses({page, pageSize}));
  }, [dispatch, page]);

  const handleManage = (id) => {
    navigate(`/admin/courses/${id}`)
  };
  
  return (
    <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Courses</h1>
        
        {/* Similar loading/error handling as StudentCourses */}
        {isCourseLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader className="animate-spin h-10 w-10 text-primary" />
        </div>
        ) : isCourseError ? (
           <div>An error occured</div>
        ) : (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {coursesData?.map((course) => (
                    <ManagementCourseCard
                      key={course.id}
                      course={course}
                      variant='admin'
                      onManage={handleManage}
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
    
    </AdminLayout>
  );
};

export default AdminCourseManagement;
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ManagementCourseCard from '../../components/common/ui/ManagementCourseCard';
import Pagination from '../../components/common/ui/Pagination';
import { fetchCategories, fetchCourses } from '../../redux/slices/courseSlice';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import SearchBar from '../../components/common/ui/SearchBar';
import DropdownMenu from '../../components/common/ui/DropdownMenu';


const AdminCourseManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState("");
  const pageSize = 20;

  const statusOptions = [
    { value: "Approved", label: "Approved" },
    { value: "Pending", label: "Pending" },
    { value: "Declined", label: "Declined" },
  ];
  
  const { coursesData, currentPage, totalPages, isCourseLoading, isCourseError, categoriesData } = useSelector(
    (state) => state.course
  );

   useEffect(() => {
      dispatch(fetchCategories({categoryPage:1, pageSize:100}));
    }, [dispatch]);
  
  useEffect(() => {
    dispatch(fetchCourses({page, pageSize, status:selectedStatus, search:searchQuery, categoryId:selectedCategory}));
  }, [dispatch, page, searchQuery, selectedCategory, selectedStatus]);

  const handleManage = (id) => {
    navigate(`/admin/courses/${id}`)
  };

  const handleSearch = (query) => {
    // setPage(1);
    setSearchQuery(query);
  };

  const handleCategoryChange = (categoryId) => {
    setPage(1);
    setSelectedCategory(categoryId);
  };

  const handleStatusChange = (status) => {
    setPage(1);
    setSelectedStatus(status);
  };

  
  
  return (
    <>
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

              {/* Add Filters Section Here */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <SearchBar value={searchQuery} onChange={handleSearch} placeholder='Search courses...'/>
                  <DropdownMenu
                    dropDownItems={categoriesData.map((cat) => ({value:cat.id, label:cat.name}))} 
                    value={selectedCategory} 
                    onChange={handleCategoryChange}
                    defaultLabel={"All Categories"} 
                  />
                  <DropdownMenu
                    dropDownItems={statusOptions} 
                    value={selectedStatus} 
                    onChange={handleStatusChange}
                    defaultLabel={"All Status"} 
                  />
                </div>
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
    
    </>
  );
};

export default AdminCourseManagement;
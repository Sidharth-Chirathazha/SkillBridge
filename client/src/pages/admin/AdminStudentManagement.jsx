import React, { useEffect, useState } from 'react';
import { 
  Eye, 
  MoreVertical, 
  Filter, 
  ChevronDown,
  Loader 
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStudents } from '../../redux/slices/adminSlice';
import { useNavigate } from 'react-router-dom';
import StatusCell from '../../components/common/ui/StatusCell';
import Pagination from '../../components/common/ui/Pagination';
import DropdownMenu from '../../components/common/ui/DropdownMenu';
import SearchBar from '../../components/common/ui/SearchBar';


const AdminStudentManagement = () => {

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [selectedActiveStatus, setSelectedActiveStatus] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const pageSize = 5;

    const activeStatusOptions = [
      { value: true, label: "Active" },
      { value: false, label: "Blocked" },
    ];

      
    const navigate = useNavigate();
    const {adminStudentsData, currentPage, totalPages } = useSelector((state)=>state.admin);
    const dispatch = useDispatch();
    
    useEffect(() => {
        // Dispatch fetchUser and store the promise
        const fetchData = async () => {
            try {
            setLoading(true);
            await dispatch(fetchAdminStudents({page, pageSize, 
              activeStatus:selectedActiveStatus === "" ? null : selectedActiveStatus, search:searchQuery})).unwrap();
            } catch (error) {
            console.error('Failed to fetch user:', error);
            }finally {
            setLoading(false);
            }
        };
        
        fetchData();
    }, [dispatch,page, selectedActiveStatus, searchQuery]);


    const handleActiveStatusChange = (status) => {
      setPage(1);
      setSelectedActiveStatus(status);
    };

    const handleSearch = (query) => {
      // setPage(1);
      setSearchQuery(query);
    };
  
    const handlePageChange = (newPage) => {
      setPage((prevPage) => (prevPage !== newPage ? newPage : prevPage));
    };


      
    if (loading ||  !adminStudentsData) {
        return (
            <div className="flex justify-center items-center h-screen">
            <Loader className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }
    
    console.log(adminStudentsData);

  return (
     <>
    <div className="bg-background-50 p-4 md:p-6 rounded-lg shadow-lg">
      <div className="flex flex-col mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-semibold text-text-500 transition-colors duration-300">Students Management</h1>
        
        {/* Add Filters Section Here */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <SearchBar value={searchQuery} onChange={handleSearch} placeholder='Search students...'/>
            <DropdownMenu
              dropDownItems={activeStatusOptions} 
              value={selectedActiveStatus} 
              onChange={handleActiveStatusChange}
              defaultLabel={"All"} 
            />
        </div>
      </div>

      {/* Students Table */}
      <div className="hidden md:block rounded-t-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-background-100 border-b border-background-200">
              <th className="p-4 text-left text-text-400 text-sm">Profile</th>
              <th className="p-4 text-left text-text-400 text-sm">Name</th>
              <th className="p-4 text-left text-text-400 text-sm">Email</th>
              <th className="p-4 text-left text-text-400 text-sm">City</th>
              <th className="p-4 text-left text-text-400 text-sm">Active Status</th>
              <th className="p-4 text-left text-text-400 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminStudentsData.map((student) => (
              <tr 
                key={student.id} 
                className="border-b border-background-200 hover:bg-background-100 transition-all duration-300"
              >
                <td className="p-4">
                  <div className="h-10 w-10 rounded-full overflow-hidden shadow-md transition-transform duration-300 hover:scale-110">
                      <img 
                        src={student.profile_pic_url} 
                        alt={student.first_name} 
                        className="h-full w-full object-cover"
                      />
                  </div>
                </td>
                <td className="p-4 text-text-500 font-medium">{student.first_name} {student.last_name}</td>
                <td className="p-4 text-text-400">{student.email}</td>
                <td className="p-4 text-text-400">{student.city}</td>
                <StatusCell type="active" status={student.is_active} />
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-primary-500 hover:bg-primary-50 p-2 rounded-full transition-all duration-300 hover:shadow-md"
                      title="View Student Details"
                      onClick={()=>navigate(`/admin/students/${student.id}`)}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button 
                      className="text-text-400 hover:bg-background-200 p-2 rounded-full transition-all duration-300 hover:shadow-md"
                      title="More Options"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          
          {adminStudentsData.map((student) => (
          <div 
            key={student.id}
            className="bg-background-100 rounded-lg border border-background-200 p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
             <div className="flex flex-col space-y-4">
                  {/* Header with Checkbox and Actions */}
                  <div className="flex justify-between items-start w-full">
                      <div className="flex items-center">
                          <div className="flex space-x-2">
                              <button 
                                  className="text-primary-500 hover:bg-primary-50 p-2 rounded-full transition-all duration-300 hover:shadow-md"
                                  title="View Student Details"
                                  onClick={() => navigate(`/admin/students/${student.id}`)}
                              >
                                  <Eye className="h-5 w-5" />
                              </button>
                              <button 
                                  className="text-text-400 hover:bg-background-200 p-2 rounded-full transition-all duration-300 hover:shadow-md"
                                  title="More Options"
                              >
                                  <MoreVertical className="h-5 w-5" />
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Student Details */}
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden shadow-md transition-transform duration-300 hover:scale-110">
                        <img 
                            src={student.profile_pic_url} 
                            alt={student.first_name} 
                            className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                          <h3 className="font-medium text-text-500">{student.first_name} {student.last_name}</h3>
                          <p className="text-sm text-text-400 mt-1">{student.email}</p>
                          <p className="text-sm text-text-400 mt-1">{student.city}</p>
                          <StatusCell type="active" status={student.is_active} />
                      </div>
                  </div>
              </div>
            </div>
          ))}
        </div>

         {/* Modern Pagination */}
         <div className="mt-6 flex flex-col items-center gap-4 border-t border-background-200 pt-4">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-4 md:mt-0"
          />
          
        </div>
      </div>
    </>
  )
}

export default AdminStudentManagement
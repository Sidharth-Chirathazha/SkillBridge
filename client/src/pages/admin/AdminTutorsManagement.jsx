import React, { useEffect, useState } from 'react';
import { 
  Eye, 
  MoreVertical, 
  Filter, 
  ChevronDown,
  Loader,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminTutors } from '../../redux/slices/adminSlice';
import { useNavigate } from 'react-router-dom';
import StatusCell from '../../components/common/ui/StatusCell';
import Pagination from '../../components/common/ui/Pagination';

const AdminTutorsManagement = () => {

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  
  const navigate = useNavigate();
  const {adminTutorsData, currentPage, totalPages } = useSelector((state)=>state.admin);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchAdminTutors({page, pageSize})).unwrap();
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch, page]);


  if (loading || !adminTutorsData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-background-50 p-4 md:p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-semibold text-text-500 transition-colors duration-300">Tutors Management</h1>
          
          <div className="flex items-center space-x-4 w-full md:w-auto sticky top-0 z-20 bg-background-50 py-2">
            <div className="relative w-full md:w-auto">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center px-4 py-2 bg-background-100 text-text-400 rounded-lg border border-background-200 hover:bg-background-200 transition-all duration-300 w-full md:w-auto justify-between md:justify-start shadow-sm hover:shadow-md"
              >
                <div className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filter
                </div>
                <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-full md:w-64 bg-background-50 border border-background-200 rounded-lg shadow-xl p-4 z-10 transform transition-all duration-300 origin-top">
                  <p className="text-text-400 text-sm">Filter options coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-t-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-background-100 border-b border-background-200">
                <th className="p-4 text-left text-text-400 text-sm font-medium">Profile</th>
                <th className="p-4 text-left text-text-400 text-sm font-medium">Name</th>
                <th className="p-4 text-left text-text-400 text-sm font-medium">Email</th>
                <th className="p-4 text-left text-text-400 text-sm font-medium">Job Role</th>
                <th className="p-4 text-left text-text-400 text-sm font-medium">Verification</th>
                <th className="p-4 text-left text-text-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminTutorsData.map((tutor) => (
                <tr 
                  key={tutor.id} 
                  className="border-b border-background-200 hover:bg-background-100 transition-all duration-300"
                >
                  <td className="p-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden shadow-md transition-transform duration-300 hover:scale-110">
                      <img 
                        src={tutor.profile_pic_url} 
                        alt={tutor.first_name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4 text-text-500 font-medium">{tutor.first_name} {tutor.last_name}</td>
                  <td className="p-4 text-text-400">{tutor.email}</td>
                  <td className="p-4 text-text-400">{tutor.cur_job_role}</td>
                  <StatusCell type="verification" status={tutor.is_verified} />
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-primary-500 hover:bg-primary-50 p-2 rounded-full transition-all duration-300 hover:shadow-md"
                        title="View Tutor Details"
                        onClick={() => navigate(`/admin/tutors/${tutor.id}`)}
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
          
          {adminTutorsData.map((tutor) => (
            <div 
              key={tutor.id}
              className="bg-background-100 rounded-lg border border-background-200 p-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Card content remains the same */}
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center">
                    <div className="flex space-x-2">
                      <button 
                        className="text-primary-500 hover:bg-primary-50 p-2 rounded-full transition-all duration-300 hover:shadow-md"
                        title="View Tutor Details"
                        onClick={() => navigate(`/admin/tutors/${tutor.id}`)}
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

                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden shadow-md transition-transform duration-300 hover:scale-110">
                    <img 
                      src={tutor.profile_pic_url} 
                      alt={tutor.first_name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-text-500">{tutor.first_name} {tutor.last_name}</h3>
                    <p className="text-sm text-text-400 mt-1">{tutor.email}</p>
                    <p className="text-sm text-text-400 mt-1">{tutor.cur_job_role}</p>
                    <div className="mt-1">
                      <StatusCell type="verification" status={tutor.is_verified} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modern Pagination */}
        <div className="mt-6 flex flex-col  items-center gap-4 border-t border-background-200 pt-4">
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-4 md:mt-0"
          />
          
        </div>
      </div>
    </>
  );
};

export default AdminTutorsManagement;
import React, { useEffect, useState } from 'react';
import { 
  Eye, 
  MoreVertical, 
  Filter, 
  ChevronDown,
  Loader 
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminTutors } from '../../redux/slices/adminSlice';
import { useNavigate } from 'react-router-dom';

// Placeholder data (to be replaced with actual data later)


const AdminTutorsManagement = () => {
  const [selectedTutors, setSelectedTutors] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const {adminTutorsData} = useSelector((state)=>state.admin);
  const dispatch = useDispatch();

  useEffect(() => {
        // Dispatch fetchUser and store the promise
        const fetchData = async () => {
          try {
            setLoading(true);
            await dispatch(fetchAdminTutors()).unwrap();
          } catch (error) {
            console.error('Failed to fetch user:', error);
          }finally {
            setLoading(false);
          }
        };
        
        fetchData();
      }, [dispatch]);


  const handleSelectTutor = (tutorId) => {
    setSelectedTutors(prev => 
      prev.includes(tutorId) 
        ? prev.filter(id => id !== tutorId) 
        : [...prev, tutorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTutors.length === adminTutorsData.length) {
      setSelectedTutors([]);
    } else {
      setSelectedTutors(adminTutorsData.map(tutor => tutor.id));
    }
  };

  
  if (loading ||  !adminTutorsData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  console.log(adminTutorsData);
  

  return (
    <AdminLayout>
    <div className="bg-background-100 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-text-500">Tutors Management</h1>
        
        <div className="flex items-center space-x-4">
          {/* Filter Button */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 bg-background-50 text-text-400 rounded-lg border border-background-200 hover:bg-background-200 transition-colors"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filter
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-background-50 border border-background-200 rounded-lg shadow-lg p-4 z-10">
                {/* Filter options would go here */}
                <p className="text-text-400 text-sm">Filter options coming soon...</p>
              </div>
            )}
          </div>

          {/* Add Tutor Button
          <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            Add Tutor
          </button> */}
        </div>
      </div>

      {/* Tutors Table */}
      <div className="bg-background-50 rounded-lg border border-background-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-background-100 border-b border-background-200">
              <th className="p-4 text-left">
                <input 
                  type="checkbox"
                  checked={selectedTutors.length === adminTutorsData.length}
                  onChange={handleSelectAll}
                  className="form-checkbox text-primary-500 rounded"
                />
              </th>
              <th className="p-4 text-left text-text-400 text-sm">Profile</th>
              <th className="p-4 text-left text-text-400 text-sm">Name</th>
              <th className="p-4 text-left text-text-400 text-sm">Email</th>
              <th className="p-4 text-left text-text-400 text-sm">Job Role</th>
              <th className="p-4 text-left text-text-400 text-sm">Verification</th>
              <th className="p-4 text-left text-text-400 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminTutorsData.map((tutor) => (
              <tr 
                key={tutor.id} 
                className="border-b border-background-200 hover:bg-background-100 transition-colors"
              >
                <td className="p-4">
                  <input 
                    type="checkbox"
                    checked={selectedTutors.includes(tutor.id)}
                    onChange={() => handleSelectTutor(tutor.id)}
                    className="form-checkbox text-primary-500 rounded"
                  />
                </td>
                <td className="p-4">
                  <img 
                    src={tutor.profile_pic_url} 
                    alt={tutor.first_name} 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </td>
                <td className="p-4 text-text-500 font-medium">{tutor.first_name} {tutor.last_name}</td>
                <td className="p-4 text-text-400">{tutor.email}</td>
                <td className="p-4 text-text-400">{tutor.cur_job_role}</td>
                <td className="p-4 text-text-400">{tutor.is_verified? "Verified":"Pending"}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-primary-500 hover:bg-primary-50 p-2 rounded-full"
                      title="View Tutor Details"
                      onClick={()=>navigate(`/admin/tutors/${tutor.id}`)}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button 
                      className="text-text-400 hover:bg-background-200 p-2 rounded-full"
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

        {/* Table Footer */}
        <div className="p-4 bg-background-100 flex justify-between items-center border-t border-background-200">
          <span className="text-text-400 text-sm">
            Showing {adminTutorsData.length} of {adminTutorsData.length} tutors
          </span>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-background-50 text-text-400 rounded border border-background-200 hover:bg-background-200">
              Previous
            </button>
            <button className="px-3 py-1 bg-background-50 text-text-400 rounded border border-background-200 hover:bg-background-200">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminTutorsManagement;
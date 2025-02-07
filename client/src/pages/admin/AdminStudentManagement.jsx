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
import { fetchAdminStudents } from '../../redux/slices/adminSlice';
import { useNavigate } from 'react-router-dom';
import StatusCell from '../../components/common/ui/StatusCell';

const AdminStudentManagement = () => {


    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);
      
    const navigate = useNavigate();
    const {adminStudentsData} = useSelector((state)=>state.admin);
    const dispatch = useDispatch();
    
    useEffect(() => {
        // Dispatch fetchUser and store the promise
        const fetchData = async () => {
            try {
            setLoading(true);
            await dispatch(fetchAdminStudents()).unwrap();
            } catch (error) {
            console.error('Failed to fetch user:', error);
            }finally {
            setLoading(false);
            }
        };
        
        fetchData();
        }, [dispatch]);
    
    
    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
            ? prev.filter(id => id !== studentId) 
            : [...prev, studentId]
        );
    };
    
    const handleSelectAll = () => {
        if (selectedStudents.length === adminStudentsData.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(adminStudentsData.map(student => student.id));
        }
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
     <AdminLayout>
    <div className="bg-background-100 p-4 md:p-6 rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-semibold text-text-500">Students Management</h1>
        
        <div className="flex items-center space-x-4 w-full md:w-auto sticky top-0 z-20 bg-background-100 py-2">
          {/* Filter Button */}
          <div className="relative w-full md:w-auto">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 bg-background-50 text-text-400 rounded-lg border border-background-200 hover:bg-background-200 transition-colors w-full md:w-auto justify-between md:justify-start"
            >
              <div className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter
              </div>
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-full md:w-64 bg-background-50 border border-background-200 rounded-lg shadow-lg p-4 z-10">
                {/* Filter options would go here */}
                <p className="text-text-400 text-sm">Filter options coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="hidden md:block bg-background-50 rounded-lg border border-background-200 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-background-100 border-b border-background-200">
              <th className="p-4 text-left">
                <input 
                  type="checkbox"
                  checked={selectedStudents.length === adminStudentsData.length}
                  onChange={handleSelectAll}
                  className="form-checkbox text-primary-500 rounded"
                />
              </th>
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
                className="border-b border-background-200 hover:bg-background-100 transition-colors"
              >
                <td className="p-4">
                  <input 
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleSelectStudent(student.id)}
                    className="form-checkbox text-primary-500 rounded"
                  />
                </td>
                <td className="p-4">
                  <img 
                    src={student.profile_pic_url} 
                    alt={student.first_name} 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </td>
                <td className="p-4 text-text-500 font-medium">{student.first_name} {student.last_name}</td>
                <td className="p-4 text-text-400">{student.email}</td>
                <td className="p-4 text-text-400">{student.city}</td>
                <StatusCell type="active" status={student.is_active} />
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-primary-500 hover:bg-primary-50 p-2 rounded-full"
                      title="View Student Details"
                      onClick={()=>navigate(`/admin/students/${student.id}`)}
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
      </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          <div className="flex items-center p-4 bg-background-100 border-b border-background-200 sticky top-14 z-10">
            <input 
              type="checkbox"
              checked={selectedStudents.length === adminStudentsData.length}
              onChange={handleSelectAll}
              className="form-checkbox text-primary-500 rounded mr-4"
            />
            <span className="text-text-400 text-sm">Select All</span>
          </div>
          
          {adminStudentsData.map((student) => (
          <div 
            key={student.id}
            className="bg-background-50 rounded-lg border border-background-200 p-4"
          >
             <div className="flex flex-col space-y-4">
                  {/* Header with Checkbox and Actions */}
                  <div className="flex justify-between items-start w-full">
                      <div className="flex items-center">
                          <input 
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleSelectStudent(student.id)}
                              className="form-checkbox text-primary-500 rounded mr-4"
                          />
                          <div className="flex space-x-2">
                              <button 
                                  className="text-primary-500 hover:bg-primary-50 p-2 rounded-full"
                                  title="View Student Details"
                                  onClick={() => navigate(`/admin/students/${student.id}`)}
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
                      </div>
                  </div>

                  {/* Student Details */}
                  <div className="flex items-start space-x-4">
                      <img 
                          src={student.profile_pic_url} 
                          alt={student.first_name} 
                          className="h-12 w-12 rounded-full object-cover"
                      />
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

        {/* Table Footer */}
        <div className="mt-4 p-4 bg-background-100 flex flex-col md:flex-row justify-between items-center border-t border-background-200 gap-4">
          <span className="text-text-400 text-sm order-2 md:order-1">
            Showing {adminStudentsData.length} of {adminStudentsData.length} students
          </span>
          <div className="flex items-center space-x-2 order-1 md:order-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-3 py-1 bg-background-50 text-text-400 rounded border border-background-200 hover:bg-background-200">
              Previous
            </button>
            <button className="flex-1 md:flex-none px-3 py-1 bg-background-50 text-text-400 rounded border border-background-200 hover:bg-background-200">
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminStudentManagement
import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Book, 
  Star, 
  Linkedin, 
  FileText, 
  Check, 
  Ban,
  Loader 
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminStudents,updateUserActiveStatus } from '../../redux/slices/adminSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminStudentDetailView = () => {

   const [loading, setLoading] = useState(true);
   const {singleStudent} = useSelector((state)=> state.admin);
   const {id} = useParams();
   const dispatch = useDispatch();

    useEffect(() => {
         // Dispatch fetchUser and store the promise
         const fetchData = async () => {
           try {
             setLoading(true);
             await dispatch(fetchAdminStudents(id)).unwrap();
           } catch (error) {
             console.error('Failed to fetch user:', error);
           }finally {
             setLoading(false);
           }
         };
         fetchData();
       }, [dispatch, id]);

    const handleBlock = async (studentId, isActive) => {
        try {
            await dispatch(updateUserActiveStatus({ id: studentId, is_active: isActive })).unwrap();
            dispatch(fetchAdminStudents(id)); // Refetch updated data
            toast.success("Student Status Updated.")
        } catch (error) {
            console.error("Failed to update student authorization:", error);
        }
    };
   
    
    if (loading ||  !singleStudent) {
        return (
            <div className="flex justify-center items-center h-screen">
            <Loader className="animate-spin h-10 w-10 text-primary" />
            </div>
        );
    }

  return (
    <AdminLayout>
      <div className="bg-background-100 p-8 space-y-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Profile Details */}
          <div className="bg-white rounded-xl shadow-sm border border-background-200 p-6 flex flex-col items-center">
            <img 
              src={singleStudent.profile_pic_url} 
              alt={`${singleStudent.first_name} ${singleStudent.last_name}`}
              className="w-48 h-48 rounded-full object-cover border-4 border-primary-100 mb-4"
            />
            <h2 className="text-xl font-bold text-text-500">
              {singleStudent.first_name} {singleStudent.last_name}
            </h2>

            

            {/* Links */}
            <div className="mt-6 space-y-2">
              <a 
                href={singleStudent.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary-500 hover:text-primary-600"
              >
                <Linkedin className="h-5 w-5 mr-2" />
                LinkedIn Profile
              </a>
            </div>
          </div>

          {/* Right Column: About Me */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-background-200 p-6">
            <h3 className="text-xl font-semibold text-text-500 mb-4">About Me</h3>
            <p className="text-text-400 leading-relaxed mb-6">
              {singleStudent.bio}
            </p>

            {/* Personal Details Section */}
            <div className="border-t border-background-200 pt-4 space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-500" />
                <span className="text-text-400">{singleStudent.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-500" />
                <span className="text-text-400">{singleStudent.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary-500" />
                <span className="text-text-400">{singleStudent.city}, {singleStudent.country}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-background-200">
          {/* Tab Content */}
          <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background-50 p-4 rounded-lg border border-background-200 text-center">
                  <Book className="h-6 w-6 mx-auto mb-2 text-primary-500" />
                  <h3 className="text-text-500 font-semibold">0</h3>
                  <p className="text-text-400 text-sm">Total Courses</p>
                </div>
                <div className="bg-background-50 p-4 rounded-lg border border-background-200 text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-primary-500" />
                  <h3 className="text-text-500 font-semibold">{singleStudent.rating}</h3>
                  <p className="text-text-400 text-sm">Total Time Spent</p>
                </div>
              </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">

          {/* Block/Unblock Button */}
          <button 
            className={`flex items-center px-6 py-3 rounded-lg transition-colors font-semibold ${
              singleStudent.is_active 
                ? "bg-secondary-50 text-secondary-700 hover:bg-secondary-100" 
                : "bg-text-50 text-text-700 hover:bg-text-100"
            }`}
            onClick={() => handleBlock(singleStudent.id, !singleStudent.is_active)}
          >
            {singleStudent.is_active ? (
              <>
                <Ban className="h-5 w-5 mr-2" />
                Block
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Unblock
              </>
            )}
          </button>
        </div>

      </div>
    </AdminLayout>
  )
}

export default AdminStudentDetailView
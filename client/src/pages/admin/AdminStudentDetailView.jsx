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
import { fetchAdminStudents, updateUserActiveStatus } from '../../redux/slices/adminSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../../components/common/ui/ConfirmDialog';
import avatar2 from '../../assets/images/avatar2.jpg'

const AdminStudentDetailView = () => {
  const [loading, setLoading] = useState(true);
  const {singleStudent} = useSelector((state)=> state.admin);
  const {id} = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchAdminStudents({id})).unwrap();
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, id]);

  const handleBlock = async (studentId, isActive) => {
    try {
      await dispatch(updateUserActiveStatus({ id: studentId, is_active: isActive })).unwrap();
      dispatch(fetchAdminStudents({id}));
      toast.success("Student Status Updated.")
    } catch (error) {
      console.error("Failed to update student authorization:", error);
    }
  };

  if (loading || !singleStudent) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-background-100 p-4 md:p-8 space-y-6 md:space-y-8 min-h-screen">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column: Profile Details */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-background-200 p-4 md:p-6 flex flex-col items-center">
            <div className='relative'>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-300 to-primary-600 rounded-full blur opacity-70"></div>
                <img 
                  src={singleStudent.profile_pic_url || avatar2} 
                  alt={`${singleStudent.first_name} ${singleStudent.last_name}`}
                  className="relative w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white mb-4"
                />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-text-500 text-center">
              {singleStudent.first_name} {singleStudent.last_name}
            </h2>

            {/* Links */}
            <div className="mt-4 md:mt-6 space-y-2 w-full">
              <a 
                href={singleStudent.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors py-3 px-4 rounded-lg shadow-sm"
              >
                <Linkedin className="h-5 w-5 mr-2" />
                LinkedIn Profile
              </a>
            </div>
          </div>

          {/* Right Column: About Me */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-background-200 p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-text-500 mb-4">About Me</h3>
            <p className="text-text-400 leading-relaxed mb-4 md:mb-6">
              {singleStudent.bio}
            </p>

            {/* Personal Details Section */}
            <div className="border-t border-background-200 pt-4 space-y-3 md:space-y-4 bg-background-50 p-4 rounded-lg shadow-inner">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                  <Mail className="h-5 w-5 text-primary-500 flex-shrink-0" />
                </div>
                <span className="text-text-400 break-all">{singleStudent.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                  <Phone className="h-5 w-5 text-primary-500 flex-shrink-0" />
                </div>
                <span className="text-text-400">{singleStudent.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                  <MapPin className="h-5 w-5 text-primary-500 flex-shrink-0" />
                </div>
                <span className="text-text-400">{singleStudent.city}, {singleStudent.country}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-background-50 p-4 rounded-lg border border-background-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="flex flex-col md:flex-row md:justify-end space-y-3 md:space-y-0 md:space-x-4">
          <ConfirmDialog
             trigger={(open)=>(
              <button 
                className={`flex items-center justify-center px-6 py-3 rounded-lg transition-colors font-semibold w-full md:w-auto ${
                  singleStudent.is_active 
                    ? "bg-secondary-50 text-secondary-700 hover:bg-secondary-100" 
                    : "bg-text-50 text-text-700 hover:bg-text-100"
                }`}
                onClick={open}
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
             )}
             onConfirm={()=> handleBlock(singleStudent.id, !singleStudent.is_active)}
             title={singleStudent.is_active? "Block Student": "Unblock Student"}
             confirmText={singleStudent.is_active? "Block": "Unblock"}
             destructive={singleStudent.is_active && true}
             description={
              singleStudent.is_active
                ? `Are you sure you want to block "${singleStudent.first_name}"?`
                : `Are you sure you want to unblock "${singleStudent.first_name}"?`
            }
             variant='admin'
          />
        </div>
      </div>
    </>
  );
};

export default AdminStudentDetailView;
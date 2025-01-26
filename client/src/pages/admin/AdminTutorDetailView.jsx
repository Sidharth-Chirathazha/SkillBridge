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
import { fetchAdminTutors, updateTutorAuthorization, updateUserActiveStatus } from '../../redux/slices/adminSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminTutorDetailView = () => {

   const [activeTab, setActiveTab] = useState('education');
   const [loading, setLoading] = useState(true);
   const {singleTutor} = useSelector((state)=> state.admin);
   const {id} = useParams();
   const dispatch = useDispatch();

   useEffect(() => {
      // Dispatch fetchUser and store the promise
      const fetchData = async () => {
        try {
          setLoading(true);
          await dispatch(fetchAdminTutors(id)).unwrap();
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [dispatch, id]);

  const handleAuthorize = async (tutorId, isVerified) => {
    try {
      await dispatch(updateTutorAuthorization({ id: tutorId, is_verified: isVerified })).unwrap();
      dispatch(fetchAdminTutors(id)); // Refetch updated data
      toast.success("Tutor Authorization Status Updated.")
    } catch (error) {
      console.error("Failed to update tutor authorization:", error);
    }
  };

  const handleBlock = async (tutorId, isActive) => {
    try {
      await dispatch(updateUserActiveStatus({ id: tutorId, is_active: isActive })).unwrap();
      dispatch(fetchAdminTutors(id)); // Refetch updated data
      toast.success("Tutor Status Updated.")
    } catch (error) {
      console.error("Failed to update tutor authorization:", error);
    }
  };
   

  
  if (loading ||  !singleTutor) {
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
              src={singleTutor.profile_pic_url} 
              alt={`${singleTutor.first_name} ${singleTutor.last_name}`}
              className="w-48 h-48 rounded-full object-cover border-4 border-primary-100 mb-4"
            />
            <h2 className="text-xl font-bold text-text-500">
              {singleTutor.first_name} {singleTutor.last_name}
            </h2>
            <p className="text-text-400 mb-6">{singleTutor.cur_job_role}</p>

            

            {/* Links */}
            <div className="mt-6 space-y-2">
              <a 
                href={singleTutor.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary-500 hover:text-primary-600"
              >
                <Linkedin className="h-5 w-5 mr-2" />
                LinkedIn Profile
              </a>
              <a 
                href={singleTutor.resume_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary-500 hover:text-primary-600"
              >
                <FileText className="h-5 w-5 mr-2" />
                View Resume
              </a>
            </div>
          </div>

          {/* Right Column: About Me */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-background-200 p-6">
            <h3 className="text-xl font-semibold text-text-500 mb-4">About Me</h3>
            <p className="text-text-400 leading-relaxed mb-6">
              {singleTutor.bio}
            </p>

            {/* Personal Details Section */}
            <div className="border-t border-background-200 pt-4 space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-500" />
                <span className="text-text-400">{singleTutor.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-500" />
                <span className="text-text-400">{singleTutor.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary-500" />
                <span className="text-text-400">{singleTutor.city}, {singleTutor.country}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-background-200">
          <div className="flex border-b border-background-200">
            {[{
              key: 'education', label: 'Education' },
              { key: 'experience', label: 'Work Experience' },
              { key: 'stats', label: 'Tutor Performance' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 flex-1 ${
                  activeTab === tab.key 
                    ? 'border-b-2 border-primary-500 text-primary-500 font-semibold' 
                    : 'text-text-400 hover:bg-background-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'education' && (
              <div className="space-y-4">
                {singleTutor.educations.map((edu, index) => (
                  <div 
                    key={index} 
                    className="bg-background-50 p-4 rounded-lg border border-background-200"
                  >
                    <div className="flex items-center mb-2">
                      <Book className="h-5 w-5 mr-3 text-primary-500" />
                      <h3 className="text-text-500 font-semibold">{edu.degree}</h3>
                    </div>
                    <p className="text-text-400">{edu.university}</p>
                    <p className="text-text-400 text-sm">Graduated in {edu.year_of_passing}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-4">
                {singleTutor.work_experiences.map((exp, index) => (
                  <div 
                    key={index} 
                    className="bg-background-50 p-4 rounded-lg border border-background-200"
                  >
                    <div className="flex items-center mb-2">
                      <Briefcase className="h-5 w-5 mr-3 text-primary-500" />
                      <h3 className="text-text-500 font-semibold">{exp.job_role}</h3>
                    </div>
                    <p className="text-text-400">{exp.company}</p>
                    <p className="text-text-400 text-sm">
                      {exp.date_of_joining} - {exp.date_of_leaving}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background-50 p-4 rounded-lg border border-background-200 text-center">
                  <Book className="h-6 w-6 mx-auto mb-2 text-primary-500" />
                  <h3 className="text-text-500 font-semibold">0</h3>
                  <p className="text-text-400 text-sm">Total Courses</p>
                </div>
                <div className="bg-background-50 p-4 rounded-lg border border-background-200 text-center">
                  <User className="h-6 w-6 mx-auto mb-2 text-primary-500" />
                  <h3 className="text-text-500 font-semibold">0</h3>
                  <p className="text-text-400 text-sm">Total Students</p>
                </div>
                <div className="bg-background-50 p-4 rounded-lg border border-background-200 text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-primary-500" />
                  <h3 className="text-text-500 font-semibold">{singleTutor.rating}</h3>
                  <p className="text-text-400 text-sm">Average Rating</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {/* Authorize/Unauthorize Button */}
          <button 
            className={`flex items-center px-6 py-3 rounded-lg transition-colors font-semibold ${
              singleTutor.is_verified 
                ? "bg-secondary-50 text-secondary-700 hover:bg-secondary-100" 
                : "bg-text-50 text-text-700 hover:bg-text-100"
            }`}
            onClick={() => handleAuthorize(singleTutor.id, !singleTutor.is_verified)}
          >
            {singleTutor.is_verified ? (
              <>
                <Ban className="h-5 w-5 mr-2" />
                Unauthorize
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Authorize
              </>
            )}
          </button>

          {/* Block/Unblock Button */}
          <button 
            className={`flex items-center px-6 py-3 rounded-lg transition-colors font-semibold ${
              singleTutor.is_active 
                ? "bg-secondary-50 text-secondary-700 hover:bg-secondary-100" 
                : "bg-text-50 text-text-700 hover:bg-text-100"
            }`}
            onClick={() => handleBlock(singleTutor.id, !singleTutor.is_active)}
          >
            {singleTutor.is_active ? (
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
  );
};

export default AdminTutorDetailView;

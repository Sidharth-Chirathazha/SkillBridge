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
import { fetchAdminTutors, updateTutorAuthorization, updateUserActiveStatus } from '../../redux/slices/adminSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../../components/common/ui/ConfirmDialog';
import avatar2 from '../../assets/images/avatar2.jpg'

const AdminTutorDetailView = () => {
  const [activeTab, setActiveTab] = useState('education');
  const [loading, setLoading] = useState(true);
  const {singleTutor} = useSelector((state)=> state.admin);
  const {id} = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchAdminTutors({id})).unwrap();
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, id]);

  const handleAuthorize = async (tutorId, isVerified) => {
    try {
      await dispatch(updateTutorAuthorization({ id: tutorId, is_verified: isVerified })).unwrap();
      dispatch(fetchAdminTutors({id}));
      toast.success("Tutor Authorization Status Updated.")
    } catch (error) {
      console.error("Failed to update tutor authorization:", error);
    }
  };

  const handleBlock = async (tutorId, isActive) => {
    try {
      await dispatch(updateUserActiveStatus({ id: tutorId, is_active: isActive })).unwrap();
      dispatch(fetchAdminTutors({id}));
      toast.success("Tutor Status Updated.")
    } catch (error) {
      console.error("Failed to update tutor authorization:", error);
    }
  };

  if (loading || !singleTutor) {
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
                  src={singleTutor.profile_pic_url || avatar2} 
                  alt={`${singleTutor.full_name}`}
                  className="relative w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white mb-4"
                />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-text-500 text-center">
              {singleTutor.full_name}
            </h2>
            <p className="text-text-600 mb-4 md:mb-6 text-center font-medium">{singleTutor.cur_job_role}</p>
            {/* Rating Display */}
            <div className="flex items-center gap-2 mb-4 bg-background-50 px-4 py-2 rounded-full shadow-sm">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < Math.floor(singleTutor.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                />
              ))}
              <span className="text-text-600 font-medium">
                ({singleTutor.rating?.toFixed(1)}) • {singleTutor.total_reviews} reviews
              </span>
            </div>

            {/* Links */}
            <div className="mt-4 md:mt-6 space-y-2 w-full">
              <a 
                href={singleTutor.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors py-3 px-4 rounded-lg shadow-sm"
              >
                <Linkedin className="h-5 w-5 mr-2" />
                LinkedIn Profile
              </a>
              <a 
                href={singleTutor.resume_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors py-3 px-4 rounded-lg shadow-sm"
              >
                <FileText className="h-5 w-5 mr-2" />
                View Resume
              </a>
            </div>
          </div>

          {/* Right Column: About Me */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-background-200 p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-text-500 mb-4">About Me</h3>
            <p className="text-text-400 leading-relaxed mb-4 md:mb-6">
              {singleTutor.bio}
            </p>

            {/* Personal Details Section */}
            <div className="border-t border-background-200 pt-4 space-y-3 md:space-y-4 bg-background-50 p-4 rounded-lg shadow-inner">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                  <Mail className="h-5 w-5 text-primary-500 flex-shrink-0" />
                </div>
                <span className="text-text-400 break-all">{singleTutor.email}</span>
              </div>
              <div className="flex items-center space-x-3">
              ` <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                  <Phone className="h-5 w-5 text-primary-500 flex-shrink-0" />
                </div>
                <span className="text-text-400">{singleTutor.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                  <MapPin className="h-5 w-5 text-primary-500 flex-shrink-0" />
                </div>
                <span className="text-text-400">{singleTutor.city}, {singleTutor.country}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-background-200 overflow-hidden">
          {/* Tab Buttons */}
          <div className="flex flex-col md:flex-row border-b border-background-200 bg-background-50">
            {[
              { key: 'education', label: 'Education' },
              { key: 'experience', label: 'Work Experience' },
              { key: 'stats', label: 'Tutor Performance' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 md:px-6 py-4 flex items-center justify-center md:justify-start transition-all ${
                  activeTab === tab.key 
                    ? 'border-b-2 border-primary-500 text-primary-500 font-semibold' 
                    : 'text-text-400 hover:bg-background-100'
                } ${
                  tab.key === 'education' ? 'rounded-t-xl md:rounded-none' : ''
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-6">
            {activeTab === 'education' && (
              <div className="space-y-4">
                {singleTutor.educations.map((edu, index) => (
                  <div 
                    key={index} 
                    className="bg-background-50 p-4 rounded-lg border border-background-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-start md:items-center mb-2">
                      <div className="p-3 bg-primary-100 rounded-full text-primary-600 mr-4">
                        <Book className="h-5 w-5 flex-shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-text-500 font-semibold text-lg">{edu.degree}</h3>
                        <p className="text-text-400 font-medium">{edu.university}</p>
                        <p className="text-text-400 text-sm mt-1">Graduated in {edu.year_of_passing}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-4">
                {singleTutor.work_experiences.map((exp, index) => (
                  <div 
                    key={index} 
                    className="bg-background-50 p-5 rounded-lg border border-background-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-start md:items-center mb-2">
                      <div className="p-3 bg-primary-100 rounded-full text-primary-600 mr-4">
                        <Briefcase className="h-5 w-5 flex-shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-text-500 font-semibold text-lg">{exp.job_role}</h3>
                        <p className="text-text-400 font-medium">{exp.company}</p>
                        <p className="text-text-400 text-sm mt-1">
                          {exp.date_of_joining} - {exp.date_of_leaving}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-background-50 p-4 rounded-lg border border-background-200 text-center">
                  <Book className="h-6 w-6 mx-auto mb-2 text-primary-500" />
                  <h3 className="text-text-500 font-semibold">{singleTutor.total_courses}</h3>
                  <p className="text-text-400 text-sm">Total Courses</p>
                </div>
                <div className="bg-background-50 p-4 rounded-lg border border-background-200 text-center">
                  <User className="h-6 w-6 mx-auto mb-2 text-primary-500" />
                  <h3 className="text-text-500 font-semibold">{singleTutor.total_students}</h3>
                  <p className="text-text-400 text-sm">Total Students</p>
                </div>
                <div className="bg-background-50 p-4 rounded-lg border border-background-200 text-center sm:col-span-2 md:col-span-1">
                  <Star className="h-6 w-6 mx-auto mb-2 text-primary-500" />
                  <h3 className="text-text-500 font-semibold">{singleTutor.rating}</h3>
                  <p className="text-text-400 text-sm">Average Rating</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row md:justify-end space-y-3 md:space-y-0 md:space-x-4">
          {/* Authorize/Unauthorize Button */}

          <ConfirmDialog
          trigger={(open)=>(
            <button
           
              className={`flex items-center justify-center px-6 py-3 rounded-lg transition-colors font-semibold w-full md:w-auto ${
                singleTutor.is_verified 
                  ? "bg-secondary-50 text-secondary-700 hover:bg-secondary-100" 
                  : "bg-text-50 text-text-700 hover:bg-text-100"
              }`}
              onClick={open}
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
          )}
          onConfirm={() => handleAuthorize(singleTutor.id, !singleTutor.is_verified) }
          title={singleTutor.is_verified? "Unauthorize Tutor": "Authorize Tutor"}
             confirmText={singleTutor.is_verified? "Unauthorize": "Authorize"}
             destructive={singleTutor.is_verified}
             description={
              singleTutor.is_verified
                ? `Are you sure you want to unauthorize "${singleTutor.first_name}"?`
                : `Are you sure you want to authorize "${singleTutor.first_name}"?`
            }
             variant='admin'
          
          />

          {/* Block/Unblock Button */}
          <ConfirmDialog
              trigger={(open)=>(
              <button 
                className={`flex items-center justify-center px-6 py-3 rounded-lg transition-colors font-semibold w-full md:w-auto ${
                  singleTutor.is_active 
                    ? "bg-secondary-50 text-secondary-700 hover:bg-secondary-100" 
                    : "bg-text-50 text-text-700 hover:bg-text-100"
                }`}
                onClick={open}
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
              )}
              onConfirm={()=> handleBlock(singleTutor.id, !singleTutor.is_active)}
              title={singleTutor.is_active? "Block Tutor": "Unblock Tutor"}
              confirmText={singleTutor.is_active? "Block": "Unblock"}
              destructive={singleTutor.is_active && true}
              description={
              singleTutor.is_active
                ? `Are you sure you want to block "${singleTutor.first_name}"?`
                : `Are you sure you want to unblock "${singleTutor.first_name}"?`
            }
              variant='admin'
          />
        </div>
      </div>
    </>
  );
};

export default AdminTutorDetailView;
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Book, 
  Star, 
  Linkedin,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { fetchAdminTutors } from '../../redux/slices/adminSlice';
import { fetchTutorReviews, postTutorReview } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';


const StudentTutorDetailView = () => {
  const [activeTab, setActiveTab] = useState('education');
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const { singleTutor } = useSelector((state) => state.admin);
  const {tutorReviewsData} = useSelector((state)=>state.auth)
  const dispatch = useDispatch();
  const { id } = useParams();

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

 // Fetch reviews when slug is available
   useEffect(() => {
     const fetchReviews = async () => {
       try {
         if (singleTutor?.tutor_id) {
           await dispatch(fetchTutorReviews(singleTutor.tutor_id)).unwrap();
         }
       } catch (error) {
         toast.error("failed to fetch reviews")
         console.error('Failed to fetch reviews:', error);
       }
     };
     fetchReviews();
   }, [dispatch, singleTutor?.tutor_id]);

  const handleSubmitReview = async() => {
    try{
        await dispatch(postTutorReview({
            tutor:singleTutor?.tutor_id,
            review:review,
            rating:rating
        })).unwrap();

        await dispatch(fetchTutorReviews(singleTutor.tutor_id)).unwrap();
        setShowReviewModal(false);
        setRating(0);
        setReview('');
        toast.success("Review submitted successfully!");
    }catch (error) {
        toast.error("You have already submitted the review")
    };
  }

  if (loading || !singleTutor) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background-50 p-4 md:p-8 space-y-6 md:space-y-8 min-h-screen">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {/* Left Column: Profile Details */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-background-200 p-4 md:p-6 flex flex-col items-center">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-300 to-primary-600 rounded-full blur opacity-70"></div>
            <img 
              src={singleTutor.profile_pic_url} 
              alt={`${singleTutor.first_name} ${singleTutor.last_name}`}
              className="relative w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white mb-4"
            />
          </div>
          
          <h2 className="text-lg md:text-xl font-bold text-text-800 mt-2 text-center">
            {singleTutor.full_name}
          </h2>
          <p className="text-text-600 mb-4 md:mb-6 text-center font-medium">
            {singleTutor.cur_job_role}
          </p>
          
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
              ({singleTutor.rating?.toFixed(1)}) • {singleTutor.review_count} reviews
            </span>
          </div>

          {/* Report Button */}
          <button
            onClick={() => console.log('Report tutor')}
            className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline transition-all"
          >
            Report Tutor
          </button>

          {/* LinkedIn Link */}
          <div className="mt-6 w-full">
            <a 
              href={singleTutor.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors py-3 px-4 rounded-lg shadow-sm"
            >
              <Linkedin className="h-5 w-5 mr-2" />
              <span className="font-medium">Connect on LinkedIn</span>
            </a>
          </div>
        </div>

        {/* Right Column: About Me */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-background-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-text-800 mb-4 border-b border-background-200 pb-2">About Me</h3>
          <p className="text-text-600 leading-relaxed mb-4 md:mb-6">
            {singleTutor.bio}
          </p>

          {/* Personal Details Section */}
          <div className="border-t border-background-200 pt-4 space-y-3 md:space-y-4 bg-background-50 p-4 rounded-lg shadow-inner">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                <Mail className="h-5 w-5 flex-shrink-0" />
              </div>
              <span className="text-text-600 break-all">{singleTutor.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                <Phone className="h-5 w-5 flex-shrink-0" />
              </div>
              <span className="text-text-600">{singleTutor.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                <MapPin className="h-5 w-5 flex-shrink-0" />
              </div>
              <span className="text-text-600">{singleTutor.city}, {singleTutor.country}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-background-200 overflow-hidden">
        <div className="flex flex-col md:flex-row border-b border-background-200 bg-background-50">
          {[
            { key: 'education', label: 'Education', icon: <Book size={18} /> },
            { key: 'experience', label: 'Work Experience', icon: <Briefcase size={18} /> },
            { key: 'reviews', label: 'Reviews', icon: <Star size={18} /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 md:px-6 py-4 flex items-center justify-center md:justify-start transition-all ${
                activeTab === tab.key 
                  ? 'border-b-2 border-primary-600 text-primary-600 font-semibold bg-white' 
                  : 'text-text-600 hover:bg-background-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          {activeTab === 'education' && (
            <div className="space-y-4">
              {singleTutor.educations?.map((edu, index) => (
                <div 
                  key={index} 
                  className="bg-background-50 p-5 rounded-lg border border-background-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start md:items-center mb-2">
                    <div className="p-3 bg-primary-100 rounded-full text-primary-600 mr-4">
                      <Book className="h-5 w-5 flex-shrink-0" />
                    </div>
                    <div>
                      <h3 className="text-text-800 font-semibold text-lg">{edu.degree}</h3>
                      <p className="text-primary-600 font-medium">{edu.university}</p>
                      <p className="text-text-500 text-sm mt-1">Graduated in {edu.year_of_passing}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-4">
              {singleTutor.work_experiences?.map((exp, index) => (
                <div 
                  key={index} 
                  className="bg-background-50 p-5 rounded-lg border border-background-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start md:items-center mb-2">
                    <div className="p-3 bg-primary-100 rounded-full text-primary-600 mr-4">
                      <Briefcase className="h-5 w-5 flex-shrink-0" />
                    </div>
                    <div>
                      <h3 className="text-text-800 font-semibold text-lg">{exp.job_role}</h3>
                      <p className="text-primary-600 font-medium">{exp.company}</p>
                      <p className="text-text-500 text-sm mt-1">
                        {exp.date_of_joining} - {exp.date_of_leaving}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-text-800">Student Reviews</h3>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
                >
                  <Star size={16} className="mr-2" />
                  Add Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {tutorReviewsData?.length > 0 ? (
                  tutorReviewsData.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-background-200">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={review.user.profile_pic_url}
                          alt={review.user.first_name}
                          className="w-14 h-14 rounded-full border-2 border-primary-100 object-cover shadow-sm"
                        />
                        <div>
                          <p className="font-medium text-text-800 text-lg">
                            {review.user.first_name} {review.user.last_name}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-text-600 bg-background-50 p-4 rounded-lg border border-background-100">{review.review}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-background-50 rounded-lg border border-background-200">
                    <p className="text-text-500">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onClose={() => setShowReviewModal(false)}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl border border-background-200">
            <Dialog.Title className="text-2xl font-bold text-text-800 mb-6 border-b border-background-200 pb-2">
              Write a Review
            </Dialog.Title>

            <div className="space-y-6">
              <div className="flex justify-center gap-2 bg-background-50 py-4 rounded-lg">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className="transform hover:scale-125 transition-transform"
                  >
                    <Star
                      size={32}
                      className={`${
                        i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this tutor..."
                className="w-full h-32 px-4 py-3 border border-background-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none shadow-inner"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2 text-text-600 hover:bg-background-100 rounded-lg transition-colors border border-background-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={!rating || !review.trim()}
                  className={`px-5 py-2 ${
                    !rating || !review.trim() 
                      ? 'bg-primary-300 cursor-not-allowed' 
                      : 'bg-primary-600 hover:bg-primary-700'
                  } text-white rounded-lg transition-colors shadow-sm`}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default StudentTutorDetailView;
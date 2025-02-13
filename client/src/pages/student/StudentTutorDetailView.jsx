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
  FileText,
  ThumbsUp
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { fetchAdminTutors } from '../../redux/slices/adminSlice';
import { fetchTutorReviews, postTutorReview } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';
import UserLayout from '../../components/common/UserLayout';

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
    <div className="bg-background-100 p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {/* Left Column: Profile Details */}
        <div className="bg-white rounded-xl shadow-sm border border-background-200 p-4 md:p-6 flex flex-col items-center">
          <img 
            src={singleTutor.profile_pic_url} 
            alt={`${singleTutor.first_name} ${singleTutor.last_name}`}
            className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-primary-100 mb-4"
          />
          <h2 className="text-lg md:text-xl font-bold text-text-700 text-center">
            {singleTutor.first_name} {singleTutor.last_name}
          </h2>
          <p className="text-text-600 mb-4 md:mb-6 text-center">{singleTutor.cur_job_role}</p>
          
          {/* Rating Display */}
          <div className="flex items-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={i < Math.floor(singleTutor.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
              />
            ))}
            <span className="text-text-600">
              ({singleTutor.rating?.toFixed(1)}) • {singleTutor.review_count} reviews
            </span>
          </div>

          {/* Report Button */}
          <button
            onClick={() => console.log('Report tutor')}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Report Tutor
          </button>

          {/* LinkedIn Link */}
          <div className="mt-4 md:mt-6 w-full">
            <a 
              href={singleTutor.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center text-primary-600 hover:text-primary-700"
            >
              <Linkedin className="h-5 w-5 mr-2" />
              LinkedIn Profile
            </a>
          </div>
        </div>

        {/* Right Column: About Me */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-background-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-text-700 mb-4">About Me</h3>
          <p className="text-text-600 leading-relaxed mb-4 md:mb-6">
            {singleTutor.bio}
          </p>

          {/* Personal Details Section */}
          <div className="border-t border-background-200 pt-4 space-y-3 md:space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary-600 flex-shrink-0" />
              <span className="text-text-600 break-all">{singleTutor.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary-600 flex-shrink-0" />
              <span className="text-text-600">{singleTutor.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-primary-600 flex-shrink-0" />
              <span className="text-text-600">{singleTutor.city}, {singleTutor.country}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-background-200">
        <div className="flex flex-col md:flex-row border-b border-background-200">
          {[
            { key: 'education', label: 'Education' },
            { key: 'experience', label: 'Work Experience' },
            { key: 'reviews', label: 'Reviews' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 md:px-6 py-3 ${
                activeTab === tab.key 
                  ? 'border-b-2 border-primary-600 text-primary-600 font-semibold' 
                  : 'text-text-600 hover:bg-background-100'
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
              {singleTutor.educations?.map((edu, index) => (
                <div 
                  key={index} 
                  className="bg-background-50 p-4 rounded-lg border border-background-200"
                >
                  <div className="flex items-start md:items-center mb-2">
                    <Book className="h-5 w-5 mr-3 text-primary-600 flex-shrink-0 mt-1 md:mt-0" />
                    <div>
                      <h3 className="text-text-700 font-semibold">{edu.degree}</h3>
                      <p className="text-text-600">{edu.university}</p>
                      <p className="text-text-600 text-sm">Graduated in {edu.year_of_passing}</p>
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
                  className="bg-background-50 p-4 rounded-lg border border-background-200"
                >
                  <div className="flex items-start md:items-center mb-2">
                    <Briefcase className="h-5 w-5 mr-3 text-primary-600 flex-shrink-0 mt-1 md:mt-0" />
                    <div>
                      <h3 className="text-text-700 font-semibold">{exp.job_role}</h3>
                      <p className="text-text-600">{exp.company}</p>
                      <p className="text-text-600 text-sm">
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
                <h3 className="text-xl font-semibold text-text-700">Student Reviews</h3>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Add Review
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {tutorReviewsData?.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm mb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={review.user.profile_pic_url}
                        alt={review.user.first_name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-text-700">
                          {review.user.first_name} {review.user.last_name}
                        </p>
                        <div className="flex items-center gap-1">
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
                    <p className="text-text-600">{review.review}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onClose={() => setShowReviewModal(false)}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-2xl font-bold text-text-700 mb-6">
              Write a Review
            </Dialog.Title>

            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className="transform hover:scale-110 transition-transform"
                  >
                    <Star
                      size={28}
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
                className="w-full h-32 px-4 py-3 border border-background-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-text-600 hover:bg-background-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
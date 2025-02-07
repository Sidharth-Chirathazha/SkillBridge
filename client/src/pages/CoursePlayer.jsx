import React, { useEffect, useState } from 'react';
import { Star, FileText, ThumbsUp } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviews, fetchSingleCourse, postReview } from '../redux/slices/courseSlice';
import UserLayout from '../components/common/UserLayout';

const CoursePlayer = () => {
  const dispatch = useDispatch();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [currentModule, setCurrentModule] = useState(null);
  const { id } = useParams();

  const { singleCourse, isCourseLoading, reviewsData } = useSelector((state) => state.course);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        await dispatch(fetchSingleCourse(id)).unwrap();
      } catch (error) {
        console.error('Failed to fetch course:', error);
      }
    };
    fetchCourse();
  }, [dispatch, id]);

  // Set initial module
  useEffect(() => {
    if (singleCourse?.modules?.length > 0) {
      setCurrentModule(singleCourse.modules[0]);
    }
  }, [singleCourse?.modules]);

  // Fetch reviews when slug is available
  useEffect(() => {
    const fetchCourseReviews = async () => {
      try {
        if (singleCourse?.slug) {
          await dispatch(fetchReviews(singleCourse.slug)).unwrap();
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };
    fetchCourseReviews();
  }, [dispatch, singleCourse?.slug]);

  const handleModuleChange = (moduleId) => {
    const selectedModule = singleCourse.modules.find(module => module.id === moduleId);
    setCurrentModule(selectedModule);
  };

  const handleSubmitReview = async () => {
    try {
      await dispatch(postReview({
        course: singleCourse.id,
        review: review,
        rating: rating,
      })).unwrap();
      
      await dispatch(fetchReviews(singleCourse.slug)).unwrap();
      setShowReviewModal(false);
      setRating(0);
      setReview('');
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (isCourseLoading || !singleCourse) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <UserLayout>
    <div className="min-h-screen bg-background-100">
      {/* Video Player Section */}
      <div className="w-full bg-primary-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="aspect-video w-full">
            <video
              className="w-full h-full"
              controls
              src={currentModule?.video}
              poster={singleCourse.thumbnail}
              key={currentModule?.id}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Course Header */}
            <div>
              <h1 className="text-3xl font-bold text-text-700">{singleCourse.title}</h1>
              <p className="text-lg text-text-600 mt-2">
                by {singleCourse.tutor.first_name} {singleCourse.tutor.last_name}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(singleCourse.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
                <span className="text-text-600">
                  ({singleCourse.rating.toFixed(1)}) • {reviewsData?.length || 0} reviews
                </span>
              </div>
            </div>

            {/* Current Module Content */}
            {currentModule && (
              <div>
                <h2 className="text-2xl font-semibold text-text-700 mb-4">
                  {currentModule.title}
                </h2>
                <p className="text-text-600 mb-6">{currentModule.description}</p>
                <a
                  href={currentModule.tasks}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText size={18} />
                  Download Lesson Materials
                </a>
              </div>
            )}

            {/* Reviews Section */}
            <div className="pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-text-700">Student Reviews</h3>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
                >
                  Add Review
                </button>
              </div>

              {reviewsData?.map((review) => (
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

          {/* Right Sidebar - Course Modules */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-700 mb-4">Course Content</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {singleCourse.modules?.map((module, index) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleChange(module.id)}
                  className={`w-full px-4 py-3 text-left border-b border-background-200 last:border-b-0 hover:bg-background-50 transition-colors ${
                    currentModule?.id === module.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-text-700">
                        {index + 1}. {module.title}
                      </p>
                      <p className="text-sm text-text-500 mt-1">{module.duration} minutes</p>
                    </div>
                    {currentModule?.id === module.id && (
                      <ThumbsUp size={18} className="text-primary-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
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
                placeholder="Share your experience with this course..."
                className="w-full h-32 px-4 py-3 border border-background-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
    </UserLayout>
  );
};

export default CoursePlayer;
import React, { useEffect, useState } from 'react';
import { Star, FileText, ThumbsUp, MessageSquare,ChevronUp, ChevronDown } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComments, fetchReviews, fetchSingleCourse, postComment, postReview } from '../redux/slices/courseSlice';
import TutorVerificationMessage from '../components/tutor/TutorVerificationMessage';


// const fetchComments = (courseSlug) => async () => []; // Replace with actual API call
// const postComment = (commentData) => async () => {};  // Replace with actual API call

const CoursePlayer = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('reviews');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [currentModule, setCurrentModule] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const { id } = useParams();

  const { singleCourse, isCourseLoading, reviewsData, commentsData } = useSelector((state) => state.course);

  const {role, userData} = useSelector((state)=>state.auth);

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

  // Fetch comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await dispatch(fetchComments(singleCourse?.id)).unwrap();
        setComments(response);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };
    if (activeTab === 'comments' && singleCourse?.id) {
      loadComments();
    }
  }, [dispatch, singleCourse?.id, activeTab]);


  const toggleReplies = (commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleSubmitComment = async (parentId = null) => {
    try {
      await dispatch(postComment({
        courseId:singleCourse?.id, 
        newComment: newComment,
        parentId : parentId
        })).unwrap();
      
      const response = await dispatch(fetchComments(singleCourse.id)).unwrap();
      setComments(response);
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

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
    <>
    {role === "tutor" && userData?.is_verified === false ? (
        <TutorVerificationMessage/>
    ) :(
      <div className="min-h-screen bg-background-100">
        {/* Enhanced Video Player Section */}
        <div className="w-full bg-primary-900 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl">
              <video
                className="w-full h-full object-cover"
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
              {/* Enhanced Course Header */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h1 className="text-3xl font-bold text-text-700 mb-2">{singleCourse.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={singleCourse.tutor.profile_pic}
                    alt={singleCourse.tutor.first_name}
                    className="w-12 h-12 rounded-full border-2 border-primary-100"
                  />
                  <div>
                    <p className="text-lg font-medium text-text-700">
                      {singleCourse.tutor.first_name} {singleCourse.tutor.last_name}
                    </p>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < Math.floor(singleCourse.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                        />
                      ))}
                      <span className="text-sm text-text-600">
                        ({singleCourse.rating.toFixed(1)}) • {reviewsData?.length || 0} reviews
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Current Module Content */}
              {currentModule && (
                <div className="bg-background-500 rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold text-text-700 mb-4">
                    {currentModule.title}
                  </h2>
                  <p className="text-text-600 mb-6 leading-relaxed">{currentModule.description}</p>
                  <a
                    href={currentModule.tasks}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-all transform hover:-translate-y-0.5"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText size={18} />
                    Download Lesson Materials
                  </a>
                </div>
              )}

              {/* Enhanced Reviews & Comments Section */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-background-200">
                  <div className="flex gap-1 p-1">
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`flex-1 px-6 py-3 text-sm font-medium rounded-t-lg transition-all ${
                        activeTab === 'reviews' 
                          ? 'bg-secondary-500 text-white shadow-lg' 
                          : 'hover:bg-background-100 text-text-600'
                      }`}
                    >
                      Reviews ({reviewsData?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('comments')}
                      className={`flex-1 px-6 py-3 text-sm font-medium rounded-t-lg transition-all ${
                        activeTab === 'comments' 
                          ? 'bg-secondary-500 text-white shadow-lg' 
                          : 'hover:bg-background-100 text-text-600'
                      }`}
                    >
                      Comments ({comments.length || 0})
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-all transform hover:-translate-y-0.5 shadow-sm"
                        >
                          Add Review
                        </button>
                      </div>
                      
                      {reviewsData?.map((review) => (
                        <div key={review.id} className="border border-background-200 rounded-xl p-6 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4 mb-4">
                            <img
                              src={review.user.profile_pic_url}
                              alt={review.user.first_name}
                              className="w-12 h-12 rounded-full border-2 border-primary-100"
                            />
                            <div>
                              <p className="font-medium text-text-700">
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
                          <p className="text-text-600 leading-relaxed">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'comments' && (
                    <div className="space-y-6">
                      <div className="border border-background-200 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <MessageSquare className="text-primary-600" />
                          <h4 className="text-lg font-semibold">Leave a Comment</h4>
                        </div>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts about this course..."
                          className="w-full h-24 px-4 py-3 border rounded-lg mb-4 focus-visible:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-transparent"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleSubmitComment()}
                            className="px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-all transform hover:-translate-y-0.5 shadow-sm"
                          >
                            Post Comment
                          </button>
                        </div>
                      </div>

                      {commentsData.length > 0 ? (
                        <div className="space-y-4">
                          {commentsData.map((comment) => (
                            <div key={comment.id} className="bg-white">
                              <div className="border border-background-200 rounded-xl p-6 hover:shadow-md transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                  <img
                                    src={comment.profile_pic}
                                    alt={comment.user_name}
                                    className="w-10 h-10 rounded-full border-2 border-primary-100"
                                  />
                                  <div>
                                    <p className="font-medium text-text-700">{comment.user_name}</p>
                                    <p className="text-sm text-text-500">
                                      {new Date(comment.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                
                                <p className="text-text-600 mb-4 leading-relaxed">{comment.content}</p>
                                
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    className="text-text-400 hover:text-text-600 text-sm font-medium"
                                  >
                                    Reply
                                  </button>

                                  {comment.replies && comment.replies.length > 0 && (
                                    <button
                                      onClick={() => toggleReplies(comment.id)}
                                      className="flex items-center gap-2 text-text-400 hover:text-text-600 text-sm font-medium"
                                    >
                                      {expandedComments.has(comment.id) ? (
                                        <>
                                          <ChevronUp size={16} />
                                          Hide Replies ({comment.replies.length})
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown size={16} />
                                          Show Replies ({comment.replies.length})
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {replyingTo === comment.id && (
                                  <div className="mt-4 flex gap-2">
                                    <input
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      placeholder="Write a reply..."
                                      className="flex-1 px-4 py-2 border rounded-lg focus-visible:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-transparent"
                                    />
                                    <button
                                      onClick={() => handleSubmitComment(comment.id)}
                                      className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-all shadow-sm"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Replies section */}
                              {comment.replies && comment.replies.length > 0 && expandedComments.has(comment.id) && (
                                <div className="pl-4 border-l-2 border-background-200 ml-6 mt-4 space-y-4">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id}>
                                      <div className="border border-background-200 rounded-xl p-6 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4 mb-4">
                                          <img
                                            src={reply.profile_pic}
                                            alt={reply.user_name}
                                            className="w-10 h-10 rounded-full border-2 border-primary-100"
                                          />
                                          <div>
                                            <p className="font-medium text-text-700">{reply.user_name}</p>
                                            <p className="text-sm text-text-500">
                                              {new Date(reply.created_at).toLocaleDateString()}
                                            </p>
                                          </div>
                                        </div>
                                        
                                        <p className="text-text-600 mb-4 leading-relaxed">{reply.content}</p>
                                        
                                        <button
                                          onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                                          className="text-text-400 hover:text-text-600 text-sm font-medium"
                                        >
                                          Reply
                                        </button>

                                        {replyingTo === reply.id && (
                                          <div className="mt-4 flex gap-2">
                                            <input
                                              value={newComment}
                                              onChange={(e) => setNewComment(e.target.value)}
                                              placeholder="Write a reply..."
                                              className="flex-1 px-4 py-2 border rounded-lg focus-visible:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-transparent"
                                            />
                                            <button
                                              onClick={() => handleSubmitComment(reply.id)}
                                              className="px-4 py-2 bg-text-400 text-white rounded-lg hover:bg-text-600 transition-all shadow-sm"
                                            >
                                              Reply
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-text-600 text-center py-8">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Right Sidebar - Course Modules */}
            <div className="md:mt-24">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 border-b border-background-200">
                  <h3 className="text-xl font-semibold text-text-700">Course Content</h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {singleCourse.modules?.map((module, index) => (
                    <button
                      key={module.id}
                      onClick={() => handleModuleChange(module.id)}
                      className={`w-full p-4 text-left border-b border-background-200 last:border-b-0 hover:bg-background-50 transition-all ${
                        currentModule?.id === module.id ? 'bg-background-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-text-700 mb-1">
                            {index + 1}. {module.title}
                          </p>
                          <p className="text-sm text-text-500">{module.duration} minutes</p>
                        </div>
                        {currentModule?.id === module.id && (
                          <ThumbsUp size={18} className="text-primary-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Review Modal */}
        <Dialog open={showReviewModal} onClose={() => setShowReviewModal(false)}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl">
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
                  placeholder="Share your experience with this course..."
                  className="w-full h-32 px-4 py-3 border border-background-300 rounded-lg focus-visible:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-transparent"
                />

                <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="px-6 py-2 text-text-600 hover:bg-background-100 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      className="px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-all transform hover:-translate-y-0.5 shadow-sm"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default CoursePlayer;
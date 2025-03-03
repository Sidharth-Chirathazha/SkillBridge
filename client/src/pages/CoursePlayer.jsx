import React, { useEffect, useState } from 'react';
import { Star, FileText, ThumbsUp, MessageSquare,ChevronUp, ChevronDown, Trash2, Clock } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteComment, fetchComments, fetchReviews, fetchSingleCourse, postComment, postReview } from '../redux/slices/courseSlice';
import TutorVerificationMessage from '../components/tutor/TutorVerificationMessage';
import { ConfirmDialog } from '../components/common/ui/ConfirmDialog';


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
        await dispatch(fetchSingleCourse({id,user:true})).unwrap();
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

  console.log(currentModule?.tasks);
  

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

  const handleDeleteComment = async (commentId) => {
    try {
      await dispatch(deleteComment(commentId)).unwrap();

      const response = await dispatch(fetchComments(singleCourse.id)).unwrap();
      setComments(response);
      setNewComment('');
      setReplyingTo(null);

    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  console.log("Comments:", commentsData);
  console.log("User:", userData);
  


  
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
        <TutorVerificationMessage />
      ) : (
        <div className="min-h-screen bg-background-100">
          {/* Immersive Video Player Section */}
          <div className="w-full bg-primary-900 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
              <div className="aspect-video w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl">
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
          <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Content */}
              <div className="md:col-span-2 space-y-6">
                {/* Enhanced Course Header */}
                <div className="bg-white rounded-xl p-6 shadow-md transition-all hover:shadow-lg border border-background-200">
                  <h1 className="text-2xl md:text-3xl font-bold text-text-700 mb-3">{singleCourse.title}</h1>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={singleCourse.tutor.profile_pic}
                      alt={singleCourse.tutor.first_name}
                      className="w-12 h-12 rounded-full border-2 border-primary-100 shadow-sm"
                    />
                    <div>
                      <p className="text-lg font-medium text-text-700">
                        {singleCourse.tutor.first_name} {singleCourse.tutor.last_name}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < Math.floor(singleCourse.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                          />
                        ))}
                        <span className="text-sm text-text-600 ml-1">
                          ({singleCourse.rating.toFixed(1)}) • {reviewsData?.length || 0} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* Enhanced Current Module Content */}
                {currentModule && (
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-l-primary-500 border-t border-r border-b border-background-200 transition-all hover:shadow-lg">
                    <h2 className="text-xl md:text-2xl font-semibold text-text-700 mb-4">
                      {currentModule.title}
                    </h2>
                    <p className="text-text-600 mb-6 leading-relaxed">{currentModule.description}</p>
                    <a
                      href={`${currentModule.tasks}?response-content-disposition=attachment`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all transform hover:-translate-y-1 hover:shadow-md"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText size={18} />
                      Download Lesson Materials
                    </a>
                  </div>
                )}
  
                {/* Enhanced Reviews & Comments Section with Modern Tabs */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-background-200 transition-all hover:shadow-lg">
                  <div className="border-b border-background-200">
                    <div className="flex p-1 bg-background-100 rounded-t-lg">
                      <button
                        onClick={() => setActiveTab('reviews')}
                        className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                          activeTab === 'reviews' 
                            ? 'bg-white text-primary-500 shadow-sm' 
                            : 'hover:bg-background-200 text-text-600'
                        }`}
                      >
                        Reviews ({reviewsData?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab('comments')}
                        className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                          activeTab === 'comments' 
                            ? 'bg-white text-primary-500 shadow-sm' 
                            : 'hover:bg-background-200 text-text-600'
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
                            className="px-5 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-all transform hover:-translate-y-1 hover:shadow-md flex items-center gap-2"
                          >
                            <Star size={16} className="fill-white text-white" />
                            Add Review
                          </button>
                        </div>
                        
                        {reviewsData?.length > 0 ? (
                          <div className="grid gap-4 sm:grid-cols-1">
                            {reviewsData?.map((review) => (
                              <div key={review.id} className="border border-background-200 rounded-xl p-5 hover:shadow-md transition-all bg-background-50">
                                <div className="flex items-center gap-4 mb-3">
                                  <img
                                    src={review.user.profile_pic_url}
                                    alt={review.user.first_name}
                                    className="w-10 h-10 rounded-full border-2 border-primary-100"
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
                        ) : (
                          <div className="text-center py-8 bg-background-50 rounded-lg border border-dashed border-background-300">
                            <p className="text-text-500 mb-2">No reviews yet</p>
                            <p className="text-sm text-text-400">Be the first to share your experience!</p>
                          </div>
                        )}
                      </div>
                    )}
  
                    {activeTab === 'comments' && (
                      <div className="space-y-6">
                        <div className="border border-background-200 rounded-xl p-5 bg-background-50">
                          <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="text-primary-500" />
                            <h4 className="text-lg font-semibold text-text-700">Leave a Comment</h4>
                          </div>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts about this course..."
                            className="w-full h-24 px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleSubmitComment()}
                              className="px-5 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all transform hover:-translate-y-1 hover:shadow-md flex items-center gap-2"
                            >
                              <MessageSquare size={16} />
                              Post Comment
                            </button>
                          </div>
                        </div>
  
                        {commentsData.length > 0 ? (
                          <div className="space-y-4">
                            {commentsData
                            .filter(comment => !comment.parent)
                            .map((comment) => (
                              <div key={comment.id} className="bg-white">
                                <div className="border border-background-200 rounded-xl p-5 hover:shadow-md transition-all">
                                  <div className="flex items-center gap-4 mb-3">
                                    <img
                                      src={comment.profile_pic}
                                      alt={comment.user_name}
                                      className="w-10 h-10 rounded-full border-2 border-primary-100"
                                    />
                                    <div className="flex-grow">
                                      <p className="font-medium text-text-700">{comment.user_name}</p>
                                      <p className="text-sm text-text-500">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                    {/* Delete Icon - Visible only to the comment owner */}
                                    {comment.user === userData?.user?.id && (
                                      <ConfirmDialog
                                        trigger={(open)=>(
                                          <button
                                            onClick={open}
                                            className="ml-auto text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        )}
                                        title="Delete Comment"
                                        description={"Are you sure you want to delete the comment you posted?"}
                                        confirmText='Delete'
                                        destructive
                                        onConfirm={() => handleDeleteComment(comment.id)}
                                        variant='user'
                                      />
                                    )}
                                  </div>
                                  
                                  <p className="text-text-600 mb-4 leading-relaxed">{comment.content}</p>
                                  
                                  <div className="flex items-center gap-4">
                                    <button
                                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                      className="text-text-400 hover:text-primary-500 text-sm font-medium flex items-center gap-1 transition-colors"
                                    >
                                      <MessageSquare size={14} />
                                      Reply
                                    </button>
  
                                    {comment.replies && comment.replies.length > 0 && (
                                      <button
                                        onClick={() => toggleReplies(comment.id)}
                                        className="flex items-center gap-1 text-text-400 hover:text-primary-500 text-sm font-medium transition-colors"
                                      >
                                        {expandedComments.has(comment.id) ? (
                                          <>
                                            <ChevronUp size={14} />
                                            Hide Replies ({comment.replies.length})
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown size={14} />
                                            Show Replies ({comment.replies.length})
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
  
                                  {replyingTo === comment.id && (
                                    <div className="mt-4 flex gap-2 items-center">
                                      <input
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
                                      />
                                      <button
                                        onClick={() => handleSubmitComment(comment.id)}
                                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all hover:shadow-md whitespace-nowrap"
                                      >
                                        Reply
                                      </button>
                                    </div>
                                  )}
                                </div>
  
                                {/* Replies section */}
                                {comment.replies && comment.replies.length > 0 && expandedComments.has(comment.id) && (
                                  <div className="pl-4 border-l-2 border-primary-100 ml-6 mt-4 space-y-4">
                                    {comment.replies.map((reply) => (
                                      <div key={reply.id}>
                                        <div className="border border-background-200 rounded-xl p-5 hover:shadow-md transition-all bg-background-50">
                                          <div className="flex items-center gap-4 mb-3">
                                            <img
                                              src={reply.profile_pic}
                                              alt={reply.user_name}
                                              className="w-8 h-8 rounded-full border-2 border-primary-100"
                                            />
                                            <div className="flex-grow">
                                              <p className="font-medium text-text-700">{reply.user_name}</p>
                                              <p className="text-xs text-text-500">
                                                {new Date(reply.created_at).toLocaleDateString()}
                                              </p>
                                            </div>
                                            {/* Delete Icon for replies - Only visible to the owner */}
                                            {reply.user === userData?.user?.id && (
                                              <ConfirmDialog
                                                trigger={(open)=>(
                                                  <button
                                                    onClick={open}
                                                    className="ml-auto text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                  >
                                                    <Trash2 size={16} />
                                                  </button>
                                                )}
                                                title="Delete Comment"
                                                description={"Are you sure you want to delete the comment you posted?"}
                                                confirmText='Delete'
                                                destructive
                                                onConfirm={() => handleDeleteComment(reply.id)}
                                                variant='user'
                                              />
                                            )}
                                          </div>
                                          
                                          <p className="text-text-600 mb-3 leading-relaxed">{reply.content}</p>
                                          
                                          <button
                                            onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                                            className="text-text-400 hover:text-primary-500 text-sm font-medium flex items-center gap-1 transition-colors"
                                          >
                                            <MessageSquare size={14} />
                                            Reply
                                          </button>
  
                                          {replyingTo === reply.id && (
                                            <div className="mt-3 flex gap-2 items-center">
                                              <input
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Write a reply..."
                                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
                                              />
                                              <button
                                                onClick={() => handleSubmitComment(reply.id)}
                                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all hover:shadow-md whitespace-nowrap"
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
                          <div className="text-center py-8 bg-background-50 rounded-lg border border-dashed border-background-300">
                            <p className="text-text-500 mb-2">No comments yet</p>
                            <p className="text-sm text-text-400">Be the first to start the conversation!</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
  
              {/* Enhanced Right Sidebar - Course Modules */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24 border border-background-200 transition-all hover:shadow-lg">
                  <div className="p-5 border-b border-background-200 bg-background-50">
                    <h3 className="text-lg font-semibold text-text-700 flex items-center gap-2">
                      <FileText size={18} className="text-primary-500" />
                      Course Content
                    </h3>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto">
                    {singleCourse.modules?.map((module, index) => (
                      <button
                        key={module.id}
                        onClick={() => handleModuleChange(module.id)}
                        className={`w-full p-4 text-left border-b border-background-200 last:border-b-0 transition-all hover:bg-background-50 ${
                          currentModule?.id === module.id ? 'bg-primary-50 border-l-4 border-l-primary-500 pl-3' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                currentModule?.id === module.id 
                                  ? 'bg-primary-500 text-white' 
                                  : 'bg-background-200 text-text-500'
                              }`}>
                                {index + 1}
                              </div>
                              <p className={`font-medium ${
                                currentModule?.id === module.id ? 'text-primary-700' : 'text-text-700'
                              }`}>
                                {module.title}
                              </p>
                            </div>
                            <p className="text-xs text-text-500 mt-1 ml-8 flex items-center gap-1">
                              <Clock size={12} />
                              {module.duration} minutes
                            </p>
                          </div>
                          {currentModule?.id === module.id && (
                            <ThumbsUp size={16} className="text-primary-500 flex-shrink-0" />
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl border border-background-200">
                <Dialog.Title className="text-2xl font-bold text-text-700 mb-6 flex items-center gap-2">
                  <Star size={20} className="text-yellow-400" />
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
                          size={36}
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
                    className="w-full h-32 px-4 py-3 border border-background-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
                  />
  
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="px-5 py-2.5 text-text-600 hover:bg-background-100 rounded-lg transition-all border border-background-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      className="px-5 py-2.5 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-all transform hover:-translate-y-1 hover:shadow-md flex items-center gap-2"
                    >
                      <Star size={16} className="fill-white text-white" />
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
}

export default CoursePlayer;
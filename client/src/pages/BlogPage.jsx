import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import BlogCard from '../components/BlogCard';
import BlogFormModal from '../components/BlogFormModal';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axios.Config';
import { ConfirmDialog } from '../components/common/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import TutorVerificationMessage from '../components/tutor/TutorVerificationMessage';

// Main Blog Page Component
const BlogPage = ({isAdminView = false}) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const {userData, role} = useSelector((state)=>state.auth)
  const { adminData } = useSelector((state) => state.admin);
  const [currentUser, setCurrentUser] = useState(null);
  const [deletingBlogId, setDeletingBlogId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);

  useEffect(() => {
    // Fetch current user info
    if (isAdminView && adminData) {
      setCurrentUser(adminData);
    } else if (!isAdminView && userData) {
      setCurrentUser(userData);
    }

    fetchInitialBlogs();
  }, [isAdminView, userData, adminData]);

  const fetchInitialBlogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/blogs/?page=1');
      setBlogs(response.data.results);
      setNextPageUrl(response.data.next);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  const loadMoreBlogs = async () => {
    if (!nextPageUrl) return;
    
    try {
      setLoadingMore(true);
      // Extract the full URL from nextPageUrl
      const response = await axiosInstance.get(nextPageUrl);
      setBlogs([...blogs, ...response.data.results]);
      setNextPageUrl(response.data.next);
      setLoadingMore(false);
    } catch (error) {
      console.error('Error loading more blogs:', error);
      setLoadingMore(false);
    }
  };

  const handleAddBlog = () => {
    setEditBlog(null);
    setShowAddModal(true);
  };

  const handleEditBlog = (blog) => {
    setEditBlog(blog);
    setShowAddModal(true);
  };

  const handleConfirmDeleteBlog = (blogId) => {
    setDeletingBlogId(blogId);
    setShowDeleteDialog(true);
  };

  const handleDeleteBlog = async () => {
      try {
        await axiosInstance.delete(`/blogs/${deletingBlogId}/`, {requiresAuth:true});
        setBlogs(blogs.filter(blog => blog.id !== deletingBlogId));
        toast.success("Blog deleted successfully")
        return Promise.resolve();
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error("An error occured while deleting blog")
        return Promise.reject(error);
      }
  };

  const handleLikeBlog = async (blogId) => {
    try {
      await axiosInstance.post(`/blogs/${blogId}/like/`, {requiresAuth:true});
      
      // Update the blog likes in the state
      setBlogs(blogs.map(blog => {
        if (blog.id === blogId) {
          const userLiked = blog.likes.includes(currentUser?.user?.id);
          return {
            ...blog,
            likes: userLiked 
              ? blog.likes.filter(id => id !== currentUser?.user?.id) 
              : [...blog.likes, currentUser?.user?.id],
            total_likes: userLiked ? blog.total_likes - 1 : blog.total_likes + 1
          };
        }
        return blog;
      }));
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleBlogSubmit = async (blogData) => {
    try {
      const config = {
        requiresAuth: true,
        headers: {} // Let Axios set the Content-Type for FormData
      };
      if (editBlog) {
        // Update existing blog
        setLoading(true);
        const response = await axiosInstance.patch(`/blogs/${editBlog.id}/`, blogData, config);
        setBlogs(blogs.map(blog => blog.id === editBlog.id ? response.data : blog));
        toast.success("Blog edited successfully")
        setLoading(false);
      } else {
        // Create new blog
        setLoading(true);
        const response = await axiosInstance.post('/blogs/', blogData, config);
        setBlogs([response.data, ...blogs]);
        toast.success("New blog added")
        setLoading(false);
      }
      setShowAddModal(false);
    } catch (error) {
      console.error('Error submitting blog:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
     { role === "tutor" && userData?.is_verified === false ? (
        <TutorVerificationMessage/>
      ) :(
      <div className="bg-background min-h-screen pb-20">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-background-50 rounded-lg shadow-md p-6 mb-8 flex justify-between items-center">
          <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {isAdminView ? 'Manage Blogs' : 'Dive into Discussions'}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                {isAdminView 
                  ? 'Review and manage blog content across the platform.' 
                  : 'Read, write, and engage with inspiring content.'}
              </p>
            </div>
            {!isAdminView && (
              <button 
                onClick={handleAddBlog} 
                className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-secondary-600 transition-colors"
              >
                <FaPlus /> Add Blog
              </button>
            )}
          </div>

          <div className="max-w-2xl mx-auto">
            {blogs.map(blog => (
              <BlogCard 
                key={blog.id} 
                blog={blog} 
                currentUser={currentUser}
                onEdit={!isAdminView ? handleEditBlog : null}
                onDelete={handleConfirmDeleteBlog}
                onLike={handleLikeBlog}
                isAdminView={isAdminView}
              />
            ))}

            {/* Load More Button */}
            {nextPageUrl && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={loadMoreBlogs} 
                  disabled={loadingMore}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <span className="inline-block mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                      Loading...
                    </>
                  ) : 'Load More'}
                </button>
              </div>
            )}
          </div>

          {blogs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-text-400 text-lg">
                {isAdminView
                  ? 'No blogs have been posted yet.'
                  : 'No blogs have been posted yet. Be the first to share!'}
              </p>
            </div>
          )}
        </div>

        {showAddModal && (
          <BlogFormModal 
            blog={editBlog} 
            onClose={() => setShowAddModal(false)} 
            onSubmit={handleBlogSubmit} 
          />
        )}
        {/* Delete Blog Confirmation Dialog */}
        <ConfirmDialog
          title="Delete Blog"
          description="Are you sure you want to delete this blog post? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteBlog}
          isOpen={showDeleteDialog}
          setIsOpen={setShowDeleteDialog}
          destructive={true}
        />
      </div>
      )}
    </>
  );
};

export default BlogPage;
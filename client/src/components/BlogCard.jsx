import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHeart, FaRegHeart, FaComment, FaEdit, FaTrash } from 'react-icons/fa';
import Comment from './Comment';
import axiosInstance from '../api/axios.Config';
import { ConfirmDialog } from './common/ui/ConfirmDialog';



// Blog Card Component
const BlogCard = ({ blog, currentUser, onEdit, onDelete, onLike }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState(blog.comments || []);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false);
  
    const isAuthor = currentUser && blog?.author?.id === currentUser?.user?.id;
    const userLiked = blog.likes.includes(currentUser?.user?.id);
    
    const toggleComments = () => {
      setShowComments(!showComments);
    };
  
    const handleAddComment = async (e) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      
      try {
        const response = await axiosInstance.post('/blog-comments/', {
          blog: blog.id,
          content: newComment,
          parent: null
        }, {requiresAuth:true});
        
        setComments([response.data, ...comments]);
        setNewComment('');
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };

    const handleConfirmDeleteComment = (commentId) => {
        setDeletingCommentId(commentId);
        setShowDeleteCommentDialog(true);
      };
  
    const handleDeleteComment = async () => {
        try {
          await axiosInstance.delete(`/blog-comments/${deletingCommentId}/`, {requiresAuth:true});
          
          // Recursively filter out the deleted comment and its replies
          const filterComments = (commentsArray, idToDelete) => {
            return commentsArray.filter(comment => {
              if (comment.id === idToDelete) return false;
              
              if (comment.replies && comment.replies.length > 0) {
                comment.replies = filterComments(comment.replies, idToDelete);
              }
              
              return true;
            });
          };
          
          setComments(filterComments(comments, deletingCommentId));
          return Promise.resolve();
        } catch (error) {
          console.error('Error deleting comment:', error);
          return Promise.reject(error);
        }
    };
  
    const handleAddReply = async (parentId, content) => {
      try {
        const response = await axiosInstance.post('/blog-comments/', {
          blog: blog.id,
          content,
          parent: parentId
        }, {requiresAuth:true});
        
        // Update the comments state to include the new reply
        const updateReplies = (commentsArray, parentCommentId, newReply) => {
          return commentsArray.map(comment => {
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply]
              };
            }
            
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateReplies(comment.replies, parentCommentId, newReply)
              };
            }
            
            return comment;
          });
        };
        
        setComments(updateReplies(comments, parentId, response.data));
      } catch (error) {
        console.error('Error adding reply:', error);
      }
    };
  
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow mb-6">
        <div className="p-4">
            <div className="flex items-center mb-4">
            <img 
                src={blog.author.profile_pic_url || '/default-avatar.png'} 
                alt={blog.author.full_name} 
                className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div className="flex-1">
                <p className="font-medium text-text">{blog.author.full_name}</p>
                <p className="text-sm text-text-400">
                {new Date(blog.created_at).toLocaleDateString()}
                {blog.created_at !== blog.updated_at && ' (edited)'}
                </p>
            </div>
            
            {isAuthor && (
                <div className="flex gap-2">
                <button 
                    onClick={() => onEdit(blog)} 
                    className="text-primary hover:text-primary-600 transition-colors"
                >
                    <FaEdit />
                </button>
                <button 
                    onClick={() => onDelete(blog.id)} 
                    className="text-red-500 hover:text-red-600 transition-colors"
                >
                    <FaTrash />
                </button>
                </div>
            )}
            </div>
            
            <h2 className="text-xl font-bold mb-3 text-text">{blog.title}</h2>
            <p className="text-text-400 mb-4">{blog.description}</p>
        </div>
        
        <img 
            src={blog.thumbnail} 
            alt={blog.title} 
            className="w-full h-auto max-h-96 object-cover" 
        />
        
        <div className="p-4">
            <div className="flex border-t pt-3">
            <button 
                onClick={() => onLike(blog.id)} 
                className="flex items-center mr-6 text-text-400 hover:text-secondary transition-colors"
            >
                {userLiked ? <FaHeart className="text-secondary" /> : <FaRegHeart />}
                <span className="ml-1">{blog.total_likes}</span>
            </button>
            <button 
                onClick={toggleComments} 
                className="flex items-center text-text-400 hover:text-primary transition-colors"
            >
                <FaComment />
                <span className="ml-1">{comments.length}</span>
            </button>
            </div>
        </div>
        
        {showComments && (
          <div className="p-4 border-t bg-background-100">
            <form onSubmit={handleAddComment} className="mb-4 flex">
              <input 
                type="text" 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder="Add a comment..." 
                className="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button 
                type="submit" 
                className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary-600"
              >
                Post
              </button>
            </form>
            
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map(comment => (
                  <Comment 
                    key={comment.id} 
                    comment={comment} 
                    currentUser={currentUser}
                    onDelete={handleConfirmDeleteComment}
                    onReply={handleAddReply}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-text-400 py-2">No comments yet. Be the first to comment!</p>
            )}
          </div>
        )}
         <ConfirmDialog
            title="Delete Comment"
            description="Are you sure you want to delete this comment? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDeleteComment}
            isOpen={showDeleteCommentDialog}
            setIsOpen={setShowDeleteCommentDialog}
            destructive={true}
        />
      </div>
    );
  };

export default BlogCard;
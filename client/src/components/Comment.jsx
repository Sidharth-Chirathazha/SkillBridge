import React, { useState, useEffect } from 'react';
import {FaTrash, FaReply} from 'react-icons/fa';


// Comment Component
const Comment = ({ comment, currentUser, onDelete, onReply, depth = 0, isAdminView = false }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    
    const isCommentOwner = !isAdminView &&  currentUser && comment.user.id === currentUser.user.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const maxDepth = 3; // Limit nesting depth
    
    const toggleReplies = () => {
      setShowReplies(!showReplies);
    };
    
    const toggleReplyForm = () => {
      if (isAdminView) return;
      setIsReplying(!isReplying);
      setReplyText('');
    };
    
    const handleSubmitReply = (e) => {
      e.preventDefault();
      if (!replyText.trim()) return;
      
      onReply(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
      setShowReplies(true); // Show replies after adding a new one
    };
    
    return (
      <div className={`pl-${depth > 0 ? '4' : '0'}`}>
        <div className="flex items-start">
          <img 
            src={comment.user.profile_pic_url || '/default-avatar.png'} 
            alt={comment.user.full_name} 
            className="w-8 h-8 rounded-full mr-2 mt-1 object-cover"
          />
          <div className="flex-1">
            <div className="bg-white p-3 rounded-lg">
              <div className="flex justify-between items-start">
                <p className="font-medium text-text">{comment.user.full_name}</p>
                <div className="text-xs text-text-400">
                  {new Date(comment.created_at).toLocaleString()}
                </div>
              </div>
              <p className="text-text mt-1">{comment.content}</p>
            </div>
            
            <div className="flex items-center mt-1 ml-1 text-sm">
              {!isAdminView &&  depth < maxDepth && (
                <button 
                  onClick={toggleReplyForm} 
                  className="text-text-400 hover:text-primary mr-3 flex items-center"
                >
                  <FaReply className="mr-1" /> Reply
                </button>
              )}
              
              {hasReplies && (
                <button 
                  onClick={toggleReplies} 
                  className="text-text-400 hover:text-primary flex items-center"
                >
                  {showReplies ? 'Hide replies' : `Show ${comment.replies.length} replies`}
                </button>
              )}
              
              {isCommentOwner && (
                <button 
                  onClick={() => onDelete(comment.id)} 
                  className="text-text-400 hover:text-red-500 ml-auto"
                >
                  <FaTrash />
                </button>
              )}
            </div>
            
            {isReplying && (
              <form onSubmit={handleSubmitReply} className="mt-2 flex">
                <input 
                  type="text" 
                  value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)} 
                  placeholder={`Reply to ${comment.user.full_name}...`} 
                  className="flex-1 px-3 py-1 text-sm border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button 
                  type="submit" 
                  className="bg-primary text-white px-3 py-1 text-sm rounded-r-lg hover:bg-primary-600"
                >
                  Post
                </button>
              </form>
            )}
            
            {showReplies && hasReplies && (
              <div className="mt-2 space-y-3">
                {comment.replies.map(reply => (
                  <Comment 
                    key={reply.id} 
                    comment={reply} 
                    currentUser={currentUser}
                    onDelete={onDelete}
                    onReply={onReply}
                    depth={depth + 1}
                    isAdminView={isAdminView}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

export default Comment;
import React, { useState } from 'react';

const MessageBubble = ({ message, isCurrentUser }) => {
  const [imageError, setImageError] = useState(false);
  const messageDate = new Date(message.created_at || message.timestamp);
  const messageTime = new Date(message.created_at || message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Format date using logic for today, yesterday, or actual date
  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };
  
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`max-w-xs sm:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center gap-2 mb-1">
          {!isCurrentUser && (
            <div className="flex-shrink-0">
              {!imageError ? (
                <img 
                  src={message.sender_profile_pic || '/default-avatar.png'} 
                  alt={message.sender_name}
                  onError={handleImageError}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium text-sm">
                  {message.sender_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          )}
          <span className={`text-xs font-medium ${isCurrentUser ? 'text-right text-text-400' : 'text-text-400'}`}>
            {!isCurrentUser && message.sender_name}
            {isCurrentUser ? 'You' : ''} • {formatDate(messageDate)}, {messageTime}
          </span>
        </div>
        
        <div 
          className={`p-3 rounded-xl ${
            isCurrentUser 
              ? 'bg-primary-500 text-white rounded-tr-none' 
              : 'bg-background-200 text-text-500 rounded-tl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content || message.text}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
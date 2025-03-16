import React from 'react'
import { useSelector } from 'react-redux';

const ChatRoomItem = ({ chatRoom, isActive, onClick }) => {
    const otherUser = chatRoom.student.id === useSelector(state => state.auth.userData?.user.id) 
      ? chatRoom.tutor 
      : chatRoom.student;
  
    return (
      <div 
        onClick={onClick}
        className={`flex items-center p-3 cursor-pointer hover:bg-background-100 rounded-md ${
          isActive ? 'bg-primary-50 border-l-4 border-primary-500' : ''
        }`}
      >
        <div className="relative mr-3">
          <img 
            src={otherUser.profile_pic_url || 'https://via.placeholder.com/40'} 
            alt={otherUser.full_name} 
            className="h-10 w-10 rounded-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text-500 truncate">{otherUser.full_name}</h3>
          <p className="text-xs text-text-400 truncate">{chatRoom.course_title}</p>
        </div>
      </div>
    );
  };

  export default ChatRoomItem;
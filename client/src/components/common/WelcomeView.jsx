import React from "react";
import { useSelector } from "react-redux";
import { InboxIcon } from "@heroicons/react/24/solid";

const WelcomeView = ({ chatRooms, onSelectChatRoom }) => {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background-50 p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-background-100 p-6 rounded-lg shadow-sm mb-6 inline-block">
            <InboxIcon className="h-16 w-16 text-primary-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-text-600 mb-2">Welcome to Messages</h2>
          <p className="text-text-400 mb-6">
            Select a conversation from the sidebar to start chatting or continue where you left off.
          </p>
          
          {chatRooms.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-text-500 font-medium">Recent conversations:</p>
              <div className="space-y-2">
                {chatRooms.slice(0, 3).map(room => {
                  const otherUser = room.student.id === useSelector(state => state.auth.userData?.user.id) 
                    ? room.tutor 
                    : room.student;
                  return (
                    <button 
                      key={room.id}
                      onClick={() => onSelectChatRoom(room.id)}
                      className="w-full flex items-center p-3 bg-white border border-background-200 rounded-md hover:bg-primary-50 transition"
                    >
                      <img 
                        src={otherUser.profile_pic_url || 'https://via.placeholder.com/40'} 
                        alt={otherUser.full_name} 
                        className="h-10 w-10 rounded-full mr-3"
                      />
                      <div className="text-left">
                        <p className="font-medium text-text-600">{otherUser.full_name}</p>
                        <p className="text-xs text-text-400">{room.course_title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-text-400">You don't have any active conversations yet.</p>
          )}
        </div>
      </div>
    );
  };
  
  export default WelcomeView;
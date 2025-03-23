import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MessageBubble from '../components/common/MessageBubble';
import { PaperAirplaneIcon, VideoCameraIcon, ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';
import axiosInstance from '../api/axios.Config';
import ChatRoomItem from '../components/common/ChatRoomItem';
import WelcomeView from '../components/common/WelcomeView';
import TutorVerificationMessage from '../components/tutor/TutorVerificationMessage';
import '../assets/styles/ChatroomSidebar.css'

const OneToOneChatPage = () => {

  const navigate = useNavigate();
  const {chatRoomId} = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRooms, setChatRooms] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const currentUser = useSelector(state => state.auth.userData?.user);
  const [oppositeUser, setOppositeUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTutor, setIsTutor] = useState(null);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [isActive, setIsActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const ws = useRef(null);
  const {userData, role} = useSelector((state)=>state.auth);


  useEffect(()=>{
    const fetchChatRooms = async () =>{
      if (!currentUser) return;

      setIsLoading(true);
      try{
        const response = await axiosInstance.get(
          `/courses/user/chat-rooms/${currentUser.id}/`,
          { requiresAuth: true }
        );
        setChatRooms(response.data);
      }catch (error){
        console.error("Error fetching chat rooms:", error);
      }finally{
        setIsLoading(false);
      }
    };
    fetchChatRooms();
  }, [currentUser]);

  const filteredChatRooms = chatRooms.filter(room => {
    const searchLower = searchQuery.toLowerCase();
    return (
      room.course_title.toLowerCase().includes(searchLower) ||
      room.student.full_name.toLowerCase().includes(searchLower) ||
      room.tutor.full_name.toLowerCase().includes(searchLower)
    );
  });


  useEffect(() => {
    const handleActivity = () => setIsActive(true);

    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("keydown", handleActivity);

    const sendTimeToBackend = () => {
        if (isActive) {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            axiosInstance.post("/update-learning-time/", { time_spent: timeSpent }, { requiresAuth: true })
                .catch(err => console.error("Time update failed", err));
            setStartTime(Date.now());
            setIsActive(false);
        }
    };

    const interval = setInterval(sendTimeToBackend, 20000);

    return () => {
        document.removeEventListener("mousemove", handleActivity);
        document.removeEventListener("keydown", handleActivity);
        clearInterval(interval);
        sendTimeToBackend();
    };
  }, [isActive, startTime]);
  

  useEffect(()=>{
    const fetchChatData = async() => {
      if (!currentUser || !chatRoomId) {
        setMessages([]);
        setOppositeUser(null);
        return;
      }
      setIsLoading(true);
      try{

        const roomResponse = await axiosInstance.get(`/courses/chat-room/${chatRoomId}/`,
          {requiresAuth:true}
        );
        const chatRoom = roomResponse.data;

        setIsTutor(chatRoom.tutor.id === currentUser.id);
        const isStudent = chatRoom.student.id === currentUser.id;
        const oppUser = isStudent ? chatRoom.tutor : chatRoom.student;
        setOppositeUser({
          id: oppUser.id,
          name: oppUser.full_name,
          profile_pic: oppUser.profile_pic_url || 'https://via.placeholder.com/40',
          isOnline: false
        });

        const messagesResponse = await axiosInstance.get(`/courses/chat-room/messages/?chat_room_id=${chatRoomId}`,
          {requiresAuth:true}
        );
        setMessages(messagesResponse.data.map(msg => ({
          ...msg,
          isCurrentUser: msg.sender === currentUser.id,
          sender_name: msg.sender_name,
          sender_profile_pic: msg.sender_profile_pic
        })));
      }catch(error){
        console.error('Error fetching chat data:', error);
      }finally {
        setIsLoading(false);
      }
    };

    if (currentUser && chatRoomId) {
      fetchChatData();
      // Close any existing WebSocket connection when chat room changes
      if (ws.current) {
        ws.current.close();
      }
    }
  }, [chatRoomId, currentUser])

  useEffect(()=>{
    const token = localStorage.getItem("access_token");
    if(!token || !chatRoomId) return;

    const wsUrl = `ws://localhost:8000/ws/chat/${chatRoomId}/?token=${token}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () =>{
      setIsConnected(true);
      
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: data.message,
          sender: data.sender_id,
          created_at: new Date().toISOString(),
          sender_name: data.sender_name,
          sender_profile_pic: data.sender_profile_pic,
          isCurrentUser: data.sender_id === currentUser.id
        }]);
      }
      if (data.type === 'presence') {
        setOppositeUser(prev => {
          if (!prev) return prev;
          const isOnline = data.online_user_ids.includes(prev.id.toString());
          return {...prev, isOnline};
        });
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    return () => ws.current?.close();

  }, [chatRoomId, currentUser])


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws.current) return;

    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        message: newMessage
      }));
      setNewMessage('');
    }
  };

  const handleChatRoomSelect = (selectedChatRoomId) => {
    navigate(`/${role}/chatroom/${selectedChatRoomId}`);
  }
 

  const startCall = async() => {
    
    if(!chatRoomId){
      alert('Please select a chat room first');
      return;
    } 
    const callUrl = `${window.location.origin}/video-call/${chatRoomId}`;

    const newWindow = window.open(callUrl, '_blank', 'noopener,noreferrer');

    // Send the link via chat
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        message: `Video call started: ${callUrl}`
      }));
    }

    // Fallback if popup blocked
    if (!newWindow || newWindow.closed) {
      alert('Pop-up blocked! Please allow pop-ups for this site and try again.');
    }
  };

 

  
   // Scroll to bottom when messages change
   useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  

  return (
    <>
      {role === "tutor" && userData?.is_verified === false ? (
        <TutorVerificationMessage />
      ) : (
        <div className="flex h-screen bg-background-100 overflow-hidden">
          
          {/* Chat rooms sidebar */}
          <div className={`${showSidebar ? 'w-80' : 'w-0'} md:w-80 bg-background-50 border-r border-background-300 transition-width duration-300 overflow-hidden flex flex-col h-full`}>
            <div className="p-4 border-b border-background-300 bg-primary-600 mb-3">
              <h2 className="text-lg font-semibold text-background-50">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto chat-rooms-container bg-background-100">
              {/* Add search bar */}
              <div className="p-3 border-b border-background-200">
                <input
                  type="text"
                  placeholder="Search chat rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background-50 border border-background-200 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm text-text-500"
                />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-32 text-text-400 p-4">
                  Loading chat rooms...
                </div>
              ) : filteredChatRooms.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-text-400 p-4">
                  {chatRooms.length === 0 ? 'No chat rooms available.' : 'No matching chat rooms found.'}
                </div>
              ) : (
                filteredChatRooms.map((room) => (
                  <ChatRoomItem
                    key={room.id}
                    chatRoom={room}
                    isActive={room.id === parseInt(chatRoomId)}
                    onClick={() => handleChatRoomSelect(room.id)}
                  />
                ))
              )}
            </div>
          </div>
  
          {/* Chat section */}
          <div className="flex-1 flex flex-col max-h-screen">
            {!chatRoomId ? (
              // Welcome screen when no chat is selected
              <WelcomeView 
                chatRooms={chatRooms} 
                onSelectChatRoom={handleChatRoomSelect} 
              />
            ) : (
              // Regular chat interface when a chat is selected
              <>
                {/* Chat Header with toggle sidebar button, opposite user info and video call button */}
                <div className="bg-white border-b border-background-300 shadow-sm py-3 px-4 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center">
                    <button 
                      onClick={toggleSidebar}
                      className="md:hidden mr-3 p-1 rounded-full hover:bg-background-100"
                    >
                      {showSidebar ? (
                        <XMarkIcon className="h-5 w-5 text-text-500" />
                      ) : (
                        <ChatBubbleLeftIcon className="h-5 w-5 text-text-500" />
                      )}
                    </button>
                    {oppositeUser && (
                      <div className="flex items-center">
                        <div className="relative mr-3">
                          <img 
                            src={oppositeUser.profile_pic} 
                            alt={oppositeUser.name} 
                            className="h-10 w-10 rounded-full"
                          />
                          {oppositeUser.isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        <div>
                          <h1 className="text-text-500 font-semibold">{oppositeUser.name}</h1>
                          <p className="text-xs text-text-400">
                            {oppositeUser.isOnline ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                    {isTutor && (
                      <button 
                        onClick={startCall}
                        className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600"
                        disabled={!oppositeUser}
                      >
                        <VideoCameraIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
  
                {/* Messages area */}
                <div 
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto py-4 px-3 md:px-6 bg-background-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32 text-text-400">
                      Loading messages...
                    </div>
                  ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-text-400">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <MessageBubble 
                            key={msg.id}
                            message={msg}
                            isCurrentUser={msg.sender === currentUser?.id}
                          />
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Message input */}
                <div className="bg-white border-t border-background-300 p-3 md:p-4 flex-shrink-0">
                  <form 
                    onSubmit={handleSendMessage} 
                    className="max-w-4xl mx-auto flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 py-3 px-4 bg-background-100 border-0 rounded-full focus:ring-2 focus:ring-primary-300 focus:outline-none text-text-500 placeholder-text-300"
                    />
                    <button
                      type="submit"
                      className="p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
                      disabled={!newMessage.trim()}
                    >
                      <PaperAirplaneIcon className="h-5 w-5 transform -rotate-90" />
                    </button>
                  </form>
                </div>
              </>
            )}
  
            {/* Mobile sidebar toggle button when sidebar is closed */}
            {!showSidebar && (
              <button
                onClick={toggleSidebar}
                className="md:hidden absolute top-4 left-4 p-2 rounded-full bg-primary-500 text-white shadow-md"
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default OneToOneChatPage;
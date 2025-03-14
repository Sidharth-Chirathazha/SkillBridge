import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MessageBubble from '../components/common/MessageBubble';
import MembersList from '../components/common/MembersList';
import axiosInstance from '../api/axios.Config';
import toast from 'react-hot-toast';
import { v4 as uuidv4} from 'uuid';
import { PaperAirplaneIcon, Bars3Icon as MenuIcon, XMarkIcon as XIcon } from '@heroicons/react/24/solid';

const CommunityChatPage = () => {
  const { communityId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const currentUser = useSelector(state => state.auth.userData?.user);
  
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch community members
        const membersResponse = await axiosInstance.get(
          `/community/communities/${communityId}/members/`,
          { requiresAuth: true }
        );
        setMembers(membersResponse.data);

        // Fetch community messages
        const messagesResponse = await axiosInstance.get('/community/messages/', 
        {   
            params: { community: communityId },
            requiresAuth: true
        });
        setMessages(messagesResponse.data);
        toast.success("Connected to chat room");
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Failed to connect to chat room");
      }
    };

    fetchData();
  }, [communityId]);

  // WebSocket setup
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    ws.current = new WebSocket(`ws://localhost:8000/ws/community/${communityId}/?token=${token}`);

    ws.current.onmessage = (e) => {
      const messageData = JSON.parse(e.data);
      console.log("inside chat page message data type:", messageData?.type);
      
      if(messageData.type === 'chat_message'){
        setMessages(prev => [...prev, 
          {
            id : messageData.message.id,
            content: messageData.message.text,
            sender: messageData.message.sender,
            created_at: messageData.message.created_at,
            sender_name: messageData.message.sender_name,
            sender_profile_pic: messageData.message.sender_profile_pic,
            isCurrentUser: messageData.message.sender === currentUser.id,
          }
        ]);
      }
      else if(messageData.type === 'online_users'){
        const onlineIds = (messageData.users || []).map(u => String(u.id));
        console.log('Received online users:', onlineIds);
        setOnlineUsers(onlineIds);
      }

      console.log("Inside members list online users:", onlineUsers);
    };

    return () => ws.current?.close();
  }, [communityId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // const tempMessage = {
    //   id: `temp-${Date.now()}-${Math.random()}`, // Unique temporary ID
    //   content: newMessage,
    //   sender: currentUser.id,
    //   created_at: new Date().toISOString(),
    //   isCurrentUser: true,
    // };

    // setMessages(prev=>[...prev, tempMessage]);

    try {
      // // Send via WebSocket
      // ws.current.send(JSON.stringify({ message: newMessage }));

      // Persist to database using your existing message endpoint
      await axiosInstance.post('/community/messages/', 
        {
          community: communityId,
          text: newMessage
        },
        {requiresAuth: true}
      );

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      toast.error("Failed to send message");
      if (error.response) {
        console.error('Backend response:', error.response.data);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Topbar */}
        <div className="bg-white border-b border-background-300 shadow-sm py-3 px-4 flex items-center justify-between">
          <h1 className="text-text-500 font-semibold">Community Chat</h1>
          <button 
            onClick={toggleMobileSidebar}
            className="md:hidden p-2 rounded-full hover:bg-background-200 transition-colors focus:outline-none"
          >
            <MenuIcon className="h-5 w-5 text-text-400" />
          </button>
        </div>

        {/* Messages area */}
        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto py-4 px-3 md:px-6 bg-background-50"
        >
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
        </div>
        
        {/* Message input */}
        <div className="bg-white border-t border-background-300 p-3 md:p-4">
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
              className="p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors"
              disabled={!newMessage.trim()}
            >
              <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
            </button>
          </form>
        </div>
      </div>

      {/* Members Sidebar - Desktop */}
      <div className="hidden md:block w-72 lg:w-80 bg-white border-l border-background-300 overflow-y-auto">
        <div className="p-4 border-b border-background-300">
          <h3 className="text-lg font-semibold text-text-500">Members</h3>
          <p className="text-sm text-text-400">{members.length} online</p>
        </div>
        <div className="p-2">
          <MembersList members={members} onlineUserIds={onlineUsers}/>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } md:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-background-300">
          <h3 className="text-lg font-semibold text-text-500">Members</h3>
          <button 
            onClick={toggleMobileSidebar}
            className="p-2 rounded-full hover:bg-background-200 transition-colors"
          >
            <XIcon className="h-5 w-5 text-text-400" />
          </button>
        </div>
        <div className="p-2 overflow-y-auto h-full">
          <MembersList members={members} onlineUserIds={onlineUsers}/>
        </div>
      </div>
      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}
    </div>
  );
};

export default CommunityChatPage;
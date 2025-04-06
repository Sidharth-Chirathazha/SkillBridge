import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import MessageBubble from '../components/common/MessageBubble';
import MembersList from '../components/common/MembersList';
import axiosInstance from '../api/axios.Config';
import toast from 'react-hot-toast';
import { PaperAirplaneIcon, Bars3Icon as MenuIcon, XMarkIcon as XIcon } from '@heroicons/react/24/solid';
import TutorVerificationMessage from '../components/tutor/TutorVerificationMessage';
import { fetchSingleCommunity, leaveCommunity, deleteCommunity } from '../redux/slices/communitySlice';
import { ConfirmDialog } from '../components/common/ui/ConfirmDialog';


const CommunityChatPage = () => {
  const { communityId} = useParams();
   const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [isActive, setIsActive] = useState(true);
  const currentUser = useSelector(state => state.auth.userData?.user);
  const {userData, role} = useSelector((state)=>state.auth)
  const { singleCommunity } = useSelector((state) => state.community);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isCreator = currentUser?.id === singleCommunity?.creator
  
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
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [communityId]);


  useEffect(() => {
      const fetchData = async () => {
          try {
          setLoading(true);
          await dispatch(fetchSingleCommunity(communityId)).unwrap();
          } catch (error) {
          console.error('Failed to fetch Community:', error);
          navigate(`/${role}/communities/`)
          } finally {
              setLoading(false);
          }
      };
      fetchData();
    }, [communityId]);


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

  // WebSocket setup
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    ws.current = new WebSocket(`wss://api.skillbridge.fun/ws/community/${communityId}/?token=${token}`);

    ws.current.onmessage = (e) => {
      const messageData = JSON.parse(e.data);
      
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
        setOnlineUsers(onlineIds);
      }

    };

    return () => ws.current?.close();
  }, [communityId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {

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

  const handleLeaveCommunity = async ()=>{
    try {
      await dispatch(leaveCommunity(communityId));
      navigate(`/${role}/communities`); // Navigate to communities list on success
      toast.success(`You have left ${singleCommunity?.title}`)
    } catch (error) {
      console.error("Failed to leave the community:", error);
    }
  }

  const handleDeleteCommunity = async()=>{
    try{
      await dispatch(deleteCommunity(communityId));
      navigate(`/${role}/communities`);
      toast.success('Community deleted successfully')
    }catch(error){
      console.error("Failed to delete the community:", error);
    }

  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
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
      <div className="flex flex-col md:flex-row h-screen bg-background-100">
        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Topbar */}
          <div className="bg-white border-b border-background-300 shadow-sm py-3 px-4 flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-text-500 font-semibold">{singleCommunity?.title}</h1>
            </div>
            <div className="flex items-center gap-2">
            {isCreator ? (
                <ConfirmDialog
                  trigger={(open) => (
                    <button
                      onClick={open}
                      className="px-3 py-1.5 text-sm rounded-md bg-secondary-500 text-white hover:bg-secondary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      Delete Community
                    </button>
                  )}
                  title="Delete Community"
                  description="Are you sure you want to delete this community? This action cannot be undone."
                  confirmText="Yes, Delete"
                  cancelText="Cancel"
                  onConfirm={handleDeleteCommunity}
                  destructive
                />
              ) : (
                <ConfirmDialog
                  trigger={(open) => (
                    <button
                      onClick={open}
                      className="px-3 py-1.5 text-sm rounded-md bg-secondary-500 text-white hover:bg-secondary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-300"
                    >
                      Leave Community
                    </button>
                  )}
                  title="Leave Community"
                  description="Are you sure you want to leave this community?"
                  confirmText="Yes, Leave"
                  cancelText="Cancel"
                  onConfirm={handleLeaveCommunity}
                  destructive
                />
              )}

              <button 
                onClick={toggleMobileSidebar}
                className="md:hidden p-2 rounded-full hover:bg-background-200 transition-colors focus:outline-none"
              >
                <MenuIcon className="h-5 w-5 text-text-400" />
              </button>
            </div>
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
                <PaperAirplaneIcon className="h-5 w-5 transform -rotate-90" />
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
      )}
    </>
  );
};

export default CommunityChatPage;
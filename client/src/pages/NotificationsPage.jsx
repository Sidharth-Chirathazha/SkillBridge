import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Clock, BookOpen, Users, MessageSquare, X } from 'lucide-react';
import axiosInstance from '../api/axios.Config';
import toast from 'react-hot-toast';
import { useNotification } from '../context_providers/NotificationProvider';
import { useSelector } from 'react-redux';
import TutorVerificationMessage from '../components/tutor/TutorVerificationMessage';

const NotificationsPage = () => {
  // Dummy notification data
  
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const ws = useRef(null);
  const { notificationCount, setNotificationCount } = useNotification();
  const {userData, role} = useSelector((state)=>state.auth)
  const [loading, setLoading] = useState(true);
  
  const fetchNotifications = async() => {
    try{
      setLoading(true)
      const response = await axiosInstance.get("/notifications/",{requiresAuth: true});
      const transformedData = response.data.map(notification => ({
        id: notification.id,
        title: notification.notification_type === 'message'? 'New Message' : 'Trade Request',
        content: notification.message,
        time: new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: notification.is_read,
        type: notification.notification_type === 'message' ? 'message' : 'course',
        icon: notification.notification_type === 'message' ? MessageSquare : BookOpen,
      }));
      setLoading(false);
      setNotifications(transformedData);
    }catch(error){
      console.error('Error fetching notifications:', error);
      toast.error('Error fetching notifications:', error)
      setLoading(false);
    }
  }

  useEffect(()=>{
    fetchNotifications();
  }, []);

  useEffect(()=>{
    const token  = localStorage.getItem("access_token")
    ws.current = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

    ws.current.onmessage = () => {
      fetchNotifications();
    };

    return () =>{
      if (ws.current) ws.current.close();
    }
  }, []);

  const markAsRead = (id) => {
    axiosInstance.post(`/notifications/${id}/mark_single_as_read/`, {requiresAuth:true})
      .then(()=>{
        setNotifications(prev => prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        ));
        setNotificationCount(prev => Math.max(prev - 1, 0));
      })
      .catch(error => console.error('Error marking as read:', error));
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    axiosInstance.post('/notifications/mark_all_as_read/', {requiresAuth:true})
      .then(() => {
        setNotifications(prev => prev.map(notification => ({ 
          ...notification, 
          read: true 
        })));
        setNotificationCount(0);
      })
      .catch(error => console.error('Error marking all as read:', error));
  };


  const clearAllNotifications = () =>{
    axiosInstance.delete('/notifications/delete_read_notifications/', {requiresAuth:true})
    .then(()=>{
      setNotifications(prev=>prev.filter(notification=>!notification.read));
      toast.success("Cleared read notifications")
    })
    .catch(error => {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    });
  }

  const deleteNotification = (id) => {
    // Leave this for later implementation
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(notification => !notification.read)
      : notifications.filter(notification => notification.read);

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
       <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            {/* Notification Header */}
            <div className="flex items-center mb-4 md:mb-0">
              <Bell className="h-6 w-6 text-primary-500 mr-2" />
              <h1 className="text-2xl font-bold text-text-500">Notifications</h1>
              {unreadCount > 0 && (
                <span className="ml-3 px-2 py-1 bg-secondary-500 text-white text-xs font-medium rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* Filter and Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Filter Buttons */}
              <div className="inline-flex rounded-md shadow-sm" role="group">
                {['all', 'unread', 'read'].map((type, index) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 text-sm font-medium ${
                      filter === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-text-500 hover:bg-primary-50'
                    } ${index === 0 ? 'rounded-l-lg' : index === 2 ? 'rounded-r-lg' : ''}`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Mark All as Read Button */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-white text-primary-500 border border-primary-500 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Bell className="h-12 w-12 text-background-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-500 mb-2">No notifications</h3>
            <p className="text-background-900">
              {filter === 'all' 
                ? "You don't have any notifications yet."
                : filter === 'unread'
                  ? "You don't have any unread notifications."
                  : "You don't have any read notifications."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-background-200">
              {filteredNotifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`px-4 py-4 hover:bg-background-50 transition-colors ${
                    !notification.read ? 'border-l-4 border-primary-500 bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full ${
                      notification.type === 'message' ? 'bg-primary-100 text-primary-600' :
                      notification.type === 'course' ? 'bg-secondary-100 text-secondary-600' :
                      notification.type === 'deadline' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <notification.icon className="h-5 w-5" />
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-primary-700 font-semibold' : 'text-text-500'}`}>
                          {!notification.read && <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mr-2"></span>}
                          {notification.title}
                        </p>
                        <span className="text-xs text-background-900">{notification.time}</span>
                      </div>
                      <p className={`text-sm mt-1 ${!notification.read ? 'text-text-700' : 'text-background-900'}`}>
                        {notification.content}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-end space-x-2">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-800"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-background-900 hover:text-secondary-600"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            
            {notifications.length > unreadCount && (
              <div className="border-t border-background-200 p-4 flex justify-center">
                <button
                  onClick={clearAllNotifications}
                  className="inline-flex items-center px-4 py-2 bg-secondary-500 text-white rounded-lg text-sm font-medium hover:bg-secondary-600 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </>  
  );
};

export default NotificationsPage;
import React, { useState, useEffect, useRef } from 'react';
import { Search ,Bell, GraduationCap, LogOut, PlusCircle, 
 BookCopy, ChevronDown, Loader, Menu, X, ChevronsLeft, ChevronsRight, User, Wallet,Library, Clock, Calendar } from 'lucide-react';
 import { RiUserCommunityFill } from "react-icons/ri";
 import { FaChalkboardTeacher, FaBook, FaGraduationCap, FaUsers } from "react-icons/fa";
 import { FaRegMessage } from "react-icons/fa6";
 import { IoNotifications } from "react-icons/io5";
 import { MdDashboard, MdAccountCircle} from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchUser, logoutUser } from '../../redux/slices/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@mui/material";
import { Outlet } from 'react-router-dom';
import { persistor } from '../../redux/store';
import axiosInstance from '../../api/axios.Config';
import { useNotification } from '../../context_providers/NotificationProvider'
import { ConfirmDialog } from './ui/ConfirmDialog';
import avatar2 from '../../assets/images/avatar2.jpg'

const UserLayout = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const {notificationCount, setNotificationCount} = useNotification();
  const [showSidebarLogoutDialog, setShowSidebarLogoutDialog] = useState(null);
  const ws = useRef(null);

  const { userData, role } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const tutorNavItems = [
    { name: 'Dashboard', icon:  MdDashboard, path: '/tutor/dashboard/' },
    { name: 'Teaching', icon: FaBook, path: '/tutor/teaching/' },
    { name: 'Courses', icon: FaGraduationCap, path: '/tutor/courses/' },
    { name: 'Learning', icon: FaChalkboardTeacher, path: '/tutor/learning/' },
    { name: 'Community', icon: RiUserCommunityFill, path: '/tutor/communities/' },
    { name: 'Chat Room', icon: FaRegMessage, path: '/tutor/chatroom/' },
    { name: 'Notifications', icon: IoNotifications, path: '/tutor/notifications/' },
    { name: 'Account', icon: MdAccountCircle, path: '/tutor/profile/' },
  ];

  const studentNavItems = [
    { name: 'Dashboard', icon:  MdDashboard, path: '/student/dashboard/' },
    { name: 'Courses', icon: FaGraduationCap, path: '/student/courses/' },
    { name: 'My Learning', icon: FaChalkboardTeacher, path: '/student/learning/' },
    { name: 'Tutors', icon: FaUsers, path: '/student/tutors/' },
    { name: 'Community', icon: RiUserCommunityFill, path: '/student/communities/' },
    { name: 'Chat Room', icon: FaRegMessage, path: '/student/chatroom/' },
    { name: 'Notifications', icon: IoNotifications, path: '/student/notifications/' },
    { name: 'Account', icon: MdAccountCircle, path: '/student/profile/' },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const refresh_token = localStorage.getItem("refresh_token");
   
    if (!refresh_token ) {
      console.error("Refresh token is missing");
      return;
    }

    try {
      await axiosInstance.post("/logout/", { refresh: refresh_token },{ requiresAuth:true } );

      await dispatch(logoutUser()).unwrap();

      localStorage.removeItem("refresh_token");
      localStorage.removeItem("access_token");

      setTimeout(() => persistor.purge(), 500);

      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout.");
    }
  };

  const fetchNotifications = async() => {
    try{
      const response = await axiosInstance.get("/notifications/",{requiresAuth: true});
      const unreadCount = response.data.filter(notification => !notification.is_read).length;
      setNotificationCount(unreadCount)
    }catch(error){
      console.error('Error fetching notifications:', error);
      toast.error('Error fetching notifications:', error)
    }
  }


  useEffect(()=>{
    fetchNotifications();
  }, [])

  useEffect(()=>{
    const token  = localStorage.getItem("access_token")
    ws.current = new WebSocket(`wss://api.skillbridge.fun/ws/notifications/?token=${token}`);

    ws.current.onmessage = () => {
      fetchNotifications();
    };

    return () =>{
      if (ws.current) ws.current.close();
    }
  }, []);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchUser()).unwrap();
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = userData?.user?.role === 'tutor' ? tutorNavItems : studentNavItems;

  // Dynamically set activePage based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = navItems.find((item) => currentPath.startsWith(item.path));
    if (activeItem) {
      setActivePage(activeItem.name);
    }
  }, [location, navItems]);

  const handleNavigation = (item) => {
    setActivePage(item.name);
    navigate(item.path);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  

  if (loading || !userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-500">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className={`fixed top-4 z-50 p-2 rounded-md ${
            isSidebarOpen ? 'left-64 text-white hover:text-text-50' : 'left-4 text-primary-500 hover:text-primary-700 transition-all duration-300'
          }`}
          style={{ transition: 'left 0.3s ease' }}
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={24} />}
        </button>
      )}
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed lg:relative inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } bg-primary text-background-50 transition-all duration-300 ease-in-out z-40
        ${!isMobile && !isSidebarOpen ? 'w-20' : 'w-64'}`}
      >
        {/* Logo Area with Toggle */}
        <div className="p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => !isSidebarOpen && !isMobile && setSidebarOpen(true)}
          >
            <GraduationCap className="text-background-50 text-2xl group-hover:text-secondary transition-all duration-700" />
            <span className={`text-background-50 text-xl font-bold group-hover:text-secondary transition-all duration-700 
              ${(!isMobile && !isSidebarOpen) ? 'lg:hidden' : ''}`}>
              SkillBridge
            </span>
          </div>
  
          {/* Desktop Toggle Button - Enhanced visibility */}
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="text-background-50 hover:text-secondary-500 p-1 rounded-full hover:bg-primary-600 transition-all"
            >
              {isSidebarOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
            </button>
          )}
        </div>
  
        {/* Navigation Items - Better touch targets */}
        <nav className="flex-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center px-4 py-3.5 text-sm font-medium ${
                location.pathname.startsWith(item.path)
                  ? 'bg-primary-600 text-background-50'
                  : 'text-background-300 hover:bg-primary-600 hover:text-background-50'
              } transition-colors duration-200 group relative`}
            >
              <item.icon className="h-5 w-5 min-w-[1.25rem]" />
              <span className={`ml-3 whitespace-nowrap ${
                !isMobile && !isSidebarOpen ? 'lg:hidden' : ''
              }`}>
                {item.name}
              </span>
  
              {/* Notification badge - only for Notifications item */}
              {item.name === 'Notifications' && notificationCount > 0 && (
                <span className={`${
                  !isMobile && !isSidebarOpen
                  ? 'absolute top-0.5 right-0.5' 
                  : 'ml-auto mr-1'
                } flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-secondary-500 rounded-full`}>
                  {notificationCount}
                </span>
              )}
  
              {/* Tooltip for collapsed state */}
              {!isMobile && !isSidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-200 transition-opacity duration-200">
                  {item.name}
                  {item.name === 'Notifications' && notificationCount > 0 && ` (${notificationCount})`}
                </span>
              )}
            </button>
          ))}
        </nav>
  
        {/* Logout Button - Modified to improve dialog positioning */}
        {/* <button
          onClick={() => {
            setShowSidebarLogoutDialog(true);
          }}
          className="w-full flex items-center px-4 py-3.5 text-sm font-medium text-background-50 hover:text-secondary-500 transition-colors duration-500"
        >
          <LogOut className="h-5 w-5 min-w-[1.25rem]" />
          <span className={`ml-3 ${!isMobile && !isSidebarOpen ? 'lg:hidden' : ''}`}>
            Logout
          </span>
        </button> */}

        <ConfirmDialog
          trigger={(open) => (
            <button
              onClick={open}
              className="w-full flex items-center px-4 py-3.5 text-sm font-medium text-background-50 hover:text-secondary-500 transition-colors duration-500"
              role="menuitem"
            >
              <LogOut className="h-5 w-5 min-w-[1.25rem]" />
              <span className={`ml-3 ${!isMobile && !isSidebarOpen ? 'lg:hidden' : ''}`}>
                Logout
              </span>
            </button>
          )}
          title="Logout"
          description={`Are you sure you want to logout?`}
          confirmText='Confirm'
          destructive
          onConfirm={() => handleLogout()}
          variant='user' 
        />
      </div>
  
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-background-50 border-b border-background-200 h-16 flex items-center px-4 sm:px-6">
          {/* Three-column layout: left space, center nav, right actions */}
          <div className="w-full grid grid-cols-3 items-center">
            {/* Left section - Brand name positioning fixed for mobile */}
            <div className="flex justify-start">
              {!isSidebarOpen && (
                <div className={`flex items-center space-x-2 ${isMobile ? 'ml-10' : ''}`}>
                  <span className="text-primary-500 text-xl font-bold">SkillBridge</span>
                </div>
              )}
            </div>
            
            {/* Center section - navigation (desktop only) */}
            <div className="hidden md:flex justify-center">
              {/* Desktop Nav Menu - Centered */}
              <nav className="flex items-center justify-center space-x-6">
                <button 
                  onClick={() => navigate(`/${role}/dashboard/`)}
                  className={`relative text-sm font-medium px-2 py-1 transition-all duration-200 hover:text-secondary 
                            after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-secondary after:transition-all 
                            after:duration-300  ${
                    location.pathname.includes('/dashboard/') 
                      ? 'text-secondary after:w-full' 
                      : 'text-text-500 hover:after:w-full'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => navigate(`/${role}/courses/`)}
                  className={`relative text-sm font-medium px-2 py-1 transition-all duration-200 hover:text-secondary 
                            after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-secondary after:transition-all 
                            after:duration-300 ${
                    location.pathname.includes('/courses/') 
                      ? 'text-secondary after:w-full' 
                      : 'text-text-500 hover:after:w-full'
                  }`}
                >
                  Courses
                </button>
                <button 
                  onClick={() => navigate(`/${role}/blogs/`)}
                  className={`relative text-sm font-medium px-2 py-1 transition-all duration-200 hover:text-secondary 
                            after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-secondary after:transition-all 
                            after:duration-300 ${
                    location.pathname.includes('/blogs/') 
                      ? 'text-secondary after:w-full' 
                      : 'text-text-500 hover:after:w-full'
                  }`}
                >
                  Blogs
                </button>
              </nav>
            </div>
            
            {/* Mobile navigation menu */}
            <div className="md:hidden flex justify-center">
              <button className="text-primary-500 hover:text-secondary-500 transition-colors duration-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <ChevronDown className={`h-5 w-5 ${isMobileMenuOpen ? 'transform rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* Right section - user actions */}
            <div className="flex items-center justify-end gap-4">
              {/* Notification Icon */}
              <button
                className="relative p-2 rounded-full hover:bg-background-100 
                text-text-500 hover:text-primary-500 transition-colors duration-300"
                onClick={() => navigate(`/${userData?.user?.role}/notifications/`)}
              >
                <Bell className="h-5 w-5 text-text-500 hover:text-secondary-500 transition-colors duration-300" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 bg-secondary-500 text-white 
                  rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              
              {userData.user.role === "tutor" && (
                <Button
                  startIcon={<PlusCircle className="h-5 w-5" />}
                  variant="contained"
                  color={userData?.is_verified ? "primary" : "inherit"}
                  disabled={!userData?.is_verified}
                  onClick={() => userData?.is_verified && navigate("/tutor/teaching/new")}
                  sx={{
                    minWidth: 'auto',
                    "&.Mui-disabled": {
                      backgroundColor: "gray",
                      color: "white",
                      cursor: "not-allowed",
                    },
                  }}
                >
                  <span className="hidden sm:inline">Add Course</span>
                </Button>
              )}
  
              {/* Profile Dropdown - Mobile-friendly */}
              <div className="relative z-50" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    src={userData.user.profile_pic_url || avatar2}
                    alt="Profile"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-background-200"
                  />
                  <div className="hidden sm:flex items-center ml-2">
                    <span className="text-sm font-medium text-text-500 mr-1 sm:mr-2 truncate max-w-[120px]">
                      {userData?.user?.first_name || userData?.user?.email || 'Nil'}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-text-400 transition-transform ${
                        isProfileOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
  
                {/* Dropdown Menu - Enhanced for mobile */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background-50 ring-1 ring-black ring-opacity-5 origin-top-right">
                    <div className="py-1" role="menu">
                      {/* Mobile-only view of user name */}
                      <div className="sm:hidden px-4 py-2 text-sm font-medium text-text-500 border-b border-background-200">
                        {userData?.user?.first_name || userData?.user?.email || 'Nil'}
                      </div>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-text-500 hover:bg-background-100 flex items-center space-x-2"
                        role="menuitem"
                        onClick={() => navigate(`/${userData?.user?.role}/profile`)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm text-text-500 hover:bg-background-100 flex items-center space-x-2"
                        role="menuitem"
                        onClick={() => {
                          if (userData?.user?.role === 'tutor') {
                            navigate('/tutor/wallet')
                          }
                        }}
                      >
                        <Wallet className="h-4 w-4" />
                        <span>Wallet</span>
                      </button>
                      <div className="border-t border-background-200 my-1"></div>
                      <ConfirmDialog
                        trigger={(open) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Change onMouseDown to onClick
                              open();
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-secondary-500 hover:bg-background-100 flex items-center space-x-2"
                            role="menuitem"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign out</span>
                          </button>
                        )}
                        title="Logout"
                        description='Are you sure you want to logout?'
                        confirmText='Confirm'
                        destructive
                        onConfirm={() => handleLogout()}
                        variant='user' 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
  
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background-50 border-b border-background-200 shadow-md">
            <nav className="flex flex-col">
              <button 
                onClick={() => {
                  navigate(`/${role}/dashboard/`);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium ${
                  location.pathname.includes('/dashboard/') 
                    ? 'text-secondary bg-background-100' 
                    : 'text-text-500'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => {
                  navigate(`/${role}/courses/`);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium ${
                  location.pathname.includes('/courses/') 
                    ? 'text-secondary bg-background-100' 
                    : 'text-text-500'
                }`}
              >
                Courses
              </button>
              <button 
                onClick={() => {
                  navigate(`/${role}/learning/`);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium ${
                  location.pathname.includes('/learning/') 
                    ? 'text-secondary bg-background-100' 
                    : 'text-text-500'
                }`}
              >
                My Learning
              </button>
            </nav>
          </div>
        )}
    
        {/* Page Content */}
        <main className='flex-1 overflow-auto p-4 sm:p-6 bg-background-500'>
          <Outlet />  {/* This renders the current page */}
        </main>
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default UserLayout;
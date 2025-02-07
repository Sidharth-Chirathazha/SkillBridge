import React, { useState, useEffect, useRef } from 'react';
import { Search, HomeIcon, Users, GraduationCap, Book, MessageSquare, Star, UserRoundPen, LogOut, PlusCircle, ChevronDown, Loader, Menu, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchUser, logoutUser } from '../../redux/slices/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@mui/material";

const UserLayout = ({ children }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  const { userData } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const tutorNavItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/tutor/dashboard/' },
    { name: 'Teaching', icon: Book, path: '/tutor/teaching/' },
    { name: 'Courses', icon: GraduationCap, path: '/tutor/dashboard/' },
    { name: 'Community', icon: Users, path: '/tutor/dashboard/' },
    { name: 'Messages', icon: MessageSquare, path: '/tutor/dashboard/' },
    { name: 'Reviews', icon: Star, path: '/tutor/dashboard/' },
    { name: 'Account', icon: UserRoundPen, path: '/tutor/profile/' },
  ];

  const studentNavItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/student/dashboard/' },
    { name: 'Courses', icon: GraduationCap, path: '/student/courses/' },
    { name: 'My Learning', icon: Book, path: '/student/learning/' },
    { name: 'Tutors', icon: Users, path: '/student/tutors/' },
    { name: 'Messages', icon: MessageSquare, path: '/student/dashboard/' },
    { name: 'Account', icon: UserRoundPen, path: '/student/profile/' },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const refresh_token = localStorage.getItem("refresh_token");
    const access_token = localStorage.getItem("access_token");

    if (!refresh_token || !access_token) {
      console.log("Refresh token is missing");
      return;
    }

    try {
      await dispatch(logoutUser({ refresh: refresh_token })).unwrap();
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      console.log("Logout failed:", error);
      toast.error("Failed to logout.");
    }
  };

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

  // if (!userData || !userData.user) {
  //   return <p>No user data available.</p>;
  // }

  if (loading || !userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-500">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className={`fixed top-4 left-4 z-50 p-2 rounded-md ${
            isSidebarOpen ? 'left-64 text-white hover:text-text-50' : 'left-4 text-primary-500 hover:text-primary-700 transition-all duration-300 '
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
            {/* Tooltip for collapsed state */}
            {!isMobile && !isSidebarOpen && (
              <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg opacity-0 group-hover:opacity-200 transition-opacity duration-200">
                {item.name}
              </span>
            )}
          </button>
        ))}
      </nav>

        {/* Logout Button - Consistent styling */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center px-4 py-3.5 text-sm font-medium text-background-50 hover:text-secondary-500 transition-colors duration-500"
      >
        <LogOut className="h-5 w-5 min-w-[1.25rem]" />
        <span className={`ml-3 ${!isMobile && !isSidebarOpen ? 'lg:hidden' : ''}`}>
          Logout
        </span>
      </button>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-background-50 border-b border-background-200 h-16 flex items-center justify-between px-4 sm:px-6">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl lg:ml-0">
            <div className="relative ml-10">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-background-200 focus:outline-none focus:border-primary-300"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-300" />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-4 ml-2">
            {userData.user.role === "tutor" && (
              <Button
                startIcon={<PlusCircle className="h-5 w-5" />}
                variant="contained"
                color={userData?.is_verified ? "primary" : "inherit"}
                disabled={!userData?.is_verified}
                onClick={() => userData?.is_verified && navigate("/tutor/courses/new")}
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
                {/* <span className="xs:hidden">Add</span> */}
              </Button>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  src={userData.user.profile_pic_url}
                  alt="Profile"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-background-200"
                />
                <div className="hidden sm:flex items-center">
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

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background-50 ring-1 ring-black ring-opacity-5 origin-top-right">
                  <div className="py-1" role="menu">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-text-500 hover:bg-background-100"
                      role="menuitem"
                      onClick={() => navigate(`/${userData?.user?.role}/profile`)}
                    >
                      Profile Settings
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-text-500 hover:bg-background-100"
                      role="menuitem"
                    >
                      Account Settings
                    </button>
                    <div className="border-t border-background-200"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-secondary-500 hover:bg-background-100"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background-500">
          {children}
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
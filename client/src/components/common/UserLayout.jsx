import React, { useState, useEffect, useRef } from 'react';
import { Search, HomeIcon, Users, GraduationCap, Book, MessageSquare, Star, UserRoundPen, LogOut, PlusCircle, ChevronDown, Loader } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchUser, logoutUser } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from "@mui/material";

const UserLayout = ({ children }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {userData} = useSelector((state)=>state.auth)
  const [loading , setLoading] = useState(true);

  const tutorNavItems = [
    { name: 'Dashboard', icon: HomeIcon, path:'/tutor/dashboard/' },
    { name: 'Teaching', icon: Book, path:'/tutor/dashboard/' },
    { name: 'Courses', icon: GraduationCap, path:'/tutor/dashboard/' },
    { name: 'Community', icon: Users, path:'/tutor/dashboard/' },
    { name: 'Messages', icon: MessageSquare, path:'/tutor/dashboard/' },
    { name: 'Reviews', icon: Star, path:'/tutor/dashboard/' },
    { name: 'Account', icon: UserRoundPen, path:'/tutor/profile/' },
  ];

  const studentNavItems = [
    { name: 'Dashboard', icon: HomeIcon, path:'/student/dashboard/' },
    { name: 'Courses', icon: GraduationCap, path:'/student/dashboard/' },
    { name: 'Community', icon: Users, path:'/student/dashboard/' },
    { name: 'Messages', icon: MessageSquare, path:'/student/dashboard/' },
    { name: 'Account', icon: UserRoundPen, path:'/student/profile/' },
  ];



  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refresh_token = localStorage.getItem("refresh_token");
    const access_token = localStorage.getItem("access_token");

    if (!refresh_token || !access_token) {
        console.log("Refresh token is missing");
        return;
    }

    try{
      await dispatch(logoutUser({refresh:refresh_token})).unwrap();

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      toast.success("Logged out successfully.");
      navigate("/login");
    }catch(error){
      console.log("Logout failed:", error);
      toast.error("Failed to logout.");
      
    }
  };

  useEffect(() => {
    // Dispatch fetchUser and store the promise
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchUser()).unwrap();
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);
 
  
  // useEffect(()=>{
  //   if(!isAuthenticated){
  //       toast.success("Logged out successfully");
  //       navigate('/login');
  //   }
  // },[isAuthenticated, navigate])

  // Handle clicking outside of dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (item) => {
    setActivePage(item.name);
    navigate(item.path);
  }

  


  if (!userData || !userData.user) {
    return <p>No user data available.</p>;
  }


  if (loading || !userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  console.log(userData.user.email);
  const navItems = userData.user.role === 'tutor' ? tutorNavItems:studentNavItems;
  

  return (
    <div className="flex h-screen bg-background-500">
      {/* Sidebar */}
      <div className="w-64 bg-primary text-background-50 flex flex-col">
        {/* Logo Area */}
        <div className="p-4 mb-6">
          <div className="flex items-center space-x-2 cursor-pointer group">
            <GraduationCap className="text-background-50 text-2xl group-hover:text-secondary transition-all duration-700" />
            <span className="text-background-50 text-xl font-bold group-hover:text-secondary transition-all duration-700">SkillBridge</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium ${
                activePage === item.name
                  ? 'bg-primary-600 text-background-50'
                  : 'text-background-300 hover:bg-primary-600 hover:text-background-50 transition-all duration-500'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm font-medium text-background-50 hover:text-secondary-500 transition-all duration-500">
          <LogOut className="h-5 w-5 mr-3" />
            Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-background-50 border-b border-background-200 h-16 flex items-center justify-between px-6">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-background-200 focus:outline-none focus:border-primary-300"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-300" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {userData.user.role === "tutor" && (
              <Button
                startIcon={<PlusCircle className="h-5 w-5" />}
                variant="contained"
                color={userData?.is_verified ? "primary" : "inherit"}
                disabled={!userData?.is_verified}
                onClick={() => userData?.is_verified && navigate("/tutor/createCourse")}
                sx={{
                  "&.Mui-disabled": {
                    backgroundColor: "gray",
                    color: "white",
                    cursor: "not-allowed",
                  },
                }}
              >
                Add Course
              </Button>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <img
                  src={userData.user.profile_pic_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-background-200"
                />
                <div className="flex items-center">
                  <span className="text-sm font-medium text-text-500 mr-2">{userData.user.email || 'Nil'}</span>
                  <ChevronDown className={`h-4 w-4 text-text-400 transition-transform ${isProfileOpen ? 'transform rotate-180' : ''}`} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background-50 ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-text-500 hover:bg-background-100"
                      role="menuitem"
                      onClick={()=> navigate('/tutor/profile')}
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
        <main className="flex-1 overflow-auto p-6 bg-background-500">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
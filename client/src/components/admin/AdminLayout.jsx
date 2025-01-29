import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  HomeIcon, 
  Users, 
  Settings, 
  Bell, 
  Database, 
  FileText, 
  LogOut, 
  ChevronDown, 
  GraduationCap,
  Loader
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout, fetchAdmin } from '../../redux/slices/adminSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// import admin_avatar from '../../assets/images/admin.jpg';

const AdminLayout = ({ children }) => {
  const [activePage, setActivePage] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const {isAdminAuthenticated, adminData} = useSelector((state)=>state.admin);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path:'/admin/dashboard/' },
    { name: 'Students', icon: Users,  path:'/admin/students/' },
    { name: 'Tutors', icon: FileText,  path:'/admin/tutors/' },
    { name: 'Courses', icon: FileText,  path:'/admin/dashboard/' },
    { name: 'Content Management', icon: FileText,  path:'/admin/contentManagement/' },
    { name: 'Communities', icon: Database,  path:'/admin/dashboard/' },
    { name: 'Settings', icon: Settings,  path:'/admin/dashboard/' },
  ];


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

  const handleLogout = ()=>{
    const refresh_token = localStorage.getItem("refresh_token")
    
    if(!refresh_token){
        console.log("Refresh token missing");
        return;   
    }

    dispatch(adminLogout({ refresh: refresh_token }))
    .unwrap()
    .then(() => {
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("access_token");
      toast.success("Logged out successfully");
      navigate('/admin/login');
    })
    .catch((error) => {
      console.error("Logout failed:", error);
      toast.error("Failed to log out.");
    });

  }

  useEffect(() => {
      // Dispatch fetchUser and store the promise
      const fetchData = async () => {
        try {
          setLoading(true);
          await dispatch(fetchAdmin()).unwrap();
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, [dispatch]);

  // Dynamically set activePage based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = navItems.find((item) => currentPath.startsWith(item.path));
    if (activeItem) {
      setActivePage(activeItem.name);
    }
  }, [location, navItems]);

  const handleNavigation = (item) =>{
    navigate(item.path)
  }

  if (loading || !adminData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-100">
      {/* Sidebar */}
      <div className="w-64 bg-primary-50 text-text-500 flex flex-col border-r border-background-200">
        {/* Logo Area */}
        <div className="p-4 mb-6 border-b border-background-200">
          <div className="flex items-center space-x-2 cursor-pointer group">
            <GraduationCap className="text-primary-700 text-2xl group-hover:text-secondary transition-all duration-700" />
            <span className="text-primary-700 text-xl font-bold group-hover:text-secondary transition-all duration-700">SkillBridge</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium ${
                location.pathname.startsWith(item.path)
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-text-400 hover:bg-background-100 hover:text-primary-600 transition-all duration-300'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm font-medium text-text-400 hover:bg-background-100 hover:text-secondary-500 transition-all duration-500">
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-background-50 border-b border-background-200 h-16 flex items-center justify-between px-6 shadow-sm">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-background-200 focus:outline-none focus:border-primary-300 bg-background-100"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-300" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-background-100 rounded-full">
              <Bell className="h-6 w-6 text-text-400" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-secondary-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  A
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-text-500 mr-2">{adminData.email}</span>
                  <ChevronDown className={`h-4 w-4 text-text-400 transition-transform ${isProfileOpen ? 'transform rotate-180' : ''}`} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background-50 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu">
                    <button className="w-full text-left px-4 py-2 text-sm text-text-500 hover:bg-background-100">
                      Profile Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-text-500 hover:bg-background-100">
                      Security
                    </button>
                    <div className="border-t border-background-200"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-secondary-500 hover:bg-background-100">
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-background-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
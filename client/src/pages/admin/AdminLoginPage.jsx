import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import sb_logo_white from '../../assets/images/sb_logo_white.png';
import auth_image from '../../assets/images/auth_image.jpg';
import toast from 'react-hot-toast'
import { adminLogin,resetAdminState } from '../../redux/slices/adminSlice';

const AdminLoginPage = () => {

  const [formData, setFormData] = useState({
    'email':'',
    'password':'',
  })

  const [isInitialized, setIsInitialized] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message, isAdminAuthenticated } = useSelector((state) => state.admin);


  useEffect(() => {
    // Clear any stale auth state
    dispatch(resetAdminState());
    setIsInitialized(true);
  }, [dispatch]);

  useEffect(()=>{
    if(isError){
      toast.error(message);
      dispatch(resetAdminState());
    }
  },[isError, message, dispatch])

  useEffect(()=>{
    if( isInitialized && isAdminAuthenticated){
      navigate('/admin/dashboard');
      toast.success("Logged in Successfully")
    }
    return () => {
      dispatch(resetAdminState());
    };
  },[isAdminAuthenticated,navigate,dispatch])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(adminLogin(formData));
  };



  return (
    <div className="h-screen bg-background-500 flex items-center justify-center p-4">
    <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden h-[80vh]">
      <div className="flex h-full">
        {/* Left Side */}
        <div className="bg-primary-700 p-2 w-1/2 flex flex-col items-center justify-center space-y-0">
          <div className="flex-none mb-0 mt-10">
            <img 
              src={sb_logo_white}
              alt="SkillBridge Logo"
              className="h-36 w-auto"
            />
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <img 
              src={auth_image}
              alt="Admin"
              className="rounded-full object-cover w-60 h-60 shadow-lg mb-10"
            />
          </div>
          
          <div className="flex-none mb-20">
            <h2 className="text-white/90 text-center text-lg font-semibold mb-2">Admin Portal</h2>
            <p className="text-white/90 text-center text-sm mb-32">
              Manage. Monitor. Maintain.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-1/2 p-8 mt-7 bg-white">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-primary-700">Admin Login</h2>
            <button 
              onClick={() => navigate('/')}
              className="text-secondary-500 hover:text-primary-700 text-xs">
              Back to Home
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-primary-800">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 rounded-md border-gray-200 border focus:ring-1 focus:ring-primary-500 focus:border-primary-500 focus:outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-primary-800">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-3 rounded-md border-gray-200 border focus:ring-1 focus:ring-primary-500 focus:border-primary-500 focus:outline-none text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 transition-colors text-sm mt-6"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
  )
}

export default AdminLoginPage
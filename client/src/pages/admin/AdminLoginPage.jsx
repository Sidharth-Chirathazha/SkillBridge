import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast'
import { adminLogin,resetAdminState } from '../../redux/slices/adminSlice';
import { useDispatch, useSelector } from 'react-redux';

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
    <div className="min-h-screen w-full flex relative">
      {/* Left Section - Full Background */}
      <div className="absolute inset-0 bg-background-700 lg:block">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content Container */}
      <div className="min-h-screen w-full flex flex-col lg:flex-row relative z-10">
        {/* Left Content */}
        <div className="hidden lg:flex flex-1 flex-col justify-center px-8 lg:px-16 py-8">
          <div className="flex items-center space-x-3 cursor-pointer group mb-6 lg:mb-12">
            <GraduationCap size={48} className="text-background-50 group-hover:text-secondary transition-all duration-700" />
            <span  className="text-background-50 text-3xl lg:text-4xl font-bold group-hover:text-secondary transition-all duration-700"
                   onClick={()=>navigate('/')}
            >
              SkillBridge
            </span>
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-6">Admin Portal</h1>
        </div>

        {/* Right Content - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md lg:max-w-lg bg-white rounded-xl  lg:rounded-2xl shadow-lg lg:shadow-2xl p-6 lg:p-8">

            <div className="lg:hidden flex items-center justify-center mb-6">
              <GraduationCap size={40} className="text-text-600 mr-2" />
              <span className="text-2xl font-bold text-text-600">SkillBridge</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-8">
                <div className='relative'>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-sm lg:text-base rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-text-600 peer"
                    placeholder=" " 
                  />
                  <label className="absolute left-4 top-3 text-text-400 text-sm pointer-events-none transition-all duration-200 
                    peer-placeholder-shown:opacity-100
                    peer-focus:opacity-0
                    peer-[&:not(:placeholder-shown)]:opacity-0">
                    Email Address
                  </label>
                </div>

                <div className='relative'>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-sm lg:text-base rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-text-600 peer"
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-3 text-text-400 text-sm pointer-events-none transition-all duration-200 
                    peer-placeholder-shown:opacity-100
                    peer-focus:opacity-0
                    peer-[&:not(:placeholder-shown)]:opacity-0">
                    Password
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2.5 rounded-lg bg-text-600 hover:bg-text-700 text-white font-medium transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Logging In...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
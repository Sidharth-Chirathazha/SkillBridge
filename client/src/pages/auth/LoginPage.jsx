import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetState, loginUser, googleLogin } from '../../redux/slices/authSlice';
import ForgotPasswordModal from '../../components/common/ForgotPasswordModal';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { GraduationCap } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [userType, setUserType] = useState('student');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message, role } = useSelector((state) => state.auth);

  const handleGoogleSuccess = (response) => {
    const token = response.tokenId || response.credential;
    dispatch(googleLogin({ token, role: userType }))
      .then((action) => {
        if (googleLogin.fulfilled.match(action)) {
          const { role } = action.payload;
          const path = role === 'student' ? '/student/dashboard' : '/tutor/dashboard';
          navigate(path);
          toast.success("Logged in successfully");
        }
      })
      .catch((error) => {
        toast.error(error.message || "Google login failed");
      });
  };

  useEffect(()=>{
    dispatch(resetState());
    
  }, [dispatch])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const action = await dispatch(loginUser({ ...formData, role: userType }));
  
    // Check if login was successful before redirecting
    if (loginUser.fulfilled.match(action)) {
      const { role } = action.payload;
      const path = role === 'student' ? '/student/dashboard' : '/tutor/dashboard';
      navigate(path);
      toast.success("Logged in successfully");
    } else if (loginUser.rejected.match(action)) {
      toast.error(action.payload || "Login failed");
      console.error(action.payload);
      
    }
  };
  

  return (
    <div className="min-h-screen w-full flex relative">
      {/* Left Section - Full Background */}
      <div className="absolute inset-0 bg-primary-500 lg:block">
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
          
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-6">Continue Your Journey</h1>
          <p className="text-base lg:text-xl text-background-100 max-w-xl">
            Your gateway to endless learning possibilities. Join our community of learners 
            and discover new horizons in education.
          </p>
        </div>

        {/* Right Content - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md lg:max-w-lg bg-white rounded-xl  lg:rounded-2xl shadow-lg lg:shadow-2xl p-6 lg:p-8">

            <div className="lg:hidden flex items-center justify-center mb-6">
              <GraduationCap size={40} className="text-primary-600 mr-2" />
              <span className="text-2xl font-bold text-primary-600">SkillBridge</span>
            </div>

            {/* Role Selector */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setUserType('student')}
                className={`flex-1 py-2.5 rounded-lg transition-colors ${
                  userType === 'student'
                    ? 'bg-secondary-500 text-white shadow-md'
                    : 'bg-background-100 text-text-400 hover:bg-background-200'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setUserType('tutor')}
                className={`flex-1 py-2.5 rounded-lg transition-colors ${
                  userType === 'tutor'
                    ? 'bg-secondary-500 text-white shadow-md'
                    : 'bg-background-100 text-text-400 hover:bg-background-200'
                }`}
              >
                Tutor
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-8">
                <div className='relative'>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-sm lg:text-base rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-secondary-500 peer"
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
                    className="w-full px-4 py-3 text-sm lg:text-base rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-secondary-500 peer"
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
                className={`w-full py-2.5 rounded-lg bg-secondary-500 hover:bg-secondary-600 text-white font-medium transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Logging In...' : 'Login'}
              </button>
            </form>

            <div className="my-5 flex items-center">
              <div className="flex-1 border-t border-background-300"></div>
              <span className="mx-4 text-text-400 text-sm">Or continue with</span>
              <div className="flex-1 border-t border-background-300"></div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                logo_alignment="left"
                width="100%"
              />
              
              <button 
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-secondary-500 hover:text-primary-600 text-sm"
              >
                Forgot Password?
              </button>
            </div>

            <p className="text-center mt-6 text-text-400 text-sm">
              New to SkillBridge?{' '}
              <button 
                onClick={() => navigate('/register')} 
                className="text-secondary-500 hover:text-primary-600 font-semibold"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={isForgotPasswordOpen} 
        onClose={() => setIsForgotPasswordOpen(false)} 
      />
    </div>
  );
};

export default LoginPage;
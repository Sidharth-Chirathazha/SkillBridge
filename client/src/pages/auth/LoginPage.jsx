import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetState, loginUser, googleLogin } from '../../redux/slices/authSlice';
import ForgotPasswordModal from '../../components/common/ForgotPasswordModal';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { GraduationCap } from 'lucide-react';
import auth_image from '../../assets/images/auth_image.jpg';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [userType, setUserType] = useState('student');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message, role } = useSelector((state) => state.auth);

  const handleGoogleSuccess = (response) => {
    const token = response.tokenId || response.credential;
    dispatch(googleLogin({ token, role: userType }));
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(resetState());
    }
  }, [isError, message, dispatch]);

  useEffect(() => {
    dispatch(resetState());
    if (role === 'student') {
      navigate('/student/dashboard');
      toast.success(message);
    } else if (role === 'tutor') {
      navigate('/tutor/dashboard');
      toast.success(message);
    }
  }, [isSuccess, role, navigate, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ ...formData, role: userType }));
  };

  return (
    <div className="min-h-screen bg-background-500 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex">
        {/* Left Section - Graphic */}
        <div className="hidden md:flex flex-col items-center justify-center bg-primary-500 w-1/2 p-8 space-y-6">
          <div className="mb-4 flex items-center space-x-3 cursor-pointer group">
            <GraduationCap size={40} className="text-background-50 group-hover:text-secondary transition-all duration-700" />
            <span className="text-background-50 text-3xl font-bold group-hover:text-secondary transition-all duration-700">SkillBridge</span>
          </div>
          <img 
            src={auth_image} 
            alt="Education"
            className="w-56 h-56 object-cover rounded-xl shadow-lg"
          />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-white">Continue Your Journey</h2>
            <p className="text-background-300 text-sm">
              Your gateway to endless learning possibilities
            </p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-text-500">Welcome Back</h1>
              <p className="text-text-400 mt-1 text-sm">
                {userType === 'student' ? 'Student' : 'Tutor'} Login
              </p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="text-secondary-500 hover:text-primary-600 text-sm"
            >
              ← Back Home
            </button>
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
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-500 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg bg-secondary-500 hover:bg-secondary-600 text-white font-medium transition-colors ${
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
              width="300"
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

      <ForgotPasswordModal 
        isOpen={isForgotPasswordOpen} 
        onClose={() => setIsForgotPasswordOpen(false)} 
      />
    </div>
  );
};

export default LoginPage;
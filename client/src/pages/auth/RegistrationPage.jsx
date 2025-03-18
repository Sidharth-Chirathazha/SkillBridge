import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogin, registerUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import Joi from 'joi';
import OtpVerificationModal from '../../components/common/OtpVerificationModal';
import { GraduationCap } from 'lucide-react';

const RegistrationPage = () => {
  const [userType, setUserType] = useState('student');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpModalData, setOtpModalData] = useState({ email: '', password: '' });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isError, message, isLoading, isGoogleSuccess, isGoogleError } = useSelector(state => state.auth);

  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must include letters, numbers, and special characters',
        'string.empty': 'Password is required'
      }),
    confirmPassword: Joi.valid(Joi.ref('password'))
      .required()
      .messages({ 'any.only': 'Passwords must match' })
  });

  const validateField = (field, value) => {
    const fieldSchema = schema.extract(field);
    const { error } = fieldSchema.validate(value);
    return error ? error.details[0].message : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { error } = schema.validate(formData, { abortEarly: false });
    
    if (error) {
      const validationErrors = {};
      error.details.forEach(detail => {
        validationErrors[detail.path[0]] = detail.message;
      });
      setErrors(validationErrors);
      return;
    }

    dispatch(registerUser({ 
      email: formData.email, 
      role: userType, 
      password: formData.password 
    }))
      .unwrap()
      .then(() => {
        toast.success('OTP has been successfully sent to your email.');
        console.log("Called register uesr in register page");
        
        setOtpModalData({ email: formData.email, password: formData.password });
        setIsOtpModalOpen(true);
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const handleGoogleSuccess = (response) => {
    const token = response.tokenId || response.credential;
    dispatch(googleLogin({ token, role: userType }));
  };

  useEffect(() => {
    if (isGoogleSuccess) {
      navigate(`/${userType}/dashboard`);
      toast.success("Logged in successfully");
    }
  }, [isGoogleSuccess, userType, navigate, message]);

  useEffect(() => {
    if (isError || isGoogleError) {
      toast.error(message);
    }
  }, [isError, isGoogleError, message]);

  return (
    <div className="min-h-screen w-full flex relative">
      {/* Left Section - Full Background */}
      <div className="absolute inset-0 bg-primary-500 lg:block">
        <div className="absolute inset-0 bg-black/20" />
        {/* <img 
          src={background_img} 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
        /> */}
      </div>

      {/* Content Container */}
      <div className="min-h-screen w-full flex flex-col lg:flex-row relative z-10">
        {/* Left Content */}
        <div className="hidden lg:flex flex-1 flex-col justify-center px-8 lg:px-16 py-8">
          <div className="flex items-center space-x-3 cursor-pointer group mb-6 lg:mb-12">
            <GraduationCap size={48} className="text-background-50 group-hover:text-secondary transition-all duration-700" />
            <span className="text-background-50 text-3xl lg:text-4xl font-bold group-hover:text-secondary transition-all duration-700"
                  onClick={()=>navigate('/')}
            >
              SkillBridge
            </span>
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-6">Start Your Journey</h1>
          <p className="text-base lg:text-xl text-background-100 max-w-xl">
            Join thousands of learners and educators shaping the future.
            Your gateway to endless learning possibilities.
          </p>
        </div>

        {/* Right Content - Registration Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md lg:max-w-lg bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-2xl p-6 lg:p-8">
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
            <div className="space-y-7"> {/* Keep original spacing */}
                {/* Email Input */}
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm lg:text-base rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-secondary-500 peer"
                    placeholder=" " // Required for floating label
                  />
                  <label className="absolute left-4 top-3 text-text-400 text-sm pointer-events-none transition-all duration-200 
                    peer-placeholder-shown:opacity-100
                    peer-focus:opacity-0
                    peer-[&:not(:placeholder-shown)]:opacity-0">
                    Email Address
                  </label>
                  {errors.email && (
                    <p className="absolute left-0 top-full text-secondary-600 text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm lg:text-base rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-secondary-500 peer"
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-3 text-text-400 text-sm pointer-events-none transition-all duration-200 
                    peer-placeholder-shown:opacity-100
                    peer-focus:opacity-0
                    peer-[&:not(:placeholder-shown)]:opacity-0">
                    Password
                  </label>
                  {errors.password && (
                    <p className="absolute left-0 top-full text-secondary-600 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm lg:text-base rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-secondary-500 peer"
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-3 text-text-400 text-sm pointer-events-none transition-all duration-200 
                    peer-placeholder-shown:opacity-100
                    peer-focus:opacity-0
                    peer-[&:not(:placeholder-shown)]:opacity-0">
                    Confirm Password
                  </label>
                  {errors.confirmPassword && (
                    <p className="absolute left-0 top-full text-secondary-600 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2.5 rounded-lg bg-secondary-500 hover:bg-secondary-600 text-white font-medium transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
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
            </div>

            <p className="text-center mt-6 text-text-400 text-sm">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')} 
                className="text-secondary-500 hover:text-primary-600 font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={otpModalData.email}
        role={userType}
        password={otpModalData.password}
      />
    </div>
  );
};

export default RegistrationPage;
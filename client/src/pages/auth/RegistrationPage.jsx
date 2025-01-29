import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogin, registerUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import Joi from 'joi';
import OtpVerificationModal from '../../components/common/OtpVerificationModal';
import auth_image from '../../assets/images/auth_image.jpg';
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
      toast.success(message);
    }
  }, [isGoogleSuccess, userType, navigate, message]);

  useEffect(() => {
    if (isError || isGoogleError) {
      toast.error(message);
    }
  }, [isError, isGoogleError, message]);

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
          <h2 className="text-xl font-bold text-white">Start Your Journey</h2>
          <p className="text-background-300 text-sm">
            Join thousands of learners and educators shaping the future
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-500">Create Account</h1>
            <p className="text-text-400 mt-1 text-sm">
              {userType === 'student' ? 'Student' : 'Tutor'} Registration
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
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
              {errors.email && <p className="text-secondary-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-500 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
              {errors.password && <p className="text-secondary-600 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-500 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-background-300 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              />
              {errors.confirmPassword && <p className="text-secondary-600 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg bg-secondary-500 hover:bg-secondary-600 text-white font-medium transition-colors ${
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

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            theme="outline"
            size="large"
            shape="pill"
            text="continue_with"
            logo_alignment="left"
            width="300"
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
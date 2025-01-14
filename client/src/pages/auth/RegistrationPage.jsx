import React, { useEffect, useState } from 'react';
import sb_logo_white from '../../assets/images/sb_logo_white.png'
import auth_image from '../../assets/images/auth_image.jpg'
import OtpVerificationModal from '../../components/common/OtpVerificationModal';
import { useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux'
import GoogleButton from '../../components/common/GoogleButton';
import { registerUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const RegistrationPage = ()=> {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    email:'',
    password:'',
    confirmPassword:'',
    general:''
  });


  const [userType, setUserType] = useState('student');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {isError, message, isLoading} = useSelector(state=>state.auth);
  const {email,password} = formData
  const role = userType;

  useEffect(()=>{
    if(isError){
      // setErrors(prev=>({...prev,general: message}));
      toast.error(message)
    }
  }, [isError]);

  const validateForm = ()=>{
    let tempErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      general: ''
    };
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)){
      tempErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(formData.password.trim())){
      tempErrors.password = 'Password must be at least 8 characters long and contain letters, numbers, and special characters';
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword){
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    setErrors(prev=>({
      ...prev,
      [name]:'',
      general:''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()){
      dispatch(registerUser({email, role, password}))
      .unwrap()
      .then(()=>{
        toast.success("OTP has been successfully sent to your email.")
        setIsOtpModalOpen(true);
      })
      .catch((error)=>{
        // setErrors(prev=>({...prev, general: error}));
        // toast.error(error)

      });
    }
  };


  const renderInputField = (name, label, type = "text") => (
    <div>
      <label className="block mb-1 text-xs font-medium text-[#273044]">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className={`w-full p-2 rounded-md border ${
          errors[name] ? 'border-red-500' : 'border-gray-200'
        } focus:ring-1 focus:ring-[#F23276] focus:border-[#F23276] focus:outline-none text-sm`}
        required
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  
  return (
    <div className="h-screen bg-[#EEF1F7] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden h-[80vh]">
        <div className="flex h-full">
          {/* Left Side */}
          <div className="bg-[#1E467F] p-2 w-1/2 flex flex-col items-center justify-center space-y-0">
            <div className="flex-none mb-0 mt-10">
              <img 
                src={sb_logo_white}
                alt="SkillBridge Logo"
                className="h-36 w-auto "
              />
            </div>
            
            <div className="flex-1 flex items-center justify-center ">
              <img 
                src={auth_image}
                alt="Learning"
                className="rounded-full object-cover w-60 h-60shadow-lg mb-10 "
              />
            </div>
            
            <div className="flex-none mb-20">
              <h2 className="text-white/90 text-center text-lg font-semibold mb-2">Welcome to SkillBridge</h2>
              <p className="text-white/90 text-center text-sm mb-32">
                Discover. Learn. Connect. Your gateway to endless possibilities
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-1/2 p-8 mt-2 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#273044]">Sign up</h2>
              <button onClick={()=>navigate('/')} className="text-[#F23276] hover:text-[#1E467F] text-xs">
                Back to Home
              </button>
            </div>

            {/* User Type Toggle */}
            <div className="mb-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setUserType('tutor')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    userType === 'tutor' 
                      ? 'bg-[#F23276] text-white' 
                      : 'text-[#273044] border border-[#F23276] hover:bg-[#F23276]/5'
                  }`}
                >
                  TUTOR
                </button>
                <button
                  onClick={() => setUserType('student')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    userType === 'student' 
                      ? 'bg-[#F23276] text-white' 
                      : 'text-[#273044] border border-[#F23276] hover:bg-[#F23276]/5'
                  }`}
                >
                  STUDENT
                </button>
              </div>
            </div>

            {/* {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-2 rounded-md text-sm mb-4">
                {errors.general}
              </div>
            )} */}

            <form onSubmit={handleSubmit} className="space-y-3">
              {renderInputField("email","Email address")}
              {renderInputField("password", "Password", "password")}
              {renderInputField("confirmPassword", "Confirm Password", "password")}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#F23276] text-white py-2 rounded-md hover:bg-[#1E467F] transition-colors text-sm mt-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="flex items-center justify-center space-x-4 my-2">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="text-gray-500 text-xs">OR</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <GoogleButton/>

              <div className="text-center space-y-2">
                <p className="text-sm text-[#273044]">
                  Already have an account?{' '}
                  <a href="#" onClick={()=>navigate('/login')} className="text-[#F23276] hover:text-[#1E467F] font-medium">
                    Login
                  </a>
                </p>

                <p className="text-xs text-gray-500">
                  By signing up you are agreeing to our{' '}
                  <a href="#" className="text-[#F23276] hover:text-[#1E467F] underline">
                    terms and conditions
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
        <OtpVerificationModal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          email={email}
          role= {role}
          password = {password}
      />
      </div>
    </div>
  );
}

export default RegistrationPage;
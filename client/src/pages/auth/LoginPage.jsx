import React, { useEffect, useState } from 'react';
import sb_logo_white from '../../assets/images/sb_logo_white.png'
import auth_image from '../../assets/images/auth_image.jpg'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import GoogleButton from '../../components/common/GoogleButton';
import {Alert, AlertDescription} from '../../components/common/ui/Alert'
import { resetState, loginUser } from '../../redux/slices/authSlice';
import { XCircle } from 'lucide-react';



const LoginPage = ()=> {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [userType, setUserType] = useState('student');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {isLoading, isError, isSuccess, message, role} = useSelector((state)=>state.auth);

  useEffect(()=>{
    if(isError){
      dispatch(resetState())
    }
  },[formData,dispatch])

  useEffect(()=>{

    dispatch(resetState());

    if (role==='student'){
      navigate('/student/dashboard');
    }else if(role==='tutor'){
      navigate('/tutor/dashboard');
    }

    return ()=>{
      dispatch(resetState());
    };
  }, [isSuccess, role, navigate, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      ...formData,
      role:userType
    };
    dispatch(loginUser(userData));
  };

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
          <div className="w-1/2 p-8 mt-7 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#273044]">Login</h2>
              <button 
                onClick={()=>navigate('/')}
                className="text-[#F23276] hover:text-[#1E467F] text-xs">
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

            {/* Error Message */}
            {isError && (
            <Alert variant="destructive" className="mb-4 flex items-center gap-2  text-red-500 border-red-500 bg-red-50">
              <XCircle className="h-4 w-4 flex-shrink-0 mt-1" />
              <AlertDescription className="text-sm leading-tight mt-1.5">
                {message}
              </AlertDescription>
            </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 text-xs font-medium text-[#273044]">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border-gray-200 border focus:ring-1 focus:ring-[#F23276] focus:border-[#F23276] focus:outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-[#273044]">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border-gray-200 border focus:ring-1 focus:ring-[#F23276] focus:border-[#F23276] focus:outline-none text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#F23276] text-white py-2 rounded-md hover:bg-[#1E467F] transition-colors text-sm mt-2"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <div className="text-right">
                <p className="text-sm text-[#273044]">
                  <a href="#" className="text-[#F23276] hover:text-[#1E467F]  text-xs">
                    Forgot password?
                  </a>
                </p>
              </div>
              

              <div className="flex items-center justify-center  space-x-4 my-2">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="text-gray-500 text-xs">OR</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <GoogleButton/>

              <div className="text-center space-y-2 ">
                <p className="text-sm text-[#273044]">
                  New to Skillbridge?{' '}
                  <a href="#" onClick={()=>navigate('/register')} className="text-[#F23276] hover:text-[#1E467F] font-medium">
                    Register
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
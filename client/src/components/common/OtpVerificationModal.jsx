import React, {useState, useEffect, useRef} from 'react'
import { X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, registerUser } from '../../redux/slices/authSlice';



const OtpVerificationModal = ({isOpen, onClose, email, role, password}) => {
  const [otp, setOtp] = useState(['','','','','','']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const dispatch = useDispatch();
  const { isLoading, isError, message } = useSelector(state => state.auth);

  useEffect(()=>{
    if (isError && message){
      setError(message);
    }
  }, [isError, message]);


  useEffect(()=>{
    let timer;
    if (timeLeft > 0 && isOpen){
        timer = setInterval(()=>{
            setTimeLeft(prev=>{
                if (prev <= 1){
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev-1;
            });
        },1000);
    }
    return ()=>{
        if(timer) clearInterval(timer);
    }
  },[timeLeft,isOpen]);

  const handleChange = (index,value)=>{
    if (value.length > 1) return;// Prevent multiple digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index<5){
        inputRefs.current[index+1].focus();
    }
  };

  const handleKeyDown = (index, e)=>{
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index>0){
        inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((value, index) => {
      if (index < 6) newOtp[index] = value;
    });
    setOtp(newOtp);
  };

  const handleResend = () => {
    setTimeLeft(30);
    setCanResend(false);
    setError('')
    // Add your resend OTP logic here
    dispatch(registerUser({email, role, password}))
    
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError("Please enter a 6 digit otp")
      return;
    }
    setError('');

    dispatch(verifyOtp({email, otp:otpString, role, password}))
    .unwrap()
    .then(()=>{
      onClose();
    })
    .catch((error)=>{

    });
    
  };

  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-text text-xl font-bold mb-2">Verify Your Email</h2>
            <p className="text-sm text-gray-600">
              We've sent a verification code to<br />
              <span className="font-medium">{email}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OTP Input Fields */}
        <div className="flex gap-2 mb-6 justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 border-2 rounded-lg text-center text-lg font-bold 
                       focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
                       text-text"
            />
          ))}
        </div>

        {/* Timer and Resend */}
        <div className="text-center mb-6">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-600">
              Resend code in {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-primary hover:text-secondary font-medium text-sm"
            >
              Resend Code
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}


        {/* Verify Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`w-full bg-primary text-white py-3 rounded-lg ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'
          } transition-colors font-medium`}
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </button>
      </div>
    </div>
  )
}

export default OtpVerificationModal
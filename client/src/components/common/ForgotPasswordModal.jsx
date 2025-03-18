import React, { useEffect, useRef, useState } from 'react'
import { X  } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { requestResetPasswordOtp, verifyResetPasswordOtp, resetPassword, resetState } from '../../redux/slices/authSlice'
import toast from 'react-hot-toast';

const ForgotPasswordModal = ({isOpen, onClose}) => {

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['','','','','',''])
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message,otpRequestSuccess, 
    otpVerifySuccess, 
    passwordResetSuccess  } = useSelector(state => state.auth);

    // Separate useEffects for different success states
  useEffect(() => {
    if (otpRequestSuccess) {
      toast.success('OTP sent successfully to your email');
      setStep(2);
      startTimeRef.current = Date.now();
      setTimeLeft(30);
      setCanResend(false);
      dispatch(resetState());
    }
  }, [otpRequestSuccess]);

  useEffect(() => {
    if (otpVerifySuccess) {
      toast.success('OTP verified successfully');
      setStep(3);
      dispatch(resetState());
    }
  }, [otpVerifySuccess]);

  useEffect(() => {
    if (passwordResetSuccess) {
      toast.success('Password reset successful');
      handleClose();
      dispatch(resetState());
    }
  }, [passwordResetSuccess]);
  
  useEffect(() => {
    if (isError) {
      toast.error("An error occured");
      dispatch(resetState());
    }
  }, [isError]);

useEffect(()=>{
  if(isOpen && step === 2){
    if(startTimeRef.current === null){
      startTimeRef.current = Date.now();
      setTimeLeft(30);
      setCanResend(false);
    }
    timerRef.current = setInterval(()=>{
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current)/1000);
      const newTimeLeft = Math.max(30 - elapsedSeconds, 0);

      setTimeLeft(newTimeLeft);

      if(newTimeLeft === 0){
        setCanResend(true);
        clearInterval(timerRef.current);
      }
    }, 100);
  }

  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, [isOpen, step])

const handleClose = () => {
  setStep(1);
  setEmail('');
  setOtp(['', '', '', '', '', '']);
  setPasswords({
    newPassword: '',
    confirmPassword: '',
  });
  // Reset timer state
  if (timerRef.current) {
    clearInterval(timerRef.current);
  }
  startTimeRef.current = null;
  setTimeLeft(30);
  setCanResend(false);
  dispatch(resetState());
  onClose();
};

  const handleEmailSubmit = async()=>{
    dispatch(requestResetPasswordOtp({email}));
  };

  const handleOTPChange = (index, value)=>{
    if(value.length > 1)return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if(value && index<5){
        inputRefs.current[index+1].focus();
    }
  };

  const handleOTPKeyDown = (index, e)=>{
    if(e.key==='Backspace' && !otp[index] && index>0){
        inputRefs.current[index-1].focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((value, index) => {
      if (index < 6) newOtp[index] = value;
    });
    setOtp(newOtp);
  };

  const handleResendOTP = ()=>{
    startTimeRef.current = Date.now();
    setTimeLeft(30);
    setCanResend(false);
    dispatch(requestResetPasswordOtp({email}));
    toast.loading('Sending OTP...', {
        duration: 2000,
      });
  };

  const handleOTPSubmit = ()=>{
    const otpString = otp.join('');
    if (otpString.length !== 6){
        toast.error('Please enter a 6-digit OTP');
        return;
    }
    dispatch(verifyResetPasswordOtp({email, otp: otpString}));
  };

  const handlePasswordSubmit = ()=>{
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(passwords.newPassword !== passwords.confirmPassword){
        toast.error('Passwords do not match');
        return;
    }
    if (!passwordRegex.test(passwords.newPassword.trim())){
        toast.error('Password must be at least 8 characters long and contain at least one letter, one number, and one special character');
        return;
    }
    dispatch(resetPassword({
        email,
        new_password: passwords.newPassword,
    }));
  };

  const handlePasswordChange = (e)=>{
    const {name, value} = e.target;
    setPasswords(prev=>({
        ...prev,
        [name]:value
    }));
  };

 

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-text text-xl font-bold mb-2">
              {step === 1 && "Reset Password"}
              {step === 2 && "Verify Your Email"}
              {step === 3 && "Set New Password"}
            </h2>
            {step === 2 && (
              <p className="text-sm text-gray-600">
                We've sent a verification code to<br />
                <span className="font-medium">{email}</span>
              </p>
            )}
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* {(isError || validationError) && (
          <Alert variant="destructive" className="mb-4 flex items-center gap-2 text-red-500 border-red-500 bg-red-50">
            <XCircle className="h-4 w-4 flex-shrink-0 mt-1" />
            <AlertDescription className="text-sm leading-tight mt-1.5">
              {validationError || message}
            </AlertDescription>
          </Alert>
        )} */}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-[#273044]">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded-md border-gray-200 border focus:ring-1 focus:ring-[#F23276] focus:border-[#F23276] focus:outline-none text-sm"
                required
              />
            </div>
            <button
              onClick={handleEmailSubmit}
              disabled={isLoading}
              className="w-full bg-[#F23276] text-white py-3 rounded-lg hover:bg-[#1E467F] transition-colors font-medium"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <>
            <div className="flex gap-2 mb-6 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  onPaste={handleOTPPaste}
                  className="w-12 h-12 border-2 rounded-lg text-center text-lg font-bold focus:border-[#F23276] focus:outline-none focus:ring-1 focus:ring-[#F23276] text-text"
                />
              ))}
            </div>

            <div className="text-center mb-6">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend code in {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, '0')}
                </p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  className="text-[#F23276] hover:text-[#1E467F] font-medium text-sm"
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              onClick={handleOTPSubmit}
              disabled={isLoading}
              className="w-full bg-[#F23276] text-white py-3 rounded-lg hover:bg-[#1E467F] transition-colors font-medium"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-[#273044]">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 rounded-md border-gray-200 border focus:ring-1 focus:ring-[#F23276] focus:border-[#F23276] focus:outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-[#273044]">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 rounded-md border-gray-200 border focus:ring-1 focus:ring-[#F23276] focus:border-[#F23276] focus:outline-none text-sm"
                required
              />
            </div>
            <button
              onClick={handlePasswordSubmit}
              disabled={isLoading}
              className="w-full bg-[#F23276] text-white py-3 rounded-lg hover:bg-[#1E467F] transition-colors font-medium"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordModal
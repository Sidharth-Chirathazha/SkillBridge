import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyPurchaseStatus } from '../redux/slices/courseSlice';
import toast from 'react-hot-toast';

const SuccessPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = new URLSearchParams(location.search).get('session_id');
  const courseTitle = new URLSearchParams(location.search).get('course_title');
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyPurchase = async () => {
      // Additional parameter validation
      if (!sessionId) {
        console.error('No session ID found');
        toast.error('Invalid payment session');
        navigate('/student/dashboard');
        return;
      }

      try {
        // Ensure we only verify once
        if (hasVerified.current) return;
        hasVerified.current = true;

        console.log('Verifying purchase for session:', sessionId);
        
        const result = await dispatch(verifyPurchaseStatus(sessionId)).unwrap();
        
        console.log('Purchase verification result:', result);
        
        localStorage.removeItem("checkoutSession");
        toast.success(`Payment completed successfully for ${courseTitle || 'the course'}`);
        
        setTimeout(() => {
          navigate("/student/learning/");
        }, 2000);
      } catch (error) {
        console.error('Detailed Verification Error:', {
          message: error.message,
          details: error
        });

        // More specific error handling
        if (error.response) {
          // The request was made and the server responded with a status code
          toast.error(error.response.data.error || 'Purchase verification failed');
        } else if (error.request) {
          // The request was made but no response was received
          toast.error('No response from server. Please contact support.');
        } else {
          // Something happened in setting up the request
          toast.error('An unexpected error occurred during verification');
        }

        navigate('/student/dashboard');
      }
    };

    verifyPurchase();
  }, [sessionId, dispatch, navigate, courseTitle]);

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold mb-4">Processing Payment...</h1>
      {courseTitle && (
        <p className="mb-4">Verifying your purchase of {courseTitle}</p>
      )}
      <p>Please do not close this page</p>
      <div className="flex justify-center mt-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );
};

export default SuccessPage;
// SuccessPage.js
import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (sessionId) {
      dispatch(verifyPurchaseStatus(sessionId))
        .unwrap()
        .then(() => {
          // Handle successful verification
          // Maybe redirect to course page or dashboard
          toast.success("Payment completed successfully")
          setTimeout(() => {
            navigate("/student/learning/");
          }, 2000);
        })
        .catch((error) => {
          console.error('Verification error:', error);
          toast.error("Some error occured with purchase verification")
        });
    }
  }, [sessionId, dispatch]);

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
      {courseTitle && (
        <p className="mb-4">Thank you for purchasing {courseTitle}!</p>
      )}
      <p>You can now access your course.</p>
      <button
        onClick={() => navigate('/student/learning/')}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default SuccessPage;
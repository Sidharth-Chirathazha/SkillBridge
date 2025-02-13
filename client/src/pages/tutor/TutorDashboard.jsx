import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../../redux/slices/authSlice";
import { Link } from "react-router-dom";
import TutorVerificationMessage from "../../components/tutor/TutorVerificationMessage";

const TutorDashboard = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <>
      {userData?.is_verified === false ? (
        <TutorVerificationMessage/>
      ) : (
        <div className="text-text-700">
          <h1 className="text-2xl font-bold">Welcome to Your Tutor Dashboard!</h1>
          {/* Add more dashboard content here */}
        </div>
      )}
    </>
  );
};

export default TutorDashboard;

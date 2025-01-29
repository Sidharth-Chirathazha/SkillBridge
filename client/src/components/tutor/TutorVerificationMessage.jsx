import React from 'react'
import { Link } from "react-router-dom";

const TutorVerificationMessage = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-background-100 border border-background-300 rounded-lg shadow-md p-8 max-w-lg text-center">
            <h2 className="text-primary-600 text-2xl font-bold mb-4">
              Complete Your Profile
            </h2>
            <p className="text-text-600 mb-6">
              Thanks for registering with <span className="font-medium">Skill Bridge</span>. To gain access as a tutor, please complete your profile. 
              After completing your profile, the verification process may take <span className="font-medium">5-6 days</span>.
            </p>
            <Link
              to="/tutor/profile/"
              className="text-secondary-500 hover:text-secondary-600 font-medium"
            >
              Complete Your Profile
            </Link>
          </div>
    </div>
  )
}

export default TutorVerificationMessage
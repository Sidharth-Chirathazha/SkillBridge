import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const UserPrivateRoute = () => {
  const token = localStorage.getItem('access_token');

  // Redirect if the user is not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Allow access to child routes if authenticated
  return <Outlet />;
};

export default UserPrivateRoute;

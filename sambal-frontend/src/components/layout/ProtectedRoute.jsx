import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';

export function ProtectedRoute({ children, reqRole }) {
  const { user, role } = useStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (reqRole && role !== reqRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

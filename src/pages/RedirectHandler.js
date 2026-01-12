// src/components/RedirectHandler.js
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RedirectHandler.css';

const RedirectHandler = () => {
  const { shortId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // If we reach this component, it means React Router didn't have a matching route
    // So we should redirect to the backend endpoint
    if (shortId) {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      window.location.href = `${backendUrl}/${shortId}`;
    } else {
      navigate('/');
    }
  }, [shortId, navigate]);

  return (
    <div className="redirect-loading">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default RedirectHandler;
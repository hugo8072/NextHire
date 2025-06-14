import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import VerificationView from './VerificationView';

function Verification() {
  const [formData, setFormData] = useState({
    verificationCode: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!email) {
      navigate('/users/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const email = localStorage.getItem('email');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/login-validation`,
        { ...formData, email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      const successMessage = response.status === 200 ? 'Verification successful!' : 'Verification failed';
      setSuccess(successMessage);
      setError('');

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        const userId = response.data.userId;
        navigate(`/users/${userId}/profile`);
      }
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';

      if (error.response) {
        errorMessage = error.response.data.error || error.response.statusText;
      } else if (error.request) {
        errorMessage = 'Error sending request. The server did not respond.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }

      setError(errorMessage);
      setSuccess('');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <VerificationView
      formData={formData}
      error={error}
      success={success}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleHome={handleHome}
    />
  );
}

export default Verification;
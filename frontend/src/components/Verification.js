import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import VerificationView from './VerificationView';

/**
 * Verification Container Component - Manages email verification logic and state
 * Handles verification code submission, API calls, and state management for user verification
 * Passes data and handlers to VerificationView component for presentation
 * @returns {JSX.Element} VerificationView component with all required props
 */
function Verification() {
  /**
   * Form data state for verification code
   * @type {Object}
   * @property {string} verificationCode - The verification code entered by user
   */
  const [formData, setFormData] = useState({
    verificationCode: ''
  });

  /**
   * Error state for verification failures
   * @type {string}
   */
  const [error, setError] = useState('');

  /**
   * Success state for successful verification
   * @type {string}
   */
  const [success, setSuccess] = useState('');

  /**
   * Navigation hook for programmatic routing
   * @type {Function}
   */
  const navigate = useNavigate();

  /**
   * Effect hook to check if user has email stored from login
   * Redirects to login if no email is found in localStorage
   */
  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!email) {
      navigate('/users/login');
    }
  }, [navigate]);

  /**
   * Handles form input changes
   * Updates the formData state when user types in verification code field
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handles form submission for verification code validation
   * Sends verification code and email to backend for validation
   * On success, stores authentication data and navigates to user profile
   * @param {Event} e - The form submit event
   */
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

      // Handle successful verification
      if (response.status === 200) {
        // Extract user data from response with fallback options
        const userData = response.data.user || response.data;
        const token = response.data.token || userData.token;
        const name = userData.name;
        const _id = userData._id || userData.id;

        // Validate extracted data before storing
        if (token && _id) {
          // Store authentication data in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('name', name);
          localStorage.setItem('userId', _id);

          // Navigate to user profile
          navigate(`/users/${_id}/profile`, { state: { name } });
        } else {
          setError('Invalid response data from server');
        }
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

  /**
   * Handles navigation to home page
   * Redirects user to the home page
   */
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
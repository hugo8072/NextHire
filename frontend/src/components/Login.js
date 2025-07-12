import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginView from './LoginView';

/**
 * Login Container Component - Manages user authentication logic and state
 * Handles form validation, API calls, and state management for user login
 * Passes data and handlers to LoginView component for presentation
 * @returns {JSX.Element} LoginView component with all required props
 */
function Login() {
  /**
   * Form data state containing email and password
   * @type {Object}
   * @property {string} email - User's email address
   * @property {string} password - User's password
   */
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  /**
   * reCAPTCHA token state
   * @type {string}
   */
  const [captchaToken, setCaptchaToken] = useState('');

  /**
   * Error message state for displaying login errors
   * @type {string}
   */
  const [error, setError] = useState('');

  /**
   * Loading state for form submission
   * @type {boolean}
   */
  const [loading, setLoading] = useState(false);

  /**
   * Navigation hook for programmatic routing
   * @type {Function}
   */
  const navigate = useNavigate();

  /**
   * Handles form input changes
   * Updates the formData state when user types in input fields
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles reCAPTCHA token change
   * Updates the captchaToken state when user completes reCAPTCHA
   * @param {string} token - The reCAPTCHA token
   */
  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  /**
   * Handles form submission for user login
   * Validates form data, sends login request to backend,
   * and redirects to verification page on success
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send login request to backend
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/login`,
        {
          email: formData.email,
          password: formData.password,
          captchaToken: captchaToken
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      // Handle successful login response
      if (response.status === 200) {
        // Store user email in localStorage for verification step
        localStorage.setItem('email', formData.email);
        
        // Navigate to verification page
        navigate('/users/verification');
      }
    } catch (error) {
      // Handle login errors
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginView
      formData={formData}
      handleChange={handleChange}
      captchaToken={captchaToken}
      handleCaptchaChange={handleCaptchaChange}
      error={error}
      loading={loading}
      handleSubmit={handleSubmit}
      navigate={navigate}
    />
  );
}

export default Login;
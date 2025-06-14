import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoginView from './LoginView';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCaptcha = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setError('Please complete the captcha.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/login`,
        { ...formData, captchaToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      const successMessage = response.status === 200 ? 'Login successful!' : 'Login failed';
      setSuccess(successMessage);
      setError('');

      if (response.status === 200) {
        localStorage.setItem('email', formData.email);
        navigate('/users/verification');
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
    <LoginView
      formData={formData}
      error={error}
      success={success}
      showPassword={showPassword}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      setShowPassword={setShowPassword}
      handleHome={handleHome}
      handleCaptcha={handleCaptcha}
    />
  );
}

export default Login;
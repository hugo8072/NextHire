import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RegisterView from './RegisterView';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[\W_]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'password' || name === 'confirmPassword') {
      setPasswordMatch(
        name === 'password'
          ? value === formData.confirmPassword
          : value === formData.password
      );
    }

    if (name === 'password') {
      const passwordErrors = validatePassword(value);
      setValidationErrors({
        ...validationErrors,
        password: passwordErrors
      });
    }

    if (name === 'name' && !value) {
      setValidationErrors({
        ...validationErrors,
        name: ['Name is required']
      });
    } else if (name === 'name') {
      setValidationErrors({
        ...validationErrors,
        name: []
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Creating registration info...');

    if (!passwordMatch) {
      setError('Passwords do not match');
      setSuccess('');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Invalid email address');
      setSuccess('');
      return;
    }

    if (validationErrors.password && validationErrors.password.length > 0) {
      setError(validationErrors.password.join(', '));
      setSuccess('');
      return;
    }

    if (validationErrors.name && validationErrors.name.length > 0) {
      setError(validationErrors.name.join(', '));
      setSuccess('');
      return;
    }

    try {
      console.log('Sending registration info...');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/register`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        setSuccess('Registration successful!');
        setError('');
      } else {
        setError('Registration failed');
        setSuccess('');
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
      console.error('Registration error:', errorMessage);
    }
  };

  return (
    <RegisterView
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      passwordMatch={passwordMatch}
      validationErrors={validationErrors}
      error={error}
      success={success}
      navigate={navigate}
    />
  );
}

export default Register;
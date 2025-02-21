import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

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
      setPasswordMatch(value === formData.password || value === formData.confirmPassword);
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
        'http://localhost:8000/users/register',
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
    <div className="register-container">
      <h1>Register Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          {validationErrors.name && validationErrors.name.map((error, index) => (
            <p key={index} style={{ color: 'red' }}>{error}</p>
          ))}
        </div>
        <div>
          <label>Password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {validationErrors.password && validationErrors.password.map((error, index) => (
            <p key={index} style={{ color: 'red' }}>{error}</p>
          ))}
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {!passwordMatch && <p style={{ color: 'red' }}>Passwords do not match</p>}
        </div>
        <div>
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Hide Passwords' : 'Show Passwords'}
          </button>
        </div>
        <div>
          <label>Phone Number:</label>
          <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="button-container">
          <button type="submit">Register</button>
          <button type="button" onClick={() => window.location.href = '/'}>Home</button>
        </div>

      </form>
      {success && (
        <div className="modal">
          <div className="modal-content">
            <p style={{ color: 'green' }}>{success}</p>
            <div className="button-container">
              <button type="button" onClick={() => navigate('/users/login')}>Login</button>
              <button type="button" onClick={() => window.location.href = '/'}>Home</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Verification() {
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:8000/users/login-validation',
        formData,
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
        const userId = response.data.userId; // Assuming the backend returns the user ID
        navigate(`/user/${userId}/profile`); // Navigate to user profile page
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

  return (
    <div className="login-container">
      <h1>Verification Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Verification Code:</label>
          <input type="text" name="verificationCode" value={formData.verificationCode} onChange={handleChange} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <div className="button-container">
          <button type="submit">Verify</button>
        </div>
        <div className="button-container">
          <button type="button" onClick={() => window.location.href = '/'}>Home</button>
        </div>
      </form>
    </div>
  );
}

export default Verification;
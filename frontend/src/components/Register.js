import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    chatId: ''
  });

  const [errors, setErrors] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/register', formData);
      console.log(response.data);
      // Handle successful registration (e.g., redirect to login page)
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  };

  return (
    <div className="register-container">
      <h1>Register Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div>
          <label>Phone Number:</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
        </div>
        <div>
          <label>Telegram Chat ID:</label>
          <input type="text" name="chatId" value={formData.chatId} onChange={handleChange} required />
        </div>
        <div className="button-container">
          <button type="submit">Register</button>
        </div>
      </form>
      {errors.length > 0 && (
        <div className="errors">
          <h2>Errors:</h2>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error.msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Register;
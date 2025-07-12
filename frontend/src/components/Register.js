import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RegisterView from './RegisterView';

/**
 * Register Container Component - Manages user registration logic and state
 * Handles form validation, API calls, and state management for user registration
 * Passes data and handlers to RegisterView component for presentation
 * @returns {JSX.Element} RegisterView component with all required props
 */
function Register() {
  /**
   * Form data state for user registration
   * @type {Object}
   */
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });

  /**
   * Error state for registration failures
   * @type {string}
   */
  const [error, setError] = useState('');

  /**
   * Modal visibility state for registration success
   * @type {boolean}
   */
  const [showModal, setShowModal] = useState(false);

  /**
   * Password confirmation match state
   * @type {boolean}
   */
  const [passwordMatch, setPasswordMatch] = useState(true);

  /**
   * Password visibility toggle state
   * @type {boolean}
   */
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Validation errors for form fields
   * @type {Object}
   */
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Navigation hook for programmatic routing
   * @type {Function}
   */
  const navigate = useNavigate();

  /**
   * Validates password strength and requirements
   * @param {string} password - The password to validate
   * @returns {Array<string>} Array of validation error messages
   */
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

  /**
   * Handles form field changes with validation
   * Updates form data and performs real-time validation for password and name fields
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password confirmation match
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordMatch(
        name === 'password'
          ? value === formData.confirmPassword
          : value === formData.password
      );
    }

    // Validate password strength
    if (name === 'password') {
      const passwordErrors = validatePassword(value);
      setValidationErrors({
        ...validationErrors,
        password: passwordErrors
      });
    }

    // Validate name field
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

  /**
   * Handles form submission with comprehensive validation
   * Validates all fields and submits registration data to the API
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check password confirmation match
    if (!passwordMatch) {
      setError('Passwords do not match');
      return;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Invalid email address');
      return;
    }

    // Check password validation errors
    if (validationErrors.password && validationErrors.password.length > 0) {
      setError(validationErrors.password.join(', '));
      return;
    }

    // Check name validation errors
    if (validationErrors.name && validationErrors.name.length > 0) {
      setError(validationErrors.name.join(', '));
      return;
    }

    try {
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
        setError('');
        setShowModal(true);
      } else {
        setError('Registration failed');
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
    }
  };

  // Mensagem única para o modal
  const modalMessage =
    `Registration successful!\n\n` +
    `To complete your setup, please search for the bot "NextHire App" on Telegram\n` +
    `and send it the following message:\n\n` +
    `/start ${formData.email}\n\n` +
    `This will link your user to your Telegram account and enable two-factor authentication for login.`;

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
      showModal={showModal}
      setShowModal={setShowModal}
      modalMessage={modalMessage}
      navigate={navigate}
    />
  );
}

export default Register;
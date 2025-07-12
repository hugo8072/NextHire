import React from 'react';
import { Box, Paper, Typography, Stack, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

/**
 * RegisterView Component - Presentational component for user registration interface
 * Displays registration form with validation feedback in a futuristic design
 * This is a pure presentational component that receives all data and handlers as props
 * @param {Object} props - The component props
 * @param {Object} props.formData - Registration form data
 * @param {Function} props.handleChange - Handler for form field changes
 * @param {Function} props.handleSubmit - Handler for form submission
 * @param {boolean} props.showPassword - Password visibility state
 * @param {Function} props.setShowPassword - Handler for password visibility toggle
 * @param {boolean} props.passwordMatch - Password confirmation match state
 * @param {Object} props.validationErrors - Validation errors for form fields
 * @param {string} props.error - Error message for display
 * @param {string} props.success - Success message for display
 * @param {Function} props.navigate - Navigation function for routing
 * @returns {JSX.Element} Rendered registration view component
 */
function RegisterView({
  formData,
  handleChange,
  handleSubmit,
  showPassword,
  setShowPassword,
  passwordMatch,
  validationErrors,
  error,
  showModal,
  setShowModal,
  modalMessage,
  navigate
}) {
  /**
   * Toggles password visibility state
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Navigates to login page
   */
  const navigateToLogin = () => {
    setShowModal(false);
    navigate('/users/login');
  };

  /**
   * Navigates to home page
   */
  const navigateToHome = () => {
    setShowModal(false);
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(120deg, #0f2027, #232526, #0f2027, #00ff99 80%)',
        backgroundSize: '400% 400%',
        animation: 'gradientBG 15s ease infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <style>
        {`
          @keyframes gradientBG {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }
        `}
      </style>
      <Paper
        elevation={16}
        sx={{
          bgcolor: '#232526',
          borderRadius: 6,
          minWidth: 400,
          p: 4,
          boxShadow: '0 8px 32px 0 #00ff9977',
          border: '1.5px solid #00ff99',
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Typography
            variant="h4"
            sx={{
              color: '#00ff99',
              fontWeight: 900,
              letterSpacing: 2,
              textShadow: '0 0 16px #00ff99, 0 4px 32px #0f2027',
              fontFamily: 'Orbitron, monospace',
              mb: 2,
            }}
          >
            Register
          </Typography>

          {/* Registration form */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Stack spacing={2}>
              {/* Email field */}
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                sx={inputSx}
                InputLabelProps={{ style: { color: '#1de9b6' } }}
              />

              {/* Name field with validation */}
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                sx={inputSx}
                InputLabelProps={{ style: { color: '#1de9b6' } }}
                error={!!(validationErrors.name && validationErrors.name.length)}
                helperText={validationErrors.name && validationErrors.name.map((err, i) => (
                  <span key={i} style={{ color: '#ff3333' }}>{err}</span>
                ))}
              />

              {/* Password field with visibility toggle */}
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                sx={inputSx}
                InputLabelProps={{ style: { color: '#1de9b6' } }}
                error={!!(validationErrors.password && validationErrors.password.length)}
                helperText=" " // Space to maintain height
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        sx={{ color: '#00ff99' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password validation errors display */}
              {validationErrors.password && validationErrors.password.length > 0 && (
                <Stack spacing={0.5} sx={{ mt: 0.5, mb: 1, width: '100%' }}>
                  {validationErrors.password.map((err, i) => (
                    <Typography
                      key={i}
                      sx={{
                        color: '#ff3333',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        ml: 1,
                      }}
                    >
                      {err}
                    </Typography>
                  ))}
                </Stack>
              )}

              {/* Confirm password field */}
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                fullWidth
                sx={inputSx}
                InputLabelProps={{ style: { color: '#1de9b6' } }}
                error={!passwordMatch}
                helperText={!passwordMatch && <span style={{ color: '#ff3333' }}>Passwords do not match</span>}
              />

              {/* Phone number field */}
              <TextField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                fullWidth
                sx={inputSx}
                InputLabelProps={{ style: { color: '#1de9b6' } }}
              />

              {/* Error message display */}
              {error && (
                <Typography sx={{ color: '#ff3333', fontWeight: 700, textAlign: 'center' }}>
                  {error}
                </Typography>
              )}

              {/* Form action buttons */}
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  type="submit"
                  variant="outlined"
                  sx={buttonSx}
                >
                  Register
                </Button>
                <Button
                  variant="outlined"
                  sx={buttonSx}
                  onClick={navigateToHome}
                >
                  Home
                </Button>
              </Stack>
            </Stack>
          </form>

          {/* Modal de sucesso */}
          {showModal && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}>
              <div style={{
                background: '#232526',
                color: '#00ff99',
                padding: '2rem',
                borderRadius: '16px',
                maxWidth: '420px',
                textAlign: 'center',
                boxShadow: '0 8px 32px 0 #00ff9977',
                border: '1.5px solid #00ff99',
                fontFamily: 'Orbitron, monospace'
              }}>
                <h2 style={{ color: '#00ff99', marginBottom: '1rem' }}>Registration Successful!</h2>
                <pre style={{
                  whiteSpace: 'pre-line',
                  color: '#00ff99',
                  background: 'transparent',
                  fontFamily: 'inherit',
                  fontSize: '1.05rem',
                  marginBottom: '1.5rem'
                }}>{modalMessage}</pre>
                <Button
                  variant="outlined"
                  sx={{ ...buttonSx, marginRight: '1rem' }}
                  onClick={navigateToLogin}
                >
                  Go to Login
                </Button>
                <Button
                  variant="outlined"
                  sx={buttonSx}
                  onClick={navigateToHome}
                >
                  Go to Home
                </Button>
              </div>
            </div>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

// Styles for input fields
const inputSx = {
  bgcolor: '#232526',
  color: '#1de9b6',
  fontFamily: 'monospace',
  borderRadius: 1,
  '& input': {
    color: '#1de9b6',
    fontFamily: 'monospace',
    background: 'transparent',
  },
  '& fieldset': {
    borderColor: '#1de9b6',
  },
  '&:hover fieldset': {
    borderColor: '#00ff99',
  },
  '& label': {
    color: '#1de9b6',
  },
};

// Styles for buttons
const buttonSx = {
  color: '#00ff99',
  borderColor: '#00ff99',
  borderRadius: 2,
  fontWeight: 700,
  px: 4,
  '&:hover': {
    background: 'rgba(0,255,153,0.08)',
    color: '#fff',
    borderColor: '#fff',
  },
};

export default RegisterView;
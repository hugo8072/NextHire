import React, { useState } from 'react';
import { Box, Button, Typography, Stack, Paper, TextField, Alert, IconButton, InputAdornment } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ReCAPTCHA from 'react-google-recaptcha';

/**
 * LoginView Component - Presentational component for user login interface
 * Displays login form with validation feedback in a futuristic design
 * This is a pure presentational component that receives all data and handlers as props
 * @param {Object} props - The component props
 * @param {Object} props.formData - Login form data
 * @param {Function} props.handleChange - Handler for form field changes
 * @param {string} props.captchaToken - reCAPTCHA token
 * @param {Function} props.handleCaptchaChange - Handler for reCAPTCHA changes
 * @param {string} props.error - Error message for display
 * @param {boolean} props.loading - Loading state for form submission
 * @param {Function} props.handleSubmit - Handler for form submission
 * @param {Function} props.navigate - Navigation function for routing
 * @returns {JSX.Element} Rendered login view component
 */
function LoginView({
  formData,
  handleChange,
  captchaToken,
  handleCaptchaChange,
  error,
  loading,
  handleSubmit,
  navigate
}) {
  // Novo estado para mostrar/esconder password
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Navigates to home page
   */
  const navigateToHome = () => {
    navigate('/');
  };

  /**
   * Navigates to register page
   */
  const navigateToRegister = () => {
    navigate('/users/register');
  };

  /**
   * Toggles the visibility of the password
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
      }}
    >
      {/* CSS keyframes for animated gradient background */}
      <style>
        {`
          @keyframes gradientBG {
            0% {background-position: 0% 50%;}
            50% {background-position: 100% 50%;}
            100% {background-position: 0% 50%;}
          }
        `}
      </style>
      
      {/* Main login form container */}
      <Paper
        elevation={16}
        sx={{
          p: 6,
          borderRadius: 6,
          bgcolor: 'rgba(15,32,39,0.85)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px 0 #00ff9977',
          border: '1.5px solid #00ff99',
          minWidth: 400,
        }}
      >
        <Stack spacing={3} alignItems="center">
          {/* Login form title */}
          <Typography
            variant="h3"
            sx={{
              color: '#00ff99',
              fontWeight: 900,
              letterSpacing: 3,
              textShadow: '0 0 16px #00ff99, 0 4px 32px #0f2027',
              mb: 2,
              fontFamily: 'Orbitron, monospace',
            }}
          >
            Login
          </Typography>

          {/* Error message display */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Stack spacing={3}>
              {/* Email input field */}
              <TextField
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                sx={{
                  '& .MuiInputLabel-root': { color: '#00ff99' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#00ff99' },
                    '&:hover fieldset': { borderColor: '#00ff99' },
                    '&.Mui-focused fieldset': { borderColor: '#00ff99' },
                  },
                }}
              />

              {/* Password input field */}
              <TextField
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                sx={{
                  '& .MuiInputLabel-root': { color: '#00ff99' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: '#00ff99' },
                    '&:hover fieldset': { borderColor: '#00ff99' },
                    '&.Mui-focused fieldset': { borderColor: '#00ff99' },
                  },
                }}
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

              {/* reCAPTCHA component */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={handleCaptchaChange}
                />
              </Box>

              {/* Form action buttons */}
              <Stack direction="row" spacing={2} justifyContent="center">
                {/* Submit button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                  disabled={loading || !captchaToken}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 4,
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #00ff99 0%, #232526 100%)',
                    color: '#232526',
                    boxShadow: '0 2px 16px #00ff99aa',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 32px #00ff99cc',
                      background: 'linear-gradient(90deg, #232526 0%, #00ff99 100%)',
                      color: '#00ff99',
                    },
                    '&:disabled': {
                      opacity: 0.6,
                      transform: 'none',
                    },
                  }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>

                {/* Home button */}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={navigateToHome}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 4,
                    fontWeight: 700,
                    color: '#00ff99',
                    borderColor: '#00ff99',
                    transition: 'transform 0.2s, border-color 0.2s, color 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      borderColor: '#fff',
                      color: '#fff',
                      background: 'rgba(0,255,153,0.08)',
                    },
                  }}
                >
                  Home
                </Button>
              </Stack>
            </Stack>
          </form>

          {/* Register link */}
          <Typography sx={{ color: '#fff', textAlign: 'center', mt: 2 }}>
            Don't have an account?{' '}
            <Button
              variant="text"
              onClick={navigateToRegister}
              sx={{
                color: '#00ff99',
                fontWeight: 700,
                textDecoration: 'underline',
                '&:hover': {
                  color: '#fff',
                  background: 'transparent',
                },
              }}
            >
              Register here
            </Button>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default LoginView;
import React from 'react';
import { Box, Paper, Typography, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';

/**
 * AccessDenied Component - Displays access denied page with navigation options
 * Shows when user tries to access protected resources without proper authentication
 * Provides options to navigate to home page or login page
 * @returns {JSX.Element} Rendered access denied page component
 */
function AccessDenied() {
  /**
   * Navigation hook for programmatic routing
   * @type {Function}
   */
  const navigate = useNavigate();

  /**
   * Navigates to home page
   */
  const navigateToHome = () => {
    navigate('/');
  };

  /**
   * Navigates to login page
   */
  const navigateToLogin = () => {
    navigate('/users/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(120deg, #0f2027, #232526, #0f2027, #ff3333 80%)',
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
          minWidth: 500,
          p: 4,
          boxShadow: '0 8px 32px 0 #ff333377',
          border: '1.5px solid #ff3333',
          textAlign: 'center',
        }}
      >
        <Stack spacing={4} alignItems="center">
          {/* Lock icon */}
          <LockIcon
            sx={{
              fontSize: 80,
              color: '#ff3333',
              filter: 'drop-shadow(0 0 16px #ff3333)',
            }}
          />

          {/* Access denied title */}
          <Typography
            variant="h3"
            sx={{
              color: '#ff3333',
              fontWeight: 900,
              letterSpacing: 3,
              textShadow: '0 0 16px #ff3333, 0 4px 32px #0f2027',
              fontFamily: 'Orbitron, monospace',
            }}
          >
            ACCESS DENIED
          </Typography>

          {/* Error message */}
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontFamily: 'monospace',
              lineHeight: 1.6,
              maxWidth: 400,
            }}
          >
            You don't have permission to access this page.
            Please login or return to the home page.
          </Typography>

          {/* Navigation buttons */}
          <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<LoginIcon />}
              onClick={navigateToLogin}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                color: '#ff3333',
                borderColor: '#ff3333',
                transition: 'transform 0.2s, border-color 0.2s, color 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  borderColor: '#fff',
                  color: '#fff',
                  background: 'rgba(255,51,51,0.08)',
                },
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={navigateToHome}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
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
      </Paper>
    </Box>
  );
}

export default AccessDenied;
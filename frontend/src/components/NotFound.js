import React from 'react';
import { Box, Paper, Typography, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';

/**
 * NotFound Component - Displays 404 page for invalid URLs
 * Shows when user tries to access non-existent routes
 * Provides options to navigate to home page or login page
 * @returns {JSX.Element} Rendered not found page component
 */
function NotFound() {
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
        background: 'linear-gradient(120deg, #0f2027, #232526, #0f2027, #ff9900 80%)',
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
          boxShadow: '0 8px 32px 0 #ff990077',
          border: '1.5px solid #ff9900',
          textAlign: 'center',
        }}
      >
        <Stack spacing={4} alignItems="center">
          {/* Error icon */}
          <ErrorOutlineIcon
            sx={{
              fontSize: 100,
              color: '#ff9900',
              filter: 'drop-shadow(0 0 16px #ff9900)',
            }}
          />

          {/* 404 title */}
          <Typography
            variant="h1"
            sx={{
              color: '#ff9900',
              fontWeight: 900,
              letterSpacing: 5,
              textShadow: '0 0 20px #ff9900, 0 4px 40px #0f2027',
              fontFamily: 'Orbitron, monospace',
              fontSize: '4rem',
            }}
          >
            404
          </Typography>

          {/* Page not found title */}
          <Typography
            variant="h4"
            sx={{
              color: '#ff9900',
              fontWeight: 700,
              letterSpacing: 2,
              fontFamily: 'Orbitron, monospace',
              mt: -2,
            }}
          >
            PAGE NOT FOUND
          </Typography>

          {/* Error message */}
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontFamily: 'monospace',
              lineHeight: 1.6,
              maxWidth: 400,
              mt: 2,
            }}
          >
            The page you are looking for doesn't exist or has been moved.
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
                color: '#ff9900',
                borderColor: '#ff9900',
                transition: 'transform 0.2s, border-color 0.2s, color 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  borderColor: '#fff',
                  color: '#fff',
                  background: 'rgba(255,153,0,0.08)',
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

export default NotFound;
import React from 'react';
import { Box, Button, Typography, Stack, Paper } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

/**
 * HomeView Component - Presentational component for the home page interface
 * Displays NextHire landing page with futuristic design and navigation options
 * This is a pure presentational component that receives all handlers as props
 * @param {Object} props - The component props
 * @param {Function} props.handleLoginClick - Handler for login button click
 * @param {Function} props.handleRegisterClick - Handler for register button click
 * @returns {JSX.Element} Rendered home page view with navigation buttons
 */
function HomeView({ handleLoginClick, handleRegisterClick }) {
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
      
      {/* Main content container with glassmorphism effect */}
      <Paper
        elevation={16}
        sx={{
          p: 6,
          borderRadius: 6,
          bgcolor: 'rgba(15,32,39,0.85)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px 0 #00ff9977',
          border: '1.5px solid #00ff99',
          minWidth: 370,
        }}
      >
        <Stack spacing={3} alignItems="center">
          {/* Application title */}
          <Typography
            variant="h2"
            sx={{
              color: '#00ff99',
              fontWeight: 900,
              letterSpacing: 4,
              textShadow: '0 0 16px #00ff99, 0 4px 32px #0f2027',
              mb: 1,
              fontFamily: 'Orbitron, monospace',
            }}
          >
            NextHire
          </Typography>
          
          {/* Application subtitle */}
          <Typography variant="h5" sx={{ color: '#e0ffe0', mb: 2, textShadow: '0 0 8px #00ff99' }}>
            The futuristic way to manage your job applications.
          </Typography>
          
          {/* Decorative icons section */}
          <Stack direction="row" spacing={4} sx={{ my: 2 }}>
            <WorkOutlineIcon 
              sx={{ 
                fontSize: 60, 
                color: '#00ff99', 
                filter: 'drop-shadow(0 0 12px #00ff99)' 
              }} 
            />
            <TimelineIcon 
              sx={{ 
                fontSize: 60, 
                color: '#00ff99', 
                filter: 'drop-shadow(0 0 12px #00ff99)' 
              }} 
            />
            <AssignmentTurnedInIcon 
              sx={{ 
                fontSize: 60, 
                color: '#00ff99', 
                filter: 'drop-shadow(0 0 12px #00ff99)' 
              }} 
            />
          </Stack>
          
          {/* Navigation buttons section */}
          <Stack direction="row" spacing={3}>
            {/* Login button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleLoginClick}
              sx={{
                borderRadius: 3,
                px: 5,
                fontWeight: 700,
                background: 'linear-gradient(90deg, #00ff99 0%, #232526 100%)',
                color: '#232526',
                boxShadow: '0 2px 16px #00ff99aa',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.07)',
                  boxShadow: '0 4px 32px #00ff99cc',
                  background: 'linear-gradient(90deg, #232526 0%, #00ff99 100%)',
                  color: '#00ff99',
                },
              }}
            >
              Login
            </Button>
            
            {/* Register button */}
            <Button
              variant="outlined"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={handleRegisterClick}
              sx={{
                borderRadius: 3,
                px: 5,
                fontWeight: 700,
                color: '#00ff99',
                borderColor: '#00ff99',
                transition: 'transform 0.2s, border-color 0.2s, color 0.2s',
                '&:hover': {
                  transform: 'scale(1.07)',
                  borderColor: '#fff',
                  color: '#fff',
                  background: 'rgba(0,255,153,0.08)',
                },
              }}
            >
              Register
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default HomeView;
import React from 'react';
import { Box, Paper, Typography, Stack, Button } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

/**
 * SecurityRateLimit Component - Informs user about rate limit due to repeated insecure input
 * Explains the 3 attempts rule and how to proceed
 * Provides navigation to home and "go back"
 */
function SecurityRateLimit() {
  const navigate = useNavigate();

  const goHome = () => navigate('/');
  const goBack = () => window.history.back();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(120deg, #232526, #ff3333 80%)',
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
          <BlockIcon
            sx={{
              fontSize: 80,
              color: '#ff3333',
              filter: 'drop-shadow(0 0 16px #ff3333)',
            }}
          />

          <Typography
            variant="h3"
            sx={{
              color: '#ff3333',
              fontWeight: 900,
              letterSpacing: 3,
              textShadow: '0 0 16px #ff3333, 0 4px 32px #232526',
              fontFamily: 'Orbitron, monospace',
            }}
          >
            INPUT BLOCKED
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontFamily: 'monospace',
              lineHeight: 1.6,
              maxWidth: 440,
            }}
          >
            Your submission was blocked for security reasons.<br />
            Our system detected potentially dangerous code or content in one of the fields.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#ffcccc',
              fontFamily: 'monospace',
              fontSize: 16,
              maxWidth: 440,
              mt: 2,
            }}
          >
            <ul style={{ textAlign: 'left', margin: '0 auto', maxWidth: 400 }}>
              <li>Do not use HTML tags, JavaScript code, or suspicious attributes (like <code>onerror</code>, <code>onload</code>, etc).</li>
              <li>Only enter plain text in all fields.</li>
              <li>If you believe this is a mistake, please contact support.</li>
            </ul>
          </Typography>

          <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={goHome}
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
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={goBack}
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
              Back
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default SecurityRateLimit;
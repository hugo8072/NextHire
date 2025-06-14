import React from 'react';
import { Box, Button, Typography, Stack, Paper, TextField } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

function VerificationView({
  formData,
  error,
  success,
  handleChange,
  handleSubmit,
  handleHome
}) {
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
          p: 0,
          borderRadius: 6,
          bgcolor: '#232526',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px 0 #00ff9977',
          border: '1.5px solid #00ff99',
          minWidth: 400,
        }}
      >
        <Stack
          spacing={3}
          alignItems="center"
          sx={{
            p: 6,
            bgcolor: '#232526',
            borderRadius: 6,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: '#00ff99',
              fontWeight: 900,
              letterSpacing: 3,
              textShadow: '0 0 16px #00ff99, 0 4px 32px #0f2027',
              fontFamily: 'Orbitron, monospace',
            }}
          >
            NextHire
          </Typography>
          <Typography variant="h6" sx={{ color: '#00ff99', mb: 2, textShadow: '0 0 8px #00ff99' }}>
            Enter your verification code
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Stack spacing={2}>
              <TextField
                label="Verification Code"
                name="verificationCode"
                type="text"
                value={formData.verificationCode}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                InputProps={{
                  style: { color: '#1de9b6', background: '#232526', fontFamily: 'monospace' },
                }}
                sx={{
                  '& label': { color: '#1de9b6', background: 'transparent' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#1de9b6' },
                    '&:hover fieldset': { borderColor: '#00ff99' },
                    background: '#232526',
                  },
                  input: { color: '#1de9b6', fontFamily: 'monospace', paddingLeft: '18px' },
                }}
                inputProps={{
                  style: { paddingLeft: 18 }
                }}
              />
              {error && <Typography color="error">{error}</Typography>}
              {success && <Typography color="success.main">{success}</Typography>}
              <Button
                type="submit"
                variant="contained"
                size="large"
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
                Verify
              </Button>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={handleHome}
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
                Home
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Box>
  );
}

export default VerificationView;
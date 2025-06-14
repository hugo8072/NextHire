import React from 'react';
import { Box, Paper, Typography, Stack, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function RegisterView({
  formData,
  handleChange,
  handleSubmit,
  showPassword,
  setShowPassword,
  passwordMatch,
  validationErrors,
  error,
  success,
  navigate
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
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Stack spacing={2}>
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
                helperText=" " // espaço para manter altura
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#00ff99' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
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
              {error && (
                <Typography sx={{ color: '#ff3333', fontWeight: 700, textAlign: 'center' }}>
                  {error}
                </Typography>
              )}
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
                  onClick={() => window.location.href = '/'}
                >
                  Home
                </Button>
              </Stack>
            </Stack>
          </form>
          {success && (
            <Paper
              sx={{
                bgcolor: '#181c1f',
                border: '1.5px solid #00ff99',
                borderRadius: 4,
                p: 3,
                mt: 2,
                color: '#00ff99',
                textAlign: 'center',
                boxShadow: '0 4px 16px 0 #00ff9955',
              }}
            >
              <Typography sx={{ color: '#00ff99', fontWeight: 700, mb: 2 }}>
                {success}
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  sx={buttonSx}
                  onClick={() => navigate('/users/login')}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  sx={buttonSx}
                  onClick={() => window.location.href = '/'}
                >
                  Home
                </Button>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

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
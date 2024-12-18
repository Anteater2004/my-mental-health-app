import React, { useState } from 'react';
import axios from '../axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Grid,
  Alert,
  CssBaseline,
  Paper,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const response = await axios.post('api/token/', {
        username,
        password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response && error.response.data) {
        // Combine all error messages into one string
        const errorMessage = Object.values(error.response.data).flat().join(' ');
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <>
      <CssBaseline />
      <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Sign in to continue exploring positive habits.
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
            >
              Login
            </Button>
            <Grid container sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Grid item xs>
                <Link
                  to="/password_reset"
                  style={{ textDecoration: 'none', color: '#1976d2' }}
                >
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link
                  to="/register"
                  style={{ textDecoration: 'none', color: '#1976d2' }}
                >
                  Don't have an account? Sign Up
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default Login;

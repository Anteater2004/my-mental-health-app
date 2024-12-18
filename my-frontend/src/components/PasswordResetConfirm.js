import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Grid,
  Alert,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function PasswordResetConfirm() {
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token');
  const uid = query.get('uid');

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Optionally, validate the token upon component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        await axios.post('api/password_reset/verify/', {
          token,
        });
      } catch (error) {
        console.error('Invalid or expired token:', error);
        setError('Invalid or expired token.');
      }
    };

    if (token) {
      validateToken();
    } else {
      setError('No token provided.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== password2) {
      setError("Passwords don't match.");
      return;
    }

    try {
      await axios.post('api/password_reset/confirm/', {
        token,
        password,
      });
      setMessage('Your password has been reset successfully.');
      // Optionally, navigate to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      if (error.response && error.response.data) {
        setError(Object.values(error.response.data).flat().join(' '));
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  if (error) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'error.main' }}>
            <LockResetIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/password_reset')}
            >
              Request New Reset Link
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        {message && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirm New Password"
            type="password"
            id="password2"
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Reset Password
          </Button>
          <Grid container>
            <Grid item>
              <Button onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

export default PasswordResetConfirm;

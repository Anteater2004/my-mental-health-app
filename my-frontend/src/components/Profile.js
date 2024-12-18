import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [journalCount, setJournalCount] = useState(null);
  const [loading, setLoading] = useState(true); // For initial loading state

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('users/profile/');
        setUser(response.data);
        setEmail(response.data.email);
        // If your user model includes first_name and last_name:
        if (response.data.first_name) setFirstName(response.data.first_name);
        if (response.data.last_name) setLastName(response.data.last_name);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError('Failed to load profile. Please try again.');
      }
    };

    const fetchJournals = async () => {
      try {
        const response = await axios.get('journaling/');
        setJournalCount(response.data.length);
      } catch (error) {
        console.error('Failed to fetch journaling entries:', error);
        // Not critical if fails, we can leave journalCount as null
      }
    };

    Promise.all([fetchProfile(), fetchJournals()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.put('users/profile/', {
        email,
        first_name: firstName,
        last_name: lastName
      });
      console.log(response.data);
      setSuccess('Profile updated successfully.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (error.response && error.response.data) {
        setError(Object.values(error.response.data).flat().join(' '));
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="sm" sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading profile...
        </Typography>
      </Container>
    );
  }

  if (!user) {
    // If user failed to load
    return (
      <Container component="main" maxWidth="sm" sx={{ textAlign: 'center', mt: 5 }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Typography variant="h6">No user profile available.</Typography>
        )}
        <Button variant="contained" onClick={handleBack} startIcon={<ArrowBackIcon />}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Back to Home
          </Button>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Profile
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <AccountCircleIcon />
          </Avatar>
        </Box>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* User Stats Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Progress
          </Typography>
          {journalCount !== null ? (
            <Typography variant="body1" color="text.secondary">
              You have written <strong>{journalCount}</strong> journaling entries so far. Keep going!
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Unable to load your journaling progress at the moment.
            </Typography>
          )}
        </Box>

        {/* Update Profile Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            fullWidth
            id="username"
            label="Username"
            name="username"
            value={user.username}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            fullWidth
            id="first_name"
            label="First Name"
            name="first_name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            fullWidth
            id="last_name"
            label="Last Name"
            name="last_name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mb: 2 }}
          >
            Update Profile
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile;

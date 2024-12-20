// src/components/Meditations.js
import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig'; // Ensure this path matches your Axios config file
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import SpaIcon from '@mui/icons-material/Spa';

function Meditations() {
  const [sessions, setSessions] = useState([]);
  const [displayedSessions, setDisplayedSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    duration: '',
    audio_url: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  const steps = [
    'Enter Title',
    'Enter Description',
    'Set Duration',
    'Optional: Audio URL',
  ];

  // Fetch meditation sessions
  const fetchSessions = async (url) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: undefined, // Remove Authorization header for public endpoints
        },
      });
      console.log('Fetch Sessions Response:', response.data);

      if (response.data && Array.isArray(response.data.results)) {
        setSessions((prev) => {
          // Prevent duplicate sessions based on 'id' using Set for efficiency
          const existingIds = new Set(prev.map((session) => session.id));
          const newSessions = response.data.results.filter(
            (session) => !existingIds.has(session.id)
          );
          return [...prev, ...newSessions];
        });
        setNextUrl(response.data.next);
      } else {
        console.error('Unexpected response format for meditations:', response.data);
        setError('Unexpected response format from server.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch meditations:', err);
      setError('Failed to load meditations. Please try again.');
      setLoading(false);
      // Redirect to login if unauthorized
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    // Fetch sessions only once on component mount
    fetchSessions('journaling/meditations/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures it's called only once

  // Helper function to ensure unique sessions
  const getUniqueSessions = (sessionsArray) => {
    const unique = [];
    const ids = new Set();
    for (const session of sessionsArray) {
      if (!ids.has(session.id)) {
        ids.add(session.id);
        unique.push(session);
      }
    }
    return unique;
  };

  // Filter sessions based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = sessions.filter((session) =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedSessions(getUniqueSessions(filtered));
    } else {
      setDisplayedSessions(getUniqueSessions(sessions));
    }
  }, [sessions, searchQuery]);

  // Handle creation of a new meditation session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Debugging log
    console.log('handleCreateSession called');

    // Validate all required fields
    if (
      newSession.title.trim() === '' ||
      newSession.description.trim() === '' ||
      newSession.duration.trim() === ''
    ) {
      setError('Title, Description, and Duration are required.');
      return;
    }

    // Validate duration
    const durationInt = parseInt(newSession.duration, 10);
    if (isNaN(durationInt) || durationInt <= 0) {
      setError('Duration must be a positive number.');
      return;
    }

    // Prepare data for POST request
    const postData = {
      title: newSession.title,
      description: newSession.description,
      duration: durationInt,
    };

    // Include audio_url if provided
    if (newSession.audio_url.trim() !== '') {
      postData.audio_url = newSession.audio_url.trim();
    }

    try {
      const response = await axios.post('journaling/meditations/', postData, {
        headers: {
          Authorization: undefined, // Remove Authorization header for public endpoints
        },
      });
      console.log('Create Session Response:', response.data);

      if (response.data && response.data.id) {
        setSessions([response.data, ...sessions]);
        setNewSession({
          title: '',
          description: '',
          duration: '',
          audio_url: '',
        });
        setActiveStep(0); // Reset stepper after submission
        setSuccess('Meditation session submitted successfully!');
        handleOpenDialog(); // Open the reflection dialog
      } else {
        console.error('Unexpected response after creating session:', response.data);
        setError('Unexpected response after creating session.');
      }
    } catch (err) {
      console.error('Failed to create meditation session:', err);
      if (err.response && err.response.data) {
        // Aggregate error messages
        const messages = Object.values(err.response.data).flat().join(' ');
        setError(messages || 'Failed to create meditation session. Please try again.');
      } else {
        setError('Failed to create meditation session. Please try again.');
      }
    }
  };

  // Handle deleting a meditation session
  const handleDeleteSession = async (id) => {
    setError('');
    setSuccess('');

    try {
      await axios.delete(`journaling/meditations/${id}/`, {
        headers: {
          Authorization: undefined, // Remove Authorization header for public endpoints
        },
      });
      setSessions(sessions.filter(session => session.id !== id));
      setSuccess('Meditation session deleted successfully!');
    } catch (err) {
      console.error('Failed to delete meditation session:', err);
      setError('Failed to delete meditation session. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleLoadMore = () => {
    if (nextUrl) fetchSessions(nextUrl);
  };

  const handleNextStep = () => {
    console.log('handleNextStep called');
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1)); // Prevent exceeding max step
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setActiveStep(0);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Calculate progress percentage based on activeStep
  const progressPercentage = Math.min(((activeStep + 1) / steps.length) * 100, 100);

  // Add a console log to monitor activeStep
  useEffect(() => {
    console.log('Current activeStep:', activeStep);
  }, [activeStep]);

  if (loading && sessions.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to right, #e0f7fa, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading meditations...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #e0f7fa, #ffffff)',
        py: 4,
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative' }}>
        {/* Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mr: 2, color: 'primary.main' }}
          >
            Back to Home
          </Button>
          <Typography
            variant="h5"
            component="h1"
            sx={{ flexGrow: 1, textAlign: 'center', color: 'primary.dark' }}
          >
            My Meditation Sessions
          </Typography>
          <Tooltip title="Track your progress and understand your patterns">
            <IconButton>
              <SpaIcon color="action" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Progress: {activeStep + 1} / {steps.length} completed
          </Typography>
          <LinearProgress variant="determinate" value={progressPercentage} />
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: '#fafafa' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
              <SpaIcon fontSize="large" />
            </Avatar>
          </Box>
          <Typography variant="h6" align="center" gutterBottom sx={{ color: 'text.primary' }}>
            Calm Your Mind
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Engage in various meditation practices to relax, refocus, and rejuvenate your mind.
            Consistent practice can help reduce rumination and enhance overall well-being.
          </Typography>

          {/* Display Success Message */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Display Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* New Meditation Session Form with Stepper */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3, backgroundColor: '#ffffff' }}>
            <Typography variant="subtitle1" gutterBottom>
              Add a New Meditation Session
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box component="form" onSubmit={handleCreateSession} sx={{ display: 'flex', flexDirection: 'column' }}>
              {activeStep === 0 && (
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Title"
                  placeholder="Enter meditation session title"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  sx={{ mb: 2 }}
                />
              )}
              {activeStep === 1 && (
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  label="Description"
                  placeholder="Enter meditation session description"
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  sx={{ mb: 2 }}
                />
              )}
              {activeStep === 2 && (
                <TextField
                  type="number"
                  fullWidth
                  variant="outlined"
                  label="Duration (minutes)"
                  placeholder="Enter duration in minutes"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ ...newSession, duration: e.target.value })}
                  sx={{ mb: 2 }}
                />
              )}
              {activeStep === 3 && (
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Audio URL (Optional)"
                  placeholder="Enter audio URL if available"
                  value={newSession.audio_url}
                  onChange={(e) => setNewSession({ ...newSession, audio_url: e.target.value })}
                  sx={{ mb: 2 }}
                />
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  variant="outlined"
                  color="primary"
                  type="button" // Prevents form submission
                >
                  Back
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit" // Triggers form submission
                  >
                    Submit Session
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    type="button" // Prevents form submission
                    onClick={handleNextStep}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Reflection Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Well Done!</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                You've completed all the steps for your meditation session. Keep up the great work in cultivating mindfulness and reducing rumination!
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Search bar */}
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search your sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Stats or counts */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You have completed <strong>{Array.isArray(displayedSessions) ? displayedSessions.length : 0}</strong>{' '}
            {Array.isArray(displayedSessions) && displayedSessions.length === 1 ? 'session' : 'sessions'} so far. Keep going!
          </Typography>

          {/* Display Sessions */}
          {(!Array.isArray(displayedSessions) || displayedSessions.length === 0) ? (
            <Typography variant="body1" color="text.secondary">
              No sessions found. Try adding one above or adjusting your search.
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {displayedSessions.map((session) => (
                <Card
                  elevation={2}
                  key={session.id} // Ensure 'id' is unique
                  sx={{
                    mb: 2,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    position: 'relative',
                    transition: 'transform 0.1s',
                    '&:hover': { transform: 'scale(1.01)' },
                  }}
                >
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Created At:</strong> {new Date(session.created_at).toLocaleString()}
                    </Typography>
                    {session.title && (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                        <strong>Title:</strong> {session.title}
                      </Typography>
                    )}
                    {session.description && (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                        <strong>Description:</strong> {session.description}
                      </Typography>
                    )}
                    {session.duration && (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                        <strong>Duration:</strong> {session.duration} minutes
                      </Typography>
                    )}
                    {session.audio_url && (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                        <strong>Audio URL:</strong> <a href={session.audio_url} target="_blank" rel="noopener noreferrer">Listen Here</a>
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDeleteSession(session.id)}
                      sx={{
                        color: 'error.main',
                        bgcolor: 'error.light',
                        '&:hover': { bgcolor: 'error.main', color: '#fff' },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}

          {/* Pagination: Load More */}
          {nextUrl && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="outlined" color="primary" onClick={handleLoadMore}>
                Load More
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default Meditations;
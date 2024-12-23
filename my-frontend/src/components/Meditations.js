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
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import SpaIcon from '@mui/icons-material/Spa';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import EditIcon from '@mui/icons-material/Edit'; // Import for EditIcon

function Meditations() {
  // **State Management**
  const [sessions, setSessions] = useState([]);
  const [displayedSessions, setDisplayedSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    duration: '',
    audio_url: '', // Renamed from selected_audio to audio_url
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [audioPlayingId, setAudioPlayingId] = useState(null); // To track which audio is playing

  // **Edit Dialog State**
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditSession, setCurrentEditSession] = useState(null);
  const [updatedSessionData, setUpdatedSessionData] = useState({
    title: '',
    description: '',
    duration: '',
    audio_url: '',
  });

  // **Form Steps**
  const steps = [
    'Enter Title',
    'Enter Description',
    'Set Duration',
    'Select Audio',
  ];

  // **Predefined Meditation Audios**
  const predefinedAudios = [
    {
      id: 1,
      title: 'Calm Ocean Waves',
      description: 'Gentle ocean waves crashing onto the shore.',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      id: 2,
      title: 'Forest Ambience',
      description: 'Serene sounds of a forest with birds chirping.',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      id: 3,
      title: 'Rain and Thunder',
      description: 'Relaxing rain with occasional thunderclaps.',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
    {
      id: 4,
      title: 'Mountain Stream',
      description: 'Clear water flowing over rocks in a mountain stream.',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    },
  ];

  // **Fetch Meditation Sessions**
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

  // **Helper Function to Ensure Unique Sessions**
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

  // **Filter Sessions Based on Search Query**
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = sessions.filter(
        (session) =>
          session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedSessions(getUniqueSessions(filtered));
    } else {
      setDisplayedSessions(getUniqueSessions(sessions));
    }
  }, [sessions, searchQuery]);

  // **Handle Creation of a New Meditation Session**
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
      newSession.duration.trim() === '' ||
      newSession.audio_url === ''
    ) {
      setError('All fields are required.');
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
      audio_url: newSession.audio_url,
    };

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

  // **Handle Deleting a Meditation Session**
  const handleDeleteSession = async (id) => {
    setError('');
    setSuccess('');

    try {
      await axios.delete(`journaling/meditations/${id}/`, {
        headers: {
          Authorization: undefined, // Remove Authorization header for public endpoints
        },
      });
      setSessions(sessions.filter((session) => session.id !== id));
      setSuccess('Meditation session deleted successfully!');
    } catch (err) {
      console.error('Failed to delete meditation session:', err);
      setError('Failed to delete meditation session. Please try again.');
    }
  };

  // **Functions to Handle Editing**
  const handleOpenEditDialog = (session) => {
    setCurrentEditSession(session);
    setUpdatedSessionData({
      title: session.title,
      description: session.description,
      duration: session.duration,
      audio_url: session.audio_url,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentEditSession(null);
    setUpdatedSessionData({
      title: '',
      description: '',
      duration: '',
      audio_url: '',
    });
  };

  const handleUpdateSession = async () => {
    setError('');
    setSuccess('');

    // Validate all required fields
    if (
      updatedSessionData.title.trim() === '' ||
      updatedSessionData.description.trim() === '' ||
      updatedSessionData.duration === '' ||
      updatedSessionData.audio_url === ''
    ) {
      setError('All fields are required.');
      return;
    }

    // Validate duration
    const durationInt = parseInt(updatedSessionData.duration, 10);
    if (isNaN(durationInt) || durationInt <= 0) {
      setError('Duration must be a positive number.');
      return;
    }

    // Prepare data for PUT request
    const putData = {
      title: updatedSessionData.title,
      description: updatedSessionData.description,
      duration: durationInt,
      audio_url: updatedSessionData.audio_url,
    };

    try {
      const response = await axios.put(
        `journaling/meditations/${currentEditSession.id}/`,
        putData,
        {
          headers: {
            Authorization: undefined, // Remove Authorization header for public endpoints
          },
        }
      );
      console.log('Update Session Response:', response.data);

      if (response.data && response.data.id) {
        // Update the session in the local state
        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === response.data.id ? response.data : session
          )
        );
        setSuccess('Meditation session updated successfully!');
        handleCloseEditDialog();
      } else {
        console.error('Unexpected response after updating session:', response.data);
        setError('Unexpected response after updating session.');
      }
    } catch (err) {
      console.error('Failed to update meditation session:', err);
      if (err.response && err.response.data) {
        // Aggregate error messages
        const messages = Object.values(err.response.data).flat().join(' ');
        setError(messages || 'Failed to update meditation session. Please try again.');
      } else {
        setError('Failed to update meditation session. Please try again.');
      }
    }
  };

  // **Navigation Functions**
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

  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0)); // Prevent going below step 0
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setActiveStep(0);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // **Calculate Progress Percentage Based on activeStep**
  const progressPercentage = Math.min(((activeStep + 1) / steps.length) * 100, 100);

  // **Audio Playback Controls**
  const handlePlayAudio = (sessionId, duration) => {
    if (audioPlayingId === sessionId) {
      // If the clicked audio is already playing, pause it
      const audioElement = document.getElementById(`audio-${sessionId}`);
      if (audioElement) {
        audioElement.pause();
      }
      setAudioPlayingId(null);
    } else {
      // Pause any currently playing audio
      if (audioPlayingId) {
        const currentAudio = document.getElementById(`audio-${audioPlayingId}`);
        if (currentAudio) {
          currentAudio.pause();
        }
      }
      // Play the selected audio
      const audioElement = document.getElementById(`audio-${sessionId}`);
      if (audioElement) {
        audioElement.play();
        setAudioPlayingId(sessionId);
        // Automatically pause after the specified duration
        setTimeout(() => {
          audioElement.pause();
          setAudioPlayingId(null);
        }, duration * 60 * 1000); // Convert minutes to milliseconds
      }
    }
  };

  // **Monitor activeStep Changes**
  useEffect(() => {
    console.log('Current activeStep:', activeStep);
  }, [activeStep]);

  // **Render Loading State**
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
          p: 2,
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
                <FormControl component="fieldset" variant="standard" sx={{ mb: 2 }}>
                  <FormLabel component="legend">Select a Meditation Audio</FormLabel>
                  <FormGroup>
                    {predefinedAudios.map((audio) => (
                      <FormControlLabel
                        key={audio.id}
                        control={
                          <Checkbox
                            checked={newSession.audio_url === audio.audio_url}
                            onChange={() =>
                              setNewSession({ ...newSession, audio_url: audio.audio_url })
                            }
                            name={audio.title}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1" sx={{ mr: 1 }}>
                              {audio.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {audio.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handlePrevStep}
                  variant="outlined"
                  color="primary"
                >
                  Back
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button variant="contained" color="primary" type="submit">
                    Submit Session
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" type="button" onClick={handleNextStep}>
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
                You've successfully added a new meditation session. Enjoy your practice!
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* **Edit Meditation Session Dialog** */}
          <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
            <DialogTitle>Edit Meditation Session</DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Title"
                  value={updatedSessionData.title}
                  onChange={(e) =>
                    setUpdatedSessionData({ ...updatedSessionData, title: e.target.value })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  label="Description"
                  value={updatedSessionData.description}
                  onChange={(e) =>
                    setUpdatedSessionData({ ...updatedSessionData, description: e.target.value })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  type="number"
                  fullWidth
                  variant="outlined"
                  label="Duration (minutes)"
                  value={updatedSessionData.duration}
                  onChange={(e) =>
                    setUpdatedSessionData({ ...updatedSessionData, duration: e.target.value })
                  }
                  sx={{ mb: 2 }}
                />
                <FormControl component="fieldset" variant="standard" sx={{ mb: 2 }}>
                  <FormLabel component="legend">Select a Meditation Audio</FormLabel>
                  <FormGroup>
                    {predefinedAudios.map((audio) => (
                      <FormControlLabel
                        key={audio.id}
                        control={
                          <Checkbox
                            checked={updatedSessionData.audio_url === audio.audio_url}
                            onChange={() =>
                              setUpdatedSessionData({
                                ...updatedSessionData,
                                audio_url: audio.audio_url,
                              })
                            }
                            name={audio.title}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1" sx={{ mr: 1 }}>
                              {audio.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {audio.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleUpdateSession} color="primary" variant="contained">
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Search bar */}
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search your sessions by title or description..."
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
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={audioPlayingId === session.id ? <PauseIcon /> : <PlayArrowIcon />}
                          onClick={() => handlePlayAudio(session.id, session.duration)}
                          sx={{ mr: 2 }}
                        >
                          {audioPlayingId === session.id ? 'Pause' : 'Play'}
                        </Button>
                        <audio id={`audio-${session.id}`} src={session.audio_url} onEnded={() => setAudioPlayingId(null)} />
                        <Typography variant="body2" color="text.secondary">
                          {predefinedAudios.find((audio) => audio.audio_url === session.audio_url)?.title}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      aria-label="edit"
                      onClick={() => handleOpenEditDialog(session)}
                      sx={{
                        color: 'primary.main',
                        bgcolor: 'primary.light',
                        '&:hover': { bgcolor: 'primary.dark', color: '#fff' },
                        mr: 1,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <EditIcon /> {/* Using EditIcon */}
                    </IconButton>
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

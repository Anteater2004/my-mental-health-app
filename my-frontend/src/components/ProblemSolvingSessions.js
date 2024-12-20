// src/components/ProblemSolvingSessions.js

import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig'; // Ensure axiosConfig is correctly set up with baseURL and interceptors
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
  Checkbox,
  FormControlLabel,
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
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { format } from 'date-fns';

function ProblemSolvingSessions() {
  const [sessions, setSessions] = useState([]);
  const [displayedSessions, setDisplayedSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    title: '',
    scheduled_time: '',
    notes_before: '',
    completed: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState(0);

  const [selectedSession, setSelectedSession] = useState(null);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [notesAfter, setNotesAfter] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const [isSubmitting, setIsSubmitting] = useState(false); // Added state to prevent double submissions

  const steps = [
    'Enter Title',
    'Set Scheduled Time',
    'Add Notes Before Session',
    'Mark Completion & Add Notes After Session',
  ];

  // Fetch problem-solving sessions with deduplication
  const fetchSessions = async (url) => {
    setLoading(true);
    setError('');

    try {
      // Ensure the URL starts with a slash to correctly append to baseURL
      const formattedUrl = url.startsWith('/') ? url : `/${url}`;
      console.log(`Fetching sessions from: ${formattedUrl}`);
      const response = await axios.get(formattedUrl);
      console.log('Fetch Problem-Solving Sessions Response:', response.data);

      if (response.data && Array.isArray(response.data.results)) {
        setSessions((prev) => {
          const existingIds = new Set(prev.map((session) => session.id));
          const newSessions = response.data.results.filter(
            (session) => !existingIds.has(session.id)
          );

          return [...prev, ...newSessions];
        });
        setNextUrl(response.data.next);
      } else {
        console.error('Unexpected response format for sessions:', response.data);
        setError('Unexpected response format from server.');
      }
    } catch (err) {
      console.error('Failed to fetch problem-solving sessions:', err);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load sessions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch sessions only once on component mount
    fetchSessions('journaling/problem_solving_sessions/'); // Updated endpoint
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
        format(new Date(session.scheduled_time), 'PPpp').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (session.notes_before && session.notes_before.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (session.notes_after && session.notes_after.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setDisplayedSessions(getUniqueSessions(filtered));
    } else {
      setDisplayedSessions(getUniqueSessions(sessions));
    }
  }, [sessions, searchQuery]);

  // Handle creation of a new problem-solving session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isSubmitting) return; // Prevent double submissions
    setIsSubmitting(true); // Set submitting state

    // Validate required fields
    if (
      newSession.title.trim() === '' ||
      newSession.scheduled_time.trim() === '' ||
      newSession.notes_before.trim() === ''
    ) {
      setError('Title, scheduled time, and notes before session are required.');
      setIsSubmitting(false);
      return;
    }

    // Validate scheduled_time format
    const scheduledDate = new Date(newSession.scheduled_time);
    if (isNaN(scheduledDate.getTime())) {
      setError('Scheduled time must be a valid date and time.');
      setIsSubmitting(false);
      return;
    }

    // Optional: Ensure scheduled_time is in the future
    if (scheduledDate < new Date()) {
      setError('Scheduled time must be in the future.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: newSession.title,
        // Convert scheduled_time to ISO string to ensure backend receives correct format
        scheduled_time: scheduledDate.toISOString(),
        notes_before: newSession.notes_before,
        completed: newSession.completed,
        // notes_after is not set during creation; to be updated upon completion
      };

      const response = await axios.post(
        'journaling/problem_solving_sessions/', // Updated endpoint
        payload
      );
      console.log('Create Problem-Solving Session Response:', response.data);

      if (response.data && response.data.id) {
        // Update sessions and displayedSessions
        setSessions([response.data, ...sessions]);
        setDisplayedSessions([response.data, ...displayedSessions]);
        
        // Reset form
        setNewSession({
          title: '',
          scheduled_time: '',
          notes_before: '',
          completed: false,
        });
        
        // Update success message
        setSuccess('Problem-solving session submitted successfully!');
        
        // Update stepper
        setStepsCompleted((prev) => Math.min(prev + 1, steps.length));
        setActiveStep(0); // Reset stepper
        
        // Open reflection dialog
        handleOpenDialog();
      } else {
        console.error('Unexpected response after creating session:', response.data);
        setError('Unexpected response after creating session.');
      }
    } catch (err) {
      console.error('Failed to create problem-solving session:', err);
      if (err.response && err.response.data) {
        const messages = Object.values(err.response.data).flat().join(' ');
        setError(messages || 'Failed to create session. Please try again.');
      } else {
        setError('Failed to create session. Please try again.');
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // Handle deleting a problem-solving session
  const handleDeleteSession = async (id) => {
    setError('');
    setSuccess('');
    try {
      await axios.delete(`journaling/problem_solving_sessions/${id}/`); // Updated endpoint
      setSessions(sessions.filter(session => session.id !== id));
      setDisplayedSessions(displayedSessions.filter(session => session.id !== id));
      setSuccess('Problem-solving session deleted successfully!');
    } catch (err) {
      console.error('Failed to delete session:', err);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to delete session. Please try again.');
      }
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleLoadMore = () => {
    if (nextUrl) {
      try {
        const urlObj = new URL(nextUrl);
        const relativeUrl = urlObj.pathname + urlObj.search;
        // Remove the 'journaling/' prefix if present in relativeUrl to prevent duplication
        const formattedRelativeUrl = relativeUrl.startsWith('/api/') ? relativeUrl.replace('/api/', '/') : relativeUrl;
        fetchSessions(`journaling${formattedRelativeUrl}`);
      } catch (error) {
        console.error('Invalid nextUrl:', nextUrl);
        setError('Unable to load more sessions.');
      }
    }
  };

  const handleNextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1)); // Prevent exceeding max step
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setActiveStep(0);
    setStepsCompleted((prev) => Math.min(prev + 1, steps.length)); // Ensure it doesn't exceed steps.length
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((stepsCompleted / steps.length) * 100, 100);

  // Handle session completion
  const handleCompleteSession = (session) => {
    setSelectedSession(session);
    setNotesAfter('');
    setOpenCompleteDialog(true);
  };

  const handleSubmitCompletion = async () => {
    if (!selectedSession) return;

    // Validate notes_after
    if (notesAfter.trim() === '') {
      setError('Notes after session are required upon completion.');
      return;
    }

    try {
      const payload = {
        completed: true,
        notes_after: notesAfter,
      };

      const response = await axios.patch(
        `journaling/problem_solving_sessions/${selectedSession.id}/`, // Updated endpoint
        payload
      );
      console.log('Complete Problem-Solving Session Response:', response.data);

      // Update the session in the state
      setSessions(sessions.map(session => 
        session.id === selectedSession.id ? response.data : session
      ));
      setDisplayedSessions(displayedSessions.map(session =>
        session.id === selectedSession.id ? response.data : session
      ));
      setSuccess('Session marked as completed!');
      setSelectedSession(null);
      setNotesAfter('');
      setOpenCompleteDialog(false);
      setStepsCompleted((prev) => Math.min(prev + 1, steps.length)); // Ensure it doesn't exceed steps.length
    } catch (err) {
      console.error('Failed to complete problem-solving session:', err);
      if (err.response && err.response.data) {
        const messages = Object.values(err.response.data).flat().join(' ');
        setError(messages || 'Failed to complete session. Please try again.');
      } else {
        setError('Failed to complete session. Please try again.');
      }
    }
  };

  // Confirm Deletion Handlers
  const handleOpenDeleteConfirm = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    const { id } = deleteConfirm;
    setDeleteConfirm({ open: false, id: null });
    await handleDeleteSession(id);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ open: false, id: null });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #e0f7fa, #ffffff)',
        py: 4,
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative' }}>
        {/* Header Section */}
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
            My Problem-Solving Sessions
          </Typography>
          <Tooltip title="Track your progress and understand your patterns">
            <IconButton>
              <AssignmentIcon color="action" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Progress: {stepsCompleted} / {steps.length} completed
          </Typography>
          <LinearProgress variant="determinate" value={progressPercentage} />
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: '#fafafa' }}>
          {/* Icon and Description */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
              <AssignmentIcon fontSize="large" />
            </Avatar>
          </Box>
          <Typography variant="h6" align="center" gutterBottom sx={{ color: 'text.primary' }}>
            Structured Solutions
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Plan sessions to tackle challenges systematically. Add and track sessions 
            to maintain focus and see your progress.
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

          {/* New Problem-Solving Session Form with Stepper */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3, backgroundColor: '#ffffff' }}>
            <Typography variant="subtitle1" gutterBottom>
              Add a New Session
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
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
              )}
              {activeStep === 1 && (
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Scheduled Time"
                  value={newSession.scheduled_time}
                  onChange={(e) => setNewSession({ ...newSession, scheduled_time: e.target.value })}
                  sx={{ mb: 2 }}
                  type="datetime-local"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              )}
              {activeStep === 2 && (
                <TextField
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  label="Notes Before Session"
                  value={newSession.notes_before}
                  onChange={(e) => setNewSession({ ...newSession, notes_before: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
              )}
              {activeStep === 3 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newSession.completed}
                      onChange={(e) => setNewSession({ ...newSession, completed: e.target.checked })}
                    />
                  }
                  label="Mark as Completed"
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
                    disabled={isSubmitting} // Disable while submitting
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Session'}
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
            <DialogTitle>Great Job!</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                You've completed all the steps for your problem-solving session. Keep up the great work in training your mind and reducing rumination!
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Completion Dialog */}
          <Dialog open={openCompleteDialog} onClose={() => setOpenCompleteDialog(false)}>
            <DialogTitle>Complete Session</DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Add your notes after completing the session:
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                label="Notes After Session"
                multiline
                rows={4}
                value={notesAfter}
                onChange={(e) => setNotesAfter(e.target.value)}
                sx={{ mt: 2 }}
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenCompleteDialog(false)} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleSubmitCompletion} color="primary" variant="contained">
                Submit
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteConfirm.open}
            onClose={handleCancelDelete}
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this session?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Search bar */}
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />

          {/* Stats or counts */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Found <strong>{Array.isArray(displayedSessions) ? displayedSessions.length : 0}</strong> {Array.isArray(displayedSessions) && displayedSessions.length === 1 ? 'session' : 'sessions'}.
          </Typography>

          {/* Display Sessions */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (!Array.isArray(displayedSessions) || displayedSessions.length === 0) ? (
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
                      <strong>Created At:</strong> {format(new Date(session.created_at), 'PPpp')}
                    </Typography>
                    {session.title && (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                        <strong>Title:</strong> {session.title}
                      </Typography>
                    )}
                    {session.scheduled_time && (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                        <strong>Scheduled Time:</strong> {format(new Date(session.scheduled_time), 'PPpp')}
                      </Typography>
                    )}
                    {session.notes_before && (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                        <strong>Notes Before Session:</strong> {session.notes_before}
                      </Typography>
                    )}
                    {session.completed && session.notes_after && (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                        <strong>Notes After Session:</strong> {session.notes_after}
                      </Typography>
                    )}
                    {typeof session.completed === 'boolean' && (
                      <Typography variant="body2" color={session.completed ? 'success.main' : 'text.secondary'}>
                        {session.completed ? 'Completed' : 'Pending'}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ position: 'absolute', top: 8, right: 8 }}>
                    {!session.completed && (
                      <Tooltip title="Mark as Completed">
                        <IconButton
                          aria-label="complete"
                          onClick={() => handleCompleteSession(session)}
                          sx={{
                            color: 'primary.main',
                            bgcolor: 'primary.light',
                            '&:hover': { bgcolor: 'primary.dark', color: '#fff' },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete Session">
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleOpenDeleteConfirm(session.id)}
                        sx={{
                          color: 'error.main',
                          bgcolor: 'error.light',
                          '&:hover': { bgcolor: 'error.main', color: '#fff' },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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

export default ProblemSolvingSessions;

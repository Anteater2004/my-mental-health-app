// src/components/Journaling.js
import React, { useState, useEffect, useCallback } from 'react';
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
import BookIcon from '@mui/icons-material/Book';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';

function Journaling() {
  const [entries, setEntries] = useState([]);
  const [displayedEntries, setDisplayedEntries] = useState([]); // Filtered set
  const [newEntry, setNewEntry] = useState({
    entry_text: '',
    cognitive_distortion: '',
    reframed_text: '',
    self_compassion: '',
    concrete_steps: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Added success state
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null); // For pagination
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0); // For reflection steps
  const [openDialog, setOpenDialog] = useState(false); // For reflection after entry

  const steps = [
    'Identify Your Negative Thought',
    'Recognize Cognitive Distortions',
    'Reframe Your Thought',
    'Practice Self-Compassion',
    'Define Concrete Action Steps',
  ];

  // Memoize fetchEntries to prevent unnecessary re-creations
  const fetchEntries = useCallback(async (url) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: undefined, // Remove Authorization header for public endpoints
        },
      });
      console.log('Fetch Entries Response:', response.data);

      // Using pagination format: {count, next, previous, results}
      if (response.data && Array.isArray(response.data.results)) {
        setEntries((prev) => {
          // Prevent duplicate entries based on 'id'
          const newSessions = response.data.results.filter(
            (entry) => !prev.some((prevEntry) => prevEntry.id === entry.id)
          );
          return [...prev, ...newSessions];
        });
        setNextUrl(response.data.next);
      } else {
        console.error('Unexpected response format (not an array):', response.data);
        setError('Unexpected response format from server.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch journaling entries:', error);
      setError('Failed to load entries. Please try again.');
      setLoading(false);
      // If unauthorized (e.g., token expired), redirect to login
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch entries only once on component mount
    fetchEntries('journaling/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures it's called only once

  useEffect(() => {
    // Filter entries based on search query
    if (searchQuery.trim()) {
      const filtered = entries.filter((entry) => {
        // Search within all fields for comprehensive filtering
        return (
          entry.entry_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.cognitive_distortion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.reframed_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.self_compassion.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.concrete_steps.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setDisplayedEntries(filtered);
    } else {
      setDisplayedEntries(entries);
    }
  }, [entries, searchQuery]);

  // Handle creation of a new journal entry
  const handleCreateEntry = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Debugging log
    console.log('handleCreateEntry called');

    // Validate all fields
    if (
      newEntry.entry_text.trim() === '' ||
      newEntry.cognitive_distortion.trim() === '' ||
      newEntry.reframed_text.trim() === '' ||
      newEntry.self_compassion.trim() === '' ||
      newEntry.concrete_steps.trim() === ''
    ) {
      setError('All fields are required.');
      return;
    }

    // Assemble structured data into a single concatenated string
    const assembledEntryText = `
Negative Thought: ${newEntry.entry_text}
Cognitive Distortion: ${newEntry.cognitive_distortion}
Reframed Thought: ${newEntry.reframed_text}
Self-Compassion: ${newEntry.self_compassion}
Concrete Steps: ${newEntry.concrete_steps}
    `.trim();

    try {
      const response = await axios.post('journaling/', {
        entry_text: assembledEntryText,
      }, {
        headers: {
          Authorization: undefined, // Remove Authorization header for public endpoints
        },
      });
      console.log('Create Entry Response:', response.data);

      if (response.data && response.data.id) {
        setEntries([response.data, ...entries]);
        setNewEntry({
          entry_text: '',
          cognitive_distortion: '',
          reframed_text: '',
          self_compassion: '',
          concrete_steps: '',
        });
        setActiveStep(0); // Reset stepper after submission
        setSuccess('Journaling entry submitted successfully!');
        handleOpenDialog(); // Open the reflection dialog
      } else {
        console.error('Unexpected response format after creating entry:', response.data);
        setError('Unexpected response format after creating entry.');
      }
    } catch (error) {
      console.error('Failed to create journaling entry:', error);
      // Check if the error response provides more details
      if (error.response && error.response.data) {
        // Format error messages for better readability
        const errorMessages = Object.entries(error.response.data)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join(' | ');
        setError(`Failed to create entry: ${errorMessages}`);
      } else {
        setError('Failed to create entry. Please try again.');
      }
    }
  };

  // Handle deleting an entry
  const handleDeleteEntry = async (id) => {
    setError('');
    setSuccess('');

    try {
      await axios.delete(`journaling/${id}/`, {
        headers: {
          Authorization: undefined, // Remove Authorization header for public endpoints
        },
      });
      setEntries(entries.filter(entry => entry.id !== id));
      setSuccess('Journaling entry deleted successfully!');
    } catch (error) {
      console.error('Failed to delete journaling entry:', error);
      setError('Failed to delete entry. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleLoadMore = () => {
    if (nextUrl) {
      fetchEntries(nextUrl);
    }
  };

  const handleNextStep = () => {
    console.log('handleNextStep called');
    setActiveStep((prev) => prev + 1);
    // Ensure no automatic submission is triggered here
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

  if (loading && entries.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f0f5f9, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading your journal entries...
        </Typography>
      </Box>
    );
  }

  console.log('Entries state at render:', displayedEntries);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #f0f5f9, #ffffff)',
        py: 4,
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative' }}>
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
            My Journal Entries
          </Typography>
          <Tooltip title="Track your progress and understand your patterns">
            <IconButton>
              <InfoIcon color="action" />
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
              <BookIcon fontSize="large" />
            </Avatar>
          </Box>
          <Typography variant="h6" align="center" gutterBottom sx={{ color: 'text.primary' }}>
            Reflect, Grow, and Let Go
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Journaling helps identify patterns, release negativity, and focus on what matters.
            Keep writing and watch yourself progress toward greater clarity and resilience.
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

          {/* New entry form with structured prompts */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3, backgroundColor: '#ffffff' }}>
            <Typography variant="subtitle1" gutterBottom>
              Add a New Entry
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box component="form" onSubmit={handleCreateEntry} sx={{ display: 'flex', flexDirection: 'column' }}>
              {activeStep === 0 && (
                <TextField
                  multiline
                  rows={2}
                  fullWidth
                  variant="outlined"
                  label="Identify Your Negative Thought"
                  placeholder="What negative thought are you experiencing?"
                  value={newEntry.entry_text}
                  onChange={(e) => setNewEntry({ ...newEntry, entry_text: e.target.value })}
                  sx={{ mb: 2 }}
                />
              )}
              {activeStep === 1 && (
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Cognitive Distortions"
                  placeholder="Identify any cognitive distortions (e.g., all-or-nothing thinking, overgeneralization)"
                  value={newEntry.cognitive_distortion}
                  onChange={(e) => setNewEntry({ ...newEntry, cognitive_distortion: e.target.value })}
                  sx={{ mb: 2 }}
                />
              )}
              {activeStep === 2 && (
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  label="Reframe Your Thought"
                  placeholder="How can you reframe this thought in a more balanced way?"
                  value={newEntry.reframed_text}
                  onChange={(e) => setNewEntry({ ...newEntry, reframed_text: e.target.value })}
                  sx={{ mb: 2 }}
                />
              )}
              {activeStep === 3 && (
                <TextField
                  multiline
                  rows={2}
                  fullWidth
                  variant="outlined"
                  label="Self-Compassion"
                  placeholder="Write a compassionate statement to yourself regarding this thought."
                  value={newEntry.self_compassion}
                  onChange={(e) => setNewEntry({ ...newEntry, self_compassion: e.target.value })}
                  sx={{ mb: 2 }}
                />
              )}
              {activeStep === 4 && (
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  label="Concrete Action Steps"
                  placeholder="What actionable steps can you take to address or move past this thought?"
                  value={newEntry.concrete_steps}
                  onChange={(e) => setNewEntry({ ...newEntry, concrete_steps: e.target.value })}
                  sx={{ mb: 2 }}
                />
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  variant="outlined"
                  color="primary"
                  type="button" // Ensure type is 'button' to prevent form submission
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                  onClick={activeStep === steps.length - 1 ? null : handleNextStep}
                >
                  {activeStep === steps.length - 1 ? 'Submit Entry' : 'Next'}
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Reflection Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Great Job!</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                You've completed all the steps for your journal entry. Remember to revisit your entries to track your progress and patterns.
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
            placeholder="Search your entries..."
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
            You have written <strong>{Array.isArray(displayedEntries) ? displayedEntries.length : 0}</strong>{' '}
            {Array.isArray(displayedEntries) && displayedEntries.length === 1 ? 'entry' : 'entries'} so far. Keep going!
          </Typography>

          {/* Display entries */}
          {(!Array.isArray(displayedEntries) || displayedEntries.length === 0) ? (
            <Typography variant="body1" color="text.secondary">
              No entries found. Try adding a new one above or adjusting your search.
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {displayedEntries.map((entry) => (
                <Card
                  elevation={2}
                  key={entry.id} // Ensure 'id' is unique
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
                      <strong>Created At:</strong> {new Date(entry.created_at).toLocaleString()}
                    </Typography>
                    {entry.entry_text && (
                      <>
                        {entry.entry_text.split('\n').map((line, index) => {
                          // Split each line by the colon to identify the field and its content
                          const [field, ...content] = line.split(':');
                          const displayField = field.trim();
                          const displayContent = content.join(':').trim();

                          return (
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 1 }} key={index}>
                              <strong>{displayField}:</strong> {displayContent}
                            </Typography>
                          );
                        })}
                      </>
                    )}
                  </CardContent>
                  <CardActions sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDeleteEntry(entry.id)}
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

export default Journaling;

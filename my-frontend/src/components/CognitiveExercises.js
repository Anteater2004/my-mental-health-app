// src/components/CognitiveExercises.js

import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig'; // Ensure this points to your configured Axios instance
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Paper,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions as MuiDialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PsychologyIcon from '@mui/icons-material/Psychology'; // Icon for cognitive exercises

// **Static Data for Predefined CBT Tools**
const predefinedCBTToolsData = [
  {
    id: 'cbt1',
    title: 'Thought Record',
    description:
      'Identify and challenge negative thoughts by recording situations, emotions, and alternative perspectives.',
    example:
      'Situation: I failed my exam.\nEmotion: Sadness (7/10)\nAutomatic Thought: "I’m a failure."\nAlternative Thought: "Everyone faces setbacks. I can learn from this and improve."',
    type: 'CBT Tool',
  },
  {
    id: 'cbt2',
    title: 'Cognitive Restructuring',
    description:
      'Challenge and reframe unhelpful beliefs to develop more balanced and rational thoughts.',
    example:
      'Unhelpful Belief: "If I don’t succeed immediately, I’ll never succeed."\nReframed Thought: "Success takes time and effort. I can learn and grow from each attempt."',
    type: 'CBT Tool',
  },
  {
    id: 'cbt3',
    title: 'Behavioral Activation',
    description:
      'Engage in meaningful activities to improve mood and reduce depressive symptoms.',
    example:
      'Activity: Take a 30-minute walk in the park.\nPurpose: Increase exposure to sunlight and physical movement to boost mood.',
    type: 'CBT Tool',
  },
];

// **Static Data for Predefined Cognitive Exercises**
const predefinedCognitiveExercisesData = [
  {
    id: 'cognitive1',
    title: 'Metacognitive Awareness',
    description:
      'Enhance awareness of your thinking processes to alter your relationship with your thoughts.',
    example:
      'Exercise: Observe your thoughts without judgment. Note when you start to ruminate and gently redirect your focus to the present moment.',
    type: 'Cognitive Exercise',
  },
  {
    id: 'cognitive2',
    title: 'Concreteness Training',
    description:
      'Shift focus from abstract to concrete thinking to reduce rumination.',
    example:
      'Exercise: Instead of thinking "I’m always failing," focus on specific instances where you succeeded, such as "I passed my last project."',
    type: 'Cognitive Exercise',
  },
];

function CognitiveExercises() {
  // **State Variables**
  const [predefinedCBTTools, setPredefinedCBTTools] = useState([]);
  const [predefinedCognitiveExercises, setPredefinedCognitiveExercises] = useState([]);
  const [userCognitiveExercises, setUserCognitiveExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0); // 0: Predefined CBT Tools, 1: Predefined Cognitive Exercises, 2: Create Your Own
  const [currentExercise, setCurrentExercise] = useState(null); // The exercise currently being used
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // **Loading States**
  const [isLoadingUserExercises, setIsLoadingUserExercises] = useState(false);

  // **Debounced Search State**
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // **State for New User Exercise**
  const [newExercise, setNewExercise] = useState({
    title: '',
    description: '',
    example: '',
  });

  // **useEffect for Debouncing Search Query**
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // **Fetch Predefined and User Cognitive Exercises**
  useEffect(() => {
    // Set predefined exercises
    setPredefinedCBTTools(predefinedCBTToolsData);
    setPredefinedCognitiveExercises(predefinedCognitiveExercisesData);

    // Fetch user-created cognitive exercises from the backend
    const fetchUserCognitiveExercises = async () => {
      setIsLoadingUserExercises(true);
      setError('');
      try {
        const response = await axios.get('journaling/cognitive_exercises/');
        if (response.data) {
          // **Handle Paginated Response**
          if (Array.isArray(response.data)) {
            // If the backend is not paginated
            setUserCognitiveExercises(response.data);
          } else if (response.data.results && Array.isArray(response.data.results)) {
            // If the backend is paginated
            setUserCognitiveExercises(response.data.results);
          } else {
            // Unexpected response structure
            setError('Unexpected response format from server.');
          }
        } else {
          setError('No data received from server.');
        }
      } catch (err) {
        console.error('Failed to fetch cognitive exercises:', err);
        setError('Failed to load cognitive exercises. Please try again.');
      } finally {
        setIsLoadingUserExercises(false);
      }
    };

    fetchUserCognitiveExercises();
  }, []);

  // **Handle Tab Change**
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setCurrentExercise(null);
    setError('');
    setSuccess('');
    setSearchQuery('');
  };

  // **Handle Create Exercise**
  const handleCreateExercise = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!newExercise.title.trim() || !newExercise.description.trim() || !newExercise.example.trim()) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      // **Assume the backend expects title, prompt, example**
      const response = await axios.post('journaling/cognitive_exercises/', {
        title: newExercise.title.trim(),
        prompt: newExercise.description.trim(),
        example: newExercise.example.trim(),
      });

      // **Update user cognitive exercises**
      setUserCognitiveExercises([response.data, ...userCognitiveExercises]);

      // **Reset form**
      setNewExercise({
        title: '',
        description: '',
        example: '',
      });

      setSuccess('Custom exercise created successfully!');
    } catch (err) {
      console.error('Failed to create custom exercise:', err);
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat();
        setError(errorMessages.length > 0 ? errorMessages[0] : 'Failed to create custom exercise.');
      } else {
        setError('Failed to create custom exercise. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // **Handle Select Exercise (Predefined or User)**
  const handleSelectExercise = (exercise) => {
    setCurrentExercise(exercise);
    setError('');
    setSuccess('');
  };

  // **Handle Delete Exercise**
  const handleDeleteExercise = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  // **Confirm Deletion**
  const confirmDeleteExercise = async () => {
    const { id } = deleteConfirm;
    setDeleteConfirm({ open: false, id: null });
    setError('');
    setSuccess('');

    try {
      await axios.delete(`journaling/cognitive_exercises/${id}/`);
      setUserCognitiveExercises(userCognitiveExercises.filter((ex) => ex.id !== id));
      setSuccess('Exercise deleted successfully!');
    } catch (err) {
      console.error('Failed to delete exercise:', err);
      setError('Failed to delete exercise. Please try again.');
    }
  };

  // **Cancel Deletion**
  const cancelDeleteExercise = () => {
    setDeleteConfirm({ open: false, id: null });
  };

  // **Filter Exercises based on Debounced Search Query**
  const filterExercises = (exercises) => {
    if (!debouncedSearch.trim()) return exercises;

    return exercises.filter((ex) => {
      const titleText = ex.title?.toLowerCase() || '';
      const promptText = (ex.prompt || ex.description || '').toLowerCase();
      const exampleText = (ex.example || '').toLowerCase();
      const search = debouncedSearch.toLowerCase();
      return (
        titleText.includes(search) ||
        promptText.includes(search) ||
        exampleText.includes(search)
      );
    });
  };

  return (
    <Container maxWidth="lg">
      {/* **Header** */}
      <Box sx={{ display: 'flex', alignItems: 'center', my: 4 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
          aria-label="Back to Home"
        >
          Back to Home
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1, textAlign: 'center' }}>
          Cognitive Exercises
        </Typography>
        <Tooltip title="Psychology">
          <IconButton aria-label="Psychology">
            <PsychologyIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* **Tabs** */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered aria-label="Cognitive Exercises Tabs">
          <Tab label="Predefined CBT Tools" />
          <Tab label="Predefined Cognitive Exercises" />
          <Tab label="Create Your Own" />
        </Tabs>
      </Box>

      {/* **Content** */}
      <Box sx={{ mt: 3 }}>
        {/* **Success and Error Alerts** */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* **Search Bar (only in predefined tabs)** */}
        {(tabValue === 0 || tabValue === 1) && (
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon aria-label="Search Icon" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
            aria-label="Search Exercises"
          />
        )}

        {/* **Predefined CBT Tools** */}
        {tabValue === 0 && (
          <Box>
            {predefinedCBTTools.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress aria-label="Loading Predefined CBT Tools" />
              </Box>
            ) : (
              filterExercises(predefinedCBTTools).map((exercise) => (
                <Card key={exercise.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" component="h2">
                      {exercise.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {exercise.description}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                      <strong>Example:</strong>
                      <br />
                      {exercise.example}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleSelectExercise(exercise)}
                      aria-label={`Use ${exercise.title}`}
                    >
                      Use Exercise
                    </Button>
                    <Tooltip title="Delete Exercise">
                      <span>
                        <IconButton
                          aria-label="delete"
                          disabled
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </CardActions>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* **Predefined Cognitive Exercises** */}
        {tabValue === 1 && (
          <Box>
            {isLoadingUserExercises ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress aria-label="Loading Predefined Cognitive Exercises" />
              </Box>
            ) : predefinedCognitiveExercisesData.length === 0 ? (
              <Typography>No predefined cognitive exercises available.</Typography>
            ) : (
              filterExercises(predefinedCognitiveExercisesData).map((exercise) => (
                <Card key={exercise.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" component="h2">
                      {exercise.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {exercise.description}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                      <strong>Example:</strong>
                      <br />
                      {exercise.example}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleSelectExercise(exercise)}
                      aria-label={`Use ${exercise.title}`}
                    >
                      Use Exercise
                    </Button>
                    <Tooltip title="Delete Exercise">
                      <span>
                        <IconButton
                          aria-label="delete"
                          disabled
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </CardActions>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* **Create Your Own** */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Create a Custom Cognitive Exercise
            </Typography>
            <Paper sx={{ p: 3 }} elevation={3}>
              <form onSubmit={handleCreateExercise} aria-label="Create Custom Exercise Form">
                <TextField
                  fullWidth
                  label="Title"
                  value={newExercise.title}
                  onChange={(e) => setNewExercise({ ...newExercise, title: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                  aria-label="Exercise Title"
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={newExercise.description}
                  onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                  aria-label="Exercise Description"
                />
                <TextField
                  fullWidth
                  label="Example"
                  multiline
                  rows={4}
                  value={newExercise.example}
                  onChange={(e) => setNewExercise({ ...newExercise, example: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                  aria-label="Exercise Example"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  aria-label="Create Exercise"
                >
                  {isSubmitting ? 'Creating...' : 'Create Exercise'}
                </Button>
              </form>
            </Paper>

            {/* **List of User-Created Exercises** */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Custom Exercises
              </Typography>
              {isLoadingUserExercises ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress aria-label="Loading User-Created Exercises" />
                </Box>
              ) : userCognitiveExercises.length === 0 ? (
                <Typography>No custom exercises found. Create one above!</Typography>
              ) : (
                filterExercises(userCognitiveExercises).map((exercise) => (
                  <Card key={exercise.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" component="h2">
                        {exercise.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                        {exercise.prompt}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                        <strong>Example:</strong>
                        <br />
                        {exercise.example}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => handleSelectExercise(exercise)}
                        aria-label={`Use ${exercise.title}`}
                      >
                        Use Exercise
                      </Button>
                      <Tooltip title="Delete Exercise">
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteExercise(exercise.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                ))
              )}
            </Box>
          </Box>
        )}

        {/* **Exercise Details Section** */}
        {currentExercise && (
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }} elevation={3}>
              <Typography variant="h5" sx={{ mb: 2 }} component="h2">
                {currentExercise.title}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {currentExercise.prompt || currentExercise.description}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                <strong>Example:</strong>
                <br />
                {currentExercise.example}
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setCurrentExercise(null)}
                aria-label="Close Exercise Details"
              >
                Close
              </Button>
            </Paper>
          </Box>
        )}

        {/* **Delete Confirmation Dialog** */}
        <Dialog
          open={deleteConfirm.open}
          onClose={cancelDeleteExercise}
          aria-labelledby="delete-confirmation-dialog"
        >
          <DialogTitle id="delete-confirmation-dialog">Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this exercise?</Typography>
          </DialogContent>
          <MuiDialogActions>
            <Button onClick={cancelDeleteExercise} color="secondary" aria-label="Cancel Deletion">
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteExercise}
              color="error"
              variant="contained"
              aria-label="Confirm Deletion"
            >
              Delete
            </Button>
          </MuiDialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default CognitiveExercises;

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
import EditIcon from '@mui/icons-material/Edit'; // Import Edit Icon
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
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, type: null, exerciseTitle: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // **Loading States**
  const [isLoadingUserExercises, setIsLoadingUserExercises] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false); // Loading state for all notes

  // **Debounced Search State**
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // **State for New User Exercise**
  const [newExercise, setNewExercise] = useState({
    title: '',
    description: '',
    example: '',
  });

  // **State for Notes**
  const [notes, setNotes] = useState('');
  const [isSubmittingNotes, setIsSubmittingNotes] = useState(false);
  const [allExerciseNotes, setAllExerciseNotes] = useState({}); // All notes mapped by exercise

  // **State for Editing Notes**
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null); // The note object to edit
  const [editedNote, setEditedNote] = useState('');

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

  // **Fetch All Journaling Entries on Mount**
  useEffect(() => {
    const fetchAllExerciseNotes = async () => {
      setIsLoadingNotes(true);
      setError('');
      try {
        const response = await axios.get('journaling/');
        if (response.data) {
          let journalingEntries = [];
          if (Array.isArray(response.data)) {
            // If the backend is not paginated
            journalingEntries = response.data;
          } else if (response.data.results && Array.isArray(response.data.results)) {
            // If the backend is paginated
            journalingEntries = response.data.results;
          } else {
            // Unexpected response structure
            setError('Unexpected response format from server.');
            return;
          }

          // **Parse Entries and Map Them to Exercises**
          const notesMap = {};

          journalingEntries.forEach((entry) => {
            const entryText = entry.entry_text;
            const exercisePrefix = 'Exercise: ';
            if (entryText.startsWith(exercisePrefix)) {
              const splitIndex = entryText.indexOf('\n\n');
              if (splitIndex !== -1) {
                const exerciseTitle = entryText.substring(
                  exercisePrefix.length,
                  splitIndex
                ).trim();
                const userNote = entryText.substring(splitIndex + 2).trim();

                if (exerciseTitle in notesMap) {
                  notesMap[exerciseTitle].push({
                    id: entry.id,
                    note: userNote,
                    created_at: entry.created_at,
                  });
                } else {
                  notesMap[exerciseTitle] = [
                    {
                      id: entry.id,
                      note: userNote,
                      created_at: entry.created_at,
                    },
                  ];
                }
              }
            }
          });

          setAllExerciseNotes(notesMap);
        } else {
          setError('No data received from server.');
        }
      } catch (err) {
        console.error('Failed to fetch journaling entries:', err);
        setError('Failed to load notes. Please try again.');
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchAllExerciseNotes();
  }, []);

  // **Handle Tab Change**
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setCurrentExercise(null);
    setNotes('');
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

    // **Validation: Ensure all fields are filled**
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
        // **Aggregate and display all error messages**
        const errorMessages = Object.values(err.response.data).flat();
        setError(errorMessages.length > 0 ? errorMessages.join(' ') : 'Failed to create custom exercise.');
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
    setNotes(''); // Reset notes when selecting a new exercise
    setError('');
    setSuccess('');
  };

  // **Handle Delete Exercise**
  const handleDeleteExercise = (id) => {
    setDeleteConfirm({ open: true, id, type: 'exercise', exerciseTitle: null });
  };

  // **Confirm Deletion of Exercise**
  const confirmDeleteExercise = async () => {
    const { id } = deleteConfirm;
    setDeleteConfirm({ open: false, id: null, type: null, exerciseTitle: null });
    setError('');
    setSuccess('');

    try {
      await axios.delete(`journaling/cognitive_exercises/${id}/`);
      setUserCognitiveExercises(userCognitiveExercises.filter((ex) => ex.id !== id));

      // Optionally, remove related notes if any (requires backend support)
      // For now, notes remain as is.

      setSuccess('Exercise deleted successfully!');
    } catch (err) {
      console.error('Failed to delete exercise:', err);
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat();
        setError(errorMessages.length > 0 ? errorMessages.join(' ') : 'Failed to delete exercise.');
      } else {
        setError('Failed to delete exercise. Please try again.');
      }
    }
  };

  // **Cancel Deletion**
  const cancelDeleteExercise = () => {
    setDeleteConfirm({ open: false, id: null, type: null, exerciseTitle: null });
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

  // **Handle Submit Notes**
  const handleSubmitNotes = async () => {
    if (!notes.trim()) {
      setError('Please enter your thoughts before submitting.');
      return;
    }

    setIsSubmittingNotes(true);
    setError('');
    setSuccess('');

    try {
      // **Create a new Journaling entry with the notes**
      const response = await axios.post('journaling/', {
        entry_text: `Exercise: ${currentExercise.title}\n\n${notes.trim()}`,
      });

      // **Parse the new entry to extract note**
      const newEntryText = response.data.entry_text;
      const exercisePrefix = 'Exercise: ';
      const splitIndex = newEntryText.indexOf('\n\n');
      let exerciseTitle = '';
      let userNote = '';

      if (newEntryText.startsWith(exercisePrefix) && splitIndex !== -1) {
        exerciseTitle = newEntryText.substring(
          exercisePrefix.length,
          splitIndex
        ).trim();
        userNote = newEntryText.substring(splitIndex + 2).trim();
      }

      // **Update allExerciseNotes state**
      if (exerciseTitle && userNote) {
        setAllExerciseNotes((prevNotes) => {
          const updatedNotes = { ...prevNotes };
          if (exerciseTitle in updatedNotes) {
            updatedNotes[exerciseTitle].unshift({
              id: response.data.id,
              note: userNote,
              created_at: response.data.created_at,
            });
          } else {
            updatedNotes[exerciseTitle] = [
              {
                id: response.data.id,
                note: userNote,
                created_at: response.data.created_at,
              },
            ];
          }
          return updatedNotes;
        });
      }

      setSuccess('Your notes have been saved successfully!');
      setNotes('');
    } catch (err) {
      console.error('Failed to save notes:', err);
      if (err.response && err.response.data) {
        // **Aggregate and display all error messages**
        const errorMessages = Object.values(err.response.data).flat();
        setError(errorMessages.length > 0 ? errorMessages.join(' ') : 'Failed to save notes.');
      } else {
        setError('Failed to save notes. Please try again.');
      }
    } finally {
      setIsSubmittingNotes(false);
    }
  };

  // **Handle Delete Note**
  const handleDeleteNote = (id, exerciseTitle) => {
    setDeleteConfirm({ open: true, id, type: 'note', exerciseTitle });
  };

  // **Confirm Deletion of Note**
  const confirmDeleteNote = async () => {
    const { id, exerciseTitle } = deleteConfirm;
    setDeleteConfirm({ open: false, id: null, type: null, exerciseTitle: null });
    setError('');
    setSuccess('');

    try {
      await axios.delete(`journaling/${id}/`);
      setAllExerciseNotes((prevNotes) => {
        const updatedNotes = { ...prevNotes };
        if (exerciseTitle in updatedNotes) {
          updatedNotes[exerciseTitle] = updatedNotes[exerciseTitle].filter((note) => note.id !== id);
          // If no notes remain under the exercise, remove the key
          if (updatedNotes[exerciseTitle].length === 0) {
            delete updatedNotes[exerciseTitle];
          }
        }
        return updatedNotes;
      });

      setSuccess('Note deleted successfully!');
    } catch (err) {
      console.error('Failed to delete note:', err);
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat();
        setError(errorMessages.length > 0 ? errorMessages.join(' ') : 'Failed to delete note.');
      } else {
        setError('Failed to delete note. Please try again.');
      }
    }
  };

  // **Handle Open Edit Dialog**
  const handleOpenEditDialog = (note) => {
    setNoteToEdit(note);
    setEditedNote(note.note);
    setEditDialogOpen(true);
    setError('');
    setSuccess('');
  };

  // **Handle Close Edit Dialog**
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setNoteToEdit(null);
    setEditedNote('');
  };

  // **Handle Save Edited Note**
  const handleSaveEditedNote = async () => {
    if (!editedNote.trim()) {
      setError('Note cannot be empty.');
      return;
    }

    setIsSubmittingNotes(true);
    setError('');
    setSuccess('');

    try {
      // **Fetch the original journaling entry to preserve the exercise title**
      const originalEntryResponse = await axios.get(`journaling/${noteToEdit.id}/`);
      const originalEntryText = originalEntryResponse.data.entry_text;

      const exercisePrefix = 'Exercise: ';
      const splitIndex = originalEntryText.indexOf('\n\n');
      let exerciseTitle = '';

      if (originalEntryText.startsWith(exercisePrefix) && splitIndex !== -1) {
        exerciseTitle = originalEntryText.substring(
          exercisePrefix.length,
          splitIndex
        ).trim();
      }

      // **Compose the updated entry_text**
      const updatedEntryText = `Exercise: ${exerciseTitle}\n\n${editedNote.trim()}`;

      // **Send PATCH request to update the entry**
      const updatedEntryResponse = await axios.patch(`journaling/${noteToEdit.id}/`, {
        entry_text: updatedEntryText,
      });

      // **Update allExerciseNotes state**
      setAllExerciseNotes((prevNotes) => {
        const updatedNotes = { ...prevNotes };
        if (exerciseTitle in updatedNotes) {
          updatedNotes[exerciseTitle] = updatedNotes[exerciseTitle].map((note) =>
            note.id === noteToEdit.id
              ? { ...note, note: editedNote.trim(), created_at: updatedEntryResponse.data.created_at }
              : note
          );
        }
        return updatedNotes;
      });

      setSuccess('Note updated successfully!');
      handleCloseEditDialog();
    } catch (err) {
      console.error('Failed to update note:', err);
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat();
        setError(errorMessages.length > 0 ? errorMessages.join(' ') : 'Failed to update note.');
      } else {
        setError('Failed to update note. Please try again.');
      }
    } finally {
      setIsSubmittingNotes(false);
    }
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
                        {/* **Delete Disabled for Predefined Exercises** */}
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
                        {/* **Delete Disabled for Predefined Exercises** */}
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

        {/* **Your Notes Section** */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Your Notes
          </Typography>
          {isLoadingNotes ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress aria-label="Loading Your Notes" />
            </Box>
          ) : Object.keys(allExerciseNotes).length === 0 ? (
            <Typography>No notes found. Start using exercises to add notes!</Typography>
          ) : (
            Object.entries(allExerciseNotes).map(([exerciseTitle, notesArray]) => (
              <Box key={exerciseTitle} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {exerciseTitle}
                </Typography>
                {notesArray.map((note) => (
                  <Paper key={note.id} sx={{ p: 2, mb: 2 }} elevation={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {note.note}
                      </Typography>
                      <Box>
                        <Tooltip title="Edit Note">
                          <IconButton
                            aria-label="edit"
                            onClick={() => handleOpenEditDialog(note)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Note">
                          <IconButton
                            aria-label="delete"
                            onClick={() => handleDeleteNote(note.id, exerciseTitle)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(note.created_at).toLocaleString()}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ))
          )}
        </Box>

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

              {/* **Notes Section** */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Your Thoughts and Notes
                </Typography>
                <TextField
                  fullWidth
                  label="Add your notes here..."
                  multiline
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{ mb: 2 }}
                  aria-label="Add your notes here"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitNotes}
                  disabled={isSubmittingNotes}
                  aria-label="Save Notes"
                >
                  {isSubmittingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
              </Box>

              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setCurrentExercise(null)}
                sx={{ mt: 3 }}
                aria-label="Close Exercise Details"
              >
                Close
              </Button>
            </Paper>
          </Box>
        )}

        {/* **Edit Note Dialog** */}
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          aria-labelledby="edit-note-dialog-title"
        >
          <DialogTitle id="edit-note-dialog-title">Edit Note</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Edit your note"
              multiline
              rows={4}
              value={editedNote}
              onChange={(e) => setEditedNote(e.target.value)}
              sx={{ mt: 1 }}
              aria-label="Edit your note"
            />
          </DialogContent>
          <MuiDialogActions>
            <Button onClick={handleCloseEditDialog} color="secondary" aria-label="Cancel Edit">
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditedNote}
              color="primary"
              variant="contained"
              disabled={isSubmittingNotes}
              aria-label="Save Edited Note"
            >
              {isSubmittingNotes ? 'Saving...' : 'Save'}
            </Button>
          </MuiDialogActions>
        </Dialog>

        {/* **Delete Confirmation Dialog for Notes** */}
        <Dialog
          open={deleteConfirm.open && deleteConfirm.type === 'note'}
          onClose={cancelDeleteExercise}
          aria-labelledby="delete-note-confirmation-dialog"
        >
          <DialogTitle id="delete-note-confirmation-dialog">Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this note?</Typography>
          </DialogContent>
          <MuiDialogActions>
            <Button onClick={cancelDeleteExercise} color="secondary" aria-label="Cancel Deletion">
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteNote}
              color="error"
              variant="contained"
              aria-label="Confirm Deletion"
            >
              Delete
            </Button>
          </MuiDialogActions>
        </Dialog>

        {/* **Delete Confirmation Dialog for Exercises** */}
        <Dialog
          open={deleteConfirm.open && deleteConfirm.type === 'exercise'}
          onClose={cancelDeleteExercise}
          aria-labelledby="delete-exercise-confirmation-dialog"
        >
          <DialogTitle id="delete-exercise-confirmation-dialog">Confirm Deletion</DialogTitle>
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

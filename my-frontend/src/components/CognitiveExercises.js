import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
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
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PsychologyIcon from '@mui/icons-material/Psychology'; // Icon for cognitive exercises

export default function CognitiveExercises() {
  const [items, setItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemPrompt, setNewItemPrompt] = useState('');
  const [newItemExample, setNewItemExample] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems('journaling/cognitive_exercises/');
  }, [navigate]);

  const fetchItems = async (url) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(url);
      if (response.data && Array.isArray(response.data.results)) {
        setItems(prev => [...prev, ...response.data.results]);
        setNextUrl(response.data.next);
      } else {
        console.error('Unexpected response format for exercises:', response.data);
        setError('Unexpected response format from server.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch cognitive exercises:', err);
      setError('Failed to load cognitive exercises. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.example.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedItems(filtered);
    } else {
      setDisplayedItems(items);
    }
  }, [items, searchQuery]);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    setError('');

    if (!newItemTitle.trim() || !newItemPrompt.trim() || !newItemExample.trim()) {
      setError('Title, prompt, and example are required to add a new cognitive exercise.');
      return;
    }

    try {
      const response = await axios.post('journaling/cognitive_exercises/', {
        title: newItemTitle,
        prompt: newItemPrompt,
        example: newItemExample
      });

      if (response.data && response.data.id) {
        setItems([response.data, ...items]);
        setNewItemTitle('');
        setNewItemPrompt('');
        setNewItemExample('');
      } else {
        setError('Unexpected response after creating cognitive exercise.');
      }
    } catch (err) {
      console.error('Failed to create cognitive exercise:', err);
      if (err.response && err.response.data) {
        const messages = Object.values(err.response.data).flat().join(' ');
        setError(messages || 'Failed to create cognitive exercise. Please try again.');
      } else {
        setError('Failed to create cognitive exercise. Please try again.');
      }
    }
  };

  const handleDeleteItem = async (id) => {
    setError('');
    try {
      await axios.delete(`journaling/cognitive_exercises/${id}/`);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete cognitive exercise:', err);
      setError('Failed to delete cognitive exercise. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleLoadMore = () => {
    if (nextUrl) fetchItems(nextUrl);
  };

  if (loading && items.length === 0) {
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
          Loading cognitive exercises...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #f0f5f9, #ffffff)',
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
            sx={{ color: 'primary.main' }}
          >
            Back to Home
          </Button>
        </Box>

        {/* Centered Heading */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ textAlign: 'center', color: 'primary.dark' }}
          >
            Cognitive Exercises
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: '#fafafa' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
              <PsychologyIcon fontSize="large" />
            </Avatar>
          </Box>
          <Typography variant="h6" align="center" gutterBottom sx={{ color: 'text.primary' }}>
            Train Your Mind
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Engage in exercises that help improve cognitive flexibility and reduce negative thinking patterns.
            Add your own exercises to suit your personal growth.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* New Cognitive Exercise Form */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3, backgroundColor: '#ffffff' }}>
            <Typography variant="subtitle1" gutterBottom>
              Add a New Cognitive Exercise
            </Typography>
            <Box component="form" onSubmit={handleCreateItem} sx={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Title"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                label="Prompt"
                value={newItemPrompt}
                onChange={(e) => setNewItemPrompt(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                label="Example"
                value={newItemExample}
                onChange={(e) => setNewItemExample(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: 'flex-start' }}>
                Add Exercise
              </Button>
            </Box>
          </Paper>

          {/* Search bar */}
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search exercises..."
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
            Found <strong>{Array.isArray(displayedItems) ? displayedItems.length : 0}</strong> exercises.
          </Typography>

          {(!Array.isArray(displayedItems) || displayedItems.length === 0) ? (
            <Typography variant="body1" color="text.secondary">
              No exercises found. Try adding one above or adjusting your search.
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {displayedItems.map((item) => (
                <Card
                  elevation={2}
                  key={item.id}
                  sx={{
                    mb: 2,
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    position: 'relative',
                    transition: 'transform 0.1s',
                    '&:hover': { transform: 'scale(1.01)' }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Prompt:
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                      {item.prompt}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Example:
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                      {item.example}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDeleteItem(item.id)}
                      sx={{
                        color: 'error.main',
                        bgcolor: 'error.light',
                        '&:hover': { bgcolor: 'error.main', color: '#fff' },
                        transition: 'all 0.2s ease'
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

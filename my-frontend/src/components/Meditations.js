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
import SpaIcon from '@mui/icons-material/Spa';

export default function Meditations() {
  const [items, setItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemDuration, setNewItemDuration] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems('journaling/meditations/');
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
        console.error('Unexpected response format for meditations:', response.data);
        setError('Unexpected response format from server.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch meditations:', err);
      setError('Failed to load meditations. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedItems(filtered);
    } else {
      setDisplayedItems(items);
    }
  }, [items, searchQuery]);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    setError('');

    // Validate fields
    if (!newItemTitle.trim() || !newItemDescription.trim() || !newItemDuration.trim()) {
        setError('Title, description, and duration are required to add a new meditation.');
        return;
      }      

    const durationInt = parseInt(newItemDuration, 10);
    if (isNaN(durationInt) || durationInt <= 0) {
      setError('Duration must be a positive number.');
      return;
    }

    try {
      const response = await axios.post('journaling/meditations/', {
        title: newItemTitle,
        description: newItemDescription,
        duration: durationInt,
        audio_url: newItemUrl
      });

      if (response.data && response.data.id) {
        setItems([response.data, ...items]);
        setNewItemTitle('');
        setNewItemDescription('');
        setNewItemDuration('');
        setNewItemUrl('');
      } else {
        setError('Unexpected response after creating meditation.');
      }
    } catch (err) {
      console.error('Failed to create meditation:', err);

      // Log detailed error if available
      if (err.response) {
        console.error('Error response data:', err.response.data);
        // The backend might be returning something like:
        // { "duration": ["A valid integer is required."] } or other validation errors
        if (err.response.data && typeof err.response.data === 'object') {
          const messages = Object.values(err.response.data).flat().join(' ');
          setError(messages || 'Failed to create meditation. Please try again.');
        } else {
          setError('Failed to create meditation. Please try again.');
        }
      } else {
        setError('Failed to create meditation. Please try again.');
      }
    }
  };

  const handleDeleteItem = async (id) => {
    setError('');
    try {
      await axios.delete(`journaling/meditations/${id}/`);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete meditation:', err);
      setError('Failed to delete meditation. Please try again.');
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
          Loading meditations...
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
            Meditations
          </Typography>
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
            Explore a variety of meditations to relax, refocus, and rejuvenate. 
            Add your own meditations to keep track of what works best for you.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* New Meditation Form */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3, backgroundColor: '#ffffff' }}>
            <Typography variant="subtitle1" gutterBottom>
              Add a New Meditation
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
                label="Description"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Duration (minutes)"
                value={newItemDuration}
                onChange={(e) => setNewItemDuration(e.target.value)}
                sx={{ mb: 2 }}
                type="number"
                inputProps={{ min: "1" }}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Audio URL"
                value={newItemUrl}
                onChange={(e) => setNewItemUrl(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: 'flex-start' }}>
                Add Meditation
              </Button>
            </Box>
          </Paper>

          {/* Search bar */}
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search meditations..."
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
            Found <strong>{Array.isArray(displayedItems) ? displayedItems.length : 0}</strong> meditations.
          </Typography>

          {(!Array.isArray(displayedItems) || displayedItems.length === 0) ? (
            <Typography variant="body1" color="text.secondary">
              No meditations found. Try adding one above or adjusting your search.
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
                      Duration: {item.duration} min
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                      {item.description}
                    </Typography>
                    <Typography variant="body2" color="primary.main" sx={{ textDecoration: 'underline' }}>
                      <a href={item.audio_url} target="_blank" rel="noopener noreferrer">
                        Listen to Audio
                      </a>
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

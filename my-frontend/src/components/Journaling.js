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
import BookIcon from '@mui/icons-material/Book';
import SearchIcon from '@mui/icons-material/Search';

function Journaling() {
  const [entries, setEntries] = useState([]);
  const [displayedEntries, setDisplayedEntries] = useState([]); // Filtered set
  const [newEntryText, setNewEntryText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null); // For pagination
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch initial journal entries on component mount
  useEffect(() => {
    fetchEntries('journaling/');
  }, [navigate]);

  const fetchEntries = async (url) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(url);
      console.log('Fetch Entries Response:', response.data);

      if (response.data && Array.isArray(response.data.results)) {
        // Append or set entries
        setEntries(prev => [...prev, ...response.data.results]);
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
  };

  useEffect(() => {
    // Filter entries based on search query
    if (searchQuery.trim()) {
      const filtered = entries.filter((entry) =>
        entry.entry_text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedEntries(filtered);
    } else {
      setDisplayedEntries(entries);
    }
  }, [entries, searchQuery]);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    setError('');

    if (newEntryText.trim() === '') {
      setError('Entry text cannot be empty.');
      return;
    }

    try {
      const response = await axios.post('journaling/', {
        entry_text: newEntryText,
      });
      console.log('Create Entry Response:', response.data);

      if (response.data && response.data.id) {
        setEntries([response.data, ...entries]);
        setNewEntryText('');
      } else {
        console.error('Unexpected response format after creating entry:', response.data);
        setError('Unexpected response format after creating entry.');
      }
    } catch (error) {
      console.error('Failed to create journaling entry:', error);
      setError('Failed to create entry. Please try again.');
    }
  };

  const handleDeleteEntry = async (id) => {
    setError('');
    try {
      await axios.delete(`journaling/${id}/`);
      setEntries(entries.filter(entry => entry.id !== id));
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
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1, textAlign: 'center', color: 'primary.dark' }}>
            My Journal Entries
          </Typography>
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

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* New entry form */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3, backgroundColor: '#ffffff' }}>
            <Typography variant="subtitle1" gutterBottom>
              Add a New Entry
            </Typography>
            <Box component="form" onSubmit={handleCreateEntry} sx={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                label="What's on your mind today?"
                placeholder="Write down your thoughts here..."
                value={newEntryText}
                onChange={(e) => setNewEntryText(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: 'flex-start' }}>
                Add Entry
              </Button>
            </Box>
          </Paper>

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
              )
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
                  key={entry.id}
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
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Created At:</strong> {new Date(entry.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                      {entry.entry_text}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDeleteEntry(entry.id)}
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

export default Journaling;

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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Pagination,
  Grid,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import BookIcon from '@mui/icons-material/Book';
import JournalCard from './JournalCard'; // Import the JournalCard component

function Journaling() {
  const [entries, setEntries] = useState([]);
  const [displayedEntries, setDisplayedEntries] = useState([]); // Filtered set
  const [newEntry, setNewEntry] = useState({
    entry_text: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Added success state
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null); // For pagination
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false); // For confirmation after entry

  // State variables for editing
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditEntry, setCurrentEditEntry] = useState(null);
  const [updatedEntryText, setUpdatedEntryText] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Grouping state (e.g., by month/year)
  const [groupedEntries, setGroupedEntries] = useState({});

  // Memoize fetchEntries to prevent unnecessary re-creations
  const fetchEntries = useCallback(async (url) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: undefined, // Remove Authorization header if not needed
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
        // Search within entry_text for comprehensive filtering
        return (
          entry.entry_text.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setDisplayedEntries(filtered);
    } else {
      setDisplayedEntries(entries);
    }
  }, [entries, searchQuery]);

  useEffect(() => {
    // Group entries by month and year
    const groups = entries.reduce((acc, entry) => {
      const date = new Date(entry.created_at);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(entry);
      return acc;
    }, {});
    setGroupedEntries(groups);
  }, [entries]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(displayedEntries.length / entriesPerPage);

  // Get current page entries
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = displayedEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
  };

  // Handle creation of a new journal entry
  const handleCreateEntry = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Debugging log
    console.log('handleCreateEntry called');

    // Validate main notes field
    if (newEntry.entry_text.trim() === '') {
      setError('Entry text cannot be empty.');
      return;
    }

    try {
      const response = await axios.post('journaling/', {
        entry_text: newEntry.entry_text.trim(),
      }, {
        headers: {
          Authorization: undefined, // Remove Authorization header if not needed
        },
      });
      console.log('Create Entry Response:', response.data);

      if (response.data && response.data.id) {
        setEntries([response.data, ...entries]);
        setNewEntry({
          entry_text: '',
        });
        setSuccess('Journaling entry submitted successfully!');
        handleOpenDialog(); // Open the confirmation dialog
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
          Authorization: undefined, // Remove Authorization header if not needed
        },
      });
      setEntries(entries.filter(entry => entry.id !== id));
      setSuccess('Journaling entry deleted successfully!');
    } catch (error) {
      console.error('Failed to delete journaling entry:', error);
      setError('Failed to delete entry. Please try again.');
    }
  };

  // Functions to handle editing
  const handleOpenEditDialog = (entry) => {
    setCurrentEditEntry(entry);
    setUpdatedEntryText(entry.entry_text);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentEditEntry(null);
    setUpdatedEntryText('');
  };

  const handleUpdateEntry = async () => {
    if (updatedEntryText.trim() === '') {
      setError('Entry text cannot be empty.');
      return;
    }

    try {
      const response = await axios.put(`journaling/${currentEditEntry.id}/`, {
        entry_text: updatedEntryText.trim(),
      }, {
        headers: {
          Authorization: undefined, // Remove Authorization header if not needed
        },
      });

      console.log('Update Entry Response:', response.data);

      if (response.data && response.data.id) {
        // Update the entry in the local state
        setEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === response.data.id ? response.data : entry
          )
        );
        setSuccess('Journaling entry updated successfully!');
        handleCloseEditDialog();
      } else {
        console.error('Unexpected response format after updating entry:', response.data);
        setError('Unexpected response format after updating entry.');
      }
    } catch (error) {
      console.error('Failed to update journaling entry:', error);
      // Check if the error response provides more details
      if (error.response && error.response.data) {
        // Format error messages for better readability
        const errorMessages = Object.entries(error.response.data)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join(' | ');
        setError(`Failed to update entry: ${errorMessages}`);
      } else {
        setError('Failed to update entry. Please try again.');
      }
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

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  if (loading && entries.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f0f5f9, #ffffff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress aria-label="Loading spinner" />
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Loading your journal entries...
          </Typography>
        </Stack>
      </Box>
    );
  }

  console.log('Entries state at render:', displayedEntries);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #f0f5f9, #ffffff)',
        py: { xs: 2, sm: 4 },
      }}
    >
      <Container maxWidth="md">
        {/* Header Section */}
        <Grid container alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Grid item>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ color: 'primary.main' }}
              aria-label="Navigate back to home page"
            >
              Back to Home
            </Button>
          </Grid>
          <Grid item xs>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                textAlign: { xs: 'center', sm: 'left' },
                color: 'primary.dark',
                marginLeft: { sm: 2 }, // Added marginLeft for spacing on small screens and above
              }}
            >
              My Journal Entries
            </Typography>
          </Grid>
          <Grid item sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Tooltip title="Track your progress and understand your patterns">
              <IconButton aria-label="Information about journaling progress">
                <InfoIcon color="action" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search your entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" aria-label="Search icon" />
                </InputAdornment>
              ),
            }}
            inputProps={{
              'aria-label': 'Search your journal entries',
            }}
            label="Search Entries"
          />
        </Box>

        {/* Statistics */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            You have written{' '}
            <strong>{Array.isArray(displayedEntries) ? displayedEntries.length : 0}</strong>{' '}
            {Array.isArray(displayedEntries) && displayedEntries.length === 1 ? 'entry' : 'entries'} so far. Keep going!
          </Typography>
        </Box>

        {/* Entries List */}
        {(!Array.isArray(displayedEntries) || displayedEntries.length === 0) ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No entries found.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adding a new one above or adjusting your search.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {currentEntries.map((entry) => (
              <Grid item xs={12} key={entry.id}>
                <JournalCard
                  entry={entry}
                  onEdit={handleOpenEditDialog}
                  onDelete={handleDeleteEntry}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              aria-label="Journal entries pagination"
            />
          </Box>
        )}

        {/* New Entry Form */}
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2, mt: 6, backgroundColor: '#fafafa' }}>
          <Stack alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
              <BookIcon fontSize="large" />
            </Avatar>
            <Typography variant="h6" align="center" sx={{ color: 'text.primary' }}>
              Start Journaling
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Use this space to jot down your thoughts, feelings, and experiences. No structure needed—just let your thoughts flow.
            </Typography>
          </Stack>

          {/* Success and Error Messages */}
          <Box sx={{ mb: 2 }}>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>

          {/* New Entry Form */}
          <Box component="form" onSubmit={handleCreateEntry}>
            <TextField
              multiline
              rows={6}
              fullWidth
              variant="outlined"
              label="Your Thoughts"
              placeholder="Write your thoughts here..."
              value={newEntry.entry_text}
              onChange={(e) => setNewEntry({ ...newEntry, entry_text: e.target.value })}
              sx={{ mb: 3 }}
              inputProps={{
                'aria-label': 'Your journal entry text',
              }}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={newEntry.entry_text.trim() === ''}
              fullWidth
              aria-label="Submit journal entry"
            >
              Submit Entry
            </Button>
          </Box>
        </Paper>

        {/* Edit Entry Dialog */}
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm" aria-labelledby="edit-journal-entry-dialog-title">
          <DialogTitle id="edit-journal-entry-dialog-title">Edit Journal Entry</DialogTitle>
          <DialogContent>
            <TextField
              multiline
              rows={6}
              fullWidth
              variant="outlined"
              label="Your Thoughts"
              placeholder="Modify your thoughts here..."
              value={updatedEntryText}
              onChange={(e) => setUpdatedEntryText(e.target.value)}
              sx={{ mt: 2 }}
              inputProps={{
                'aria-label': 'Edit journal entry text',
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="secondary" aria-label="Cancel editing journal entry">
              Cancel
            </Button>
            <Button onClick={handleUpdateEntry} color="primary" variant="contained" aria-label="Save changes to journal entry">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="entry-added-dialog-title">
          <DialogTitle id="entry-added-dialog-title">Entry Added!</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Your journal entry has been successfully added. Keep up the great work!
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary" aria-label="Close confirmation dialog">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Journaling;

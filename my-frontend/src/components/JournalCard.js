// src/components/JournalCard.js

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  CardActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function JournalCard({ entry, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      elevation={2}
      sx={{
        mb: 2,
        backgroundColor: '#fff',
        borderRadius: 2,
        transition: 'transform 0.1s',
        '&:hover': { transform: 'scale(1.01)' },
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div">
          {new Date(entry.created_at).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {entry.entry_text.slice(0, 100)}...
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        {/* Edit Button */}
        <IconButton
          aria-label="edit"
          onClick={() => onEdit(entry)}
          sx={{
            color: 'primary.main',
            bgcolor: 'primary.light',
            '&:hover': { bgcolor: 'primary.dark', color: '#fff' },
            mr: 1,
            transition: 'all 0.2s ease',
          }}
        >
          <EditIcon />
        </IconButton>
        {/* Delete Button */}
        <IconButton
          aria-label="delete"
          onClick={() => onDelete(entry.id)}
          sx={{
            color: 'error.main',
            bgcolor: 'error.light',
            '&:hover': { bgcolor: 'error.main', color: '#fff' },
            transition: 'all 0.2s ease',
          }}
        >
          <DeleteIcon />
        </IconButton>
        {/* Expand/Collapse Button */}
        <IconButton
          aria-label={expanded ? 'Collapse' : 'Expand'}
          onClick={handleExpandClick}
          sx={{
            marginLeft: 'auto',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>{entry.entry_text}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default JournalCard;

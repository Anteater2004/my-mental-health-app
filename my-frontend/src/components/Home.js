// src/components/Home.js

import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Paper,
  CssBaseline,
  Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CreateIcon from '@mui/icons-material/Create';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpaIcon from '@mui/icons-material/Spa'; // Icon for Meditations
import PsychologyIcon from '@mui/icons-material/Psychology'; // For Cognitive Exercises
import AssignmentIcon from '@mui/icons-material/Assignment'; // For Problem-Solving Sessions
import BarChartIcon from '@mui/icons-material/BarChart'; // For Progress Tracking

// A simple helper to determine if the user is logged in based on the presence of an access_token
function isUserLoggedIn() {
  return !!localStorage.getItem('access_token');
}

export default function Home() {
  const navigate = useNavigate();
  const loggedIn = isUserLoggedIn();

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* Hero Section */}
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f0f5f9, #ffffff)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 80, height: 80 }}>
              <FavoriteIcon fontSize="large" />
            </Avatar>
          </Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to Your Mental Health Companion
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            Reduce negative overthinking, cultivate positive habits, and track your growth. Start your journey towards mindfulness, gratitude, and self-awareness.
          </Typography>

          {loggedIn ? (
            <>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Welcome back! Continue building your positive habits.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to="/profile"
                  size="large"
                  aria-label="Go to Profile"
                >
                  Go to Profile
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={RouterLink}
                  to="/journaling"
                  size="large"
                  aria-label="Open Your Journal"
                >
                  Open Your Journal
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to="/register"
                  size="large"
                  aria-label="Get Started"
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={RouterLink}
                  to="/login"
                  size="large"
                  aria-label="Login"
                >
                  Already have an account? Login
                </Button>
              </Box>
            </>
          )}
        </Paper>

        {/* Features Section */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Explore Our Core Features
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6 }}>
            Each tool helps you reduce rumination and strengthen your mental resilience.
          </Typography>

          <Grid container spacing={6}>
            {/* Meditations */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Tooltip title="Relax and focus with guided meditations">
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 80,
                        height: 80,
                        margin: '0 auto',
                        mb: 3,
                      }}
                    >
                      <SpaIcon fontSize="large" />
                    </Avatar>
                  </Tooltip>
                  <Typography variant="h5" gutterBottom>
                    Meditations
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Explore guided meditations to relax, focus, and cultivate inner peace.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/meditations"
                    aria-label="Browse Meditations"
                  >
                    Browse Meditations
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Journaling */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Tooltip title="Reflect on your thoughts and experiences">
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 80,
                        height: 80,
                        margin: '0 auto',
                        mb: 3,
                      }}
                    >
                      <CreateIcon fontSize="large" />
                    </Avatar>
                  </Tooltip>
                  <Typography variant="h5" gutterBottom>
                    Journaling
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Write your thoughts and reflect on your day to combat rumination and gain clarity.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/journaling"
                    aria-label="Start Journaling"
                  >
                    Start Journaling
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Cognitive Exercises */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Tooltip title="Engage in mental exercises to enhance cognitive flexibility">
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 80,
                        height: 80,
                        margin: '0 auto',
                        mb: 3,
                      }}
                    >
                      <PsychologyIcon fontSize="large" />
                    </Avatar>
                  </Tooltip>
                  <Typography variant="h5" gutterBottom>
                    Cognitive Exercises
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Engage in mental exercises to improve cognitive flexibility and reduce negative thinking patterns.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/cognitive_exercises"
                    aria-label="Try Cognitive Exercises"
                  >
                    Try Exercises
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Problem-Solving Sessions */}
            <Grid item xs={12} sm={6} md={6}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Tooltip title="Plan and track your problem-solving sessions">
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 80,
                        height: 80,
                        margin: '0 auto',
                        mb: 3,
                      }}
                    >
                      <AssignmentIcon fontSize="large" />
                    </Avatar>
                  </Tooltip>
                  <Typography variant="h5" gutterBottom>
                    Problem-Solving Sessions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Plan sessions to tackle challenges systematically and track your progress towards solutions.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/problem_solving_sessions"
                    aria-label="Start a Problem-Solving Session"
                  >
                    Start a Session
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Progress Tracking */}
            <Grid item xs={12} sm={6} md={6}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Tooltip title="View insights on your mental health and growth">
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 80,
                        height: 80,
                        margin: '0 auto',
                        mb: 3,
                      }}
                    >
                      <BarChartIcon fontSize="large" />
                    </Avatar>
                  </Tooltip>
                  <Typography variant="h5" gutterBottom>
                    Progress Tracking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receive insights about your mental health trends and personal growth.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/profile"
                    aria-label="View Progress"
                  >
                    View Progress
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Footer Section */}
        <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            We are here to help you take the first step toward better mental health. 🌱
          </Typography>
        </Box>
      </Container>
    </>
  );
}

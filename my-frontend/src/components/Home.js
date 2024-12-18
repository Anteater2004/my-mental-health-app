import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  CssBaseline
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CreateIcon from '@mui/icons-material/Create';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpaIcon from '@mui/icons-material/Spa'; // Icon for Meditations
import PsychologyIcon from '@mui/icons-material/Psychology'; // For Cognitive Exercises
import AssignmentIcon from '@mui/icons-material/Assignment'; // For Problem-Solving Sessions

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
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
              <FavoriteIcon fontSize="large" />
            </Avatar>
          </Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to Your Mental Health Companion
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
            Reduce negative overthinking, cultivate positive habits, and track your growth. 
            Start your journey towards mindfulness, gratitude, and self-awareness.
          </Typography>

          {loggedIn ? (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Welcome back! Continue building your positive habits.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mr: 2 }}
                onClick={() => navigate('/profile')}
              >
                Go to Profile
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/journaling')}
              >
                Open Your Journal
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                sx={{ mr: 2 }}
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button variant="outlined" color="primary" onClick={() => navigate('/login')}>
                Already have an account? Login
              </Button>
            </>
          )}
        </Paper>

        {/* Features Section */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            Explore Our Core Features
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Each tool helps you reduce rumination and strengthen your mental resilience.
          </Typography>

          <Grid container spacing={4}>
            {/* Row 1: Meditations, Journaling, Cognitive Exercises */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <SpaIcon fontSize="large" sx={{ mb: 2, color: 'primary.main' }} />
                  <Typography variant="h6" gutterBottom>Meditations</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Explore guided meditations to relax, focus, and cultivate inner peace.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mb: 2 }}>
                  <Link to="/meditations" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary">Browse Meditations</Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <CreateIcon fontSize="large" sx={{ mb: 2, color: 'primary.main' }} />
                  <Typography variant="h6" gutterBottom>Journaling</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Write your thoughts and reflect on your day to combat rumination and gain clarity.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mb: 2 }}>
                  <Link to="/journaling" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary">Start Journaling</Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <PsychologyIcon fontSize="large" sx={{ mb: 2, color: 'primary.main' }} />
                  <Typography variant="h6" gutterBottom>Cognitive Exercises</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Engage in mental exercises to improve cognitive flexibility and reduce negative thinking patterns.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mb: 2 }}>
                  <Link to="/cognitive_exercises" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary">Try Exercises</Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>

            {/* Row 2: Problem-Solving Sessions, Progress Tracking */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <AssignmentIcon fontSize="large" sx={{ mb: 2, color: 'primary.main' }} />
                  <Typography variant="h6" gutterBottom>Problem-Solving Sessions</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Plan sessions to tackle challenges systematically and track your progress towards solutions.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mb: 2 }}>
                  <Link to="/problem_solving_sessions" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary">Start a Session</Button>
                  </Link>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <TrendingUpIcon fontSize="large" sx={{ mb: 2, color: 'primary.main' }} />
                  <Typography variant="h6" gutterBottom>Progress Tracking</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receive insights about your mental health trends and personal growth.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', mb: 2 }}>
                  <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary">View Progress</Button>
                  </Link>
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

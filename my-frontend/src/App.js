import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordResetConfirm from './components/PasswordResetConfirm';
import ProtectedRoute from './components/ProtectedRoute';
import Journaling from './components/Journaling';

import Meditations from './components/Meditations';
import CognitiveExercises from './components/CognitiveExercises';
import ProblemSolvingSessions from './components/ProblemSolvingSessions';

function App() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/password_reset" element={<PasswordResetRequest />} />
      <Route path="/password_reset_confirm" element={<PasswordResetConfirm />} />

      <Route
        path="/journaling"
        element={
          <ProtectedRoute>
            <Journaling />
          </ProtectedRoute>
        }
      />

      {/* Public access pages for meditations and cognitive exercises */}
      <Route path="/meditations" element={<Meditations />} />
      <Route path="/cognitive_exercises" element={<CognitiveExercises />} />

      {/* Protected route for problem-solving sessions since it's user-specific */}
      <Route
        path="/problem_solving_sessions"
        element={
          <ProtectedRoute>
            <ProblemSolvingSessions />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

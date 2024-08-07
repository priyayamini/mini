import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import ImageUpload from './components/Profile';
import Profile from './components/ImageUpload';
import TaskManager from './components/TaskManager';

const App = () => {
  const [token, setToken] = useState('');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/upload" element={<ImageUpload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks" element={<TaskManager />} />
      </Routes>
    </Router>
  );
};

export default App;

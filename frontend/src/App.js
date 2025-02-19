import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Verification from './components/Verification';
import Profile from './components/Profile'; // Import the Profile component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/register" element={<Register />} />
        <Route path="/users/login" element={<Login />} />
        <Route path="/users/verification" element={<Verification />} />
        <Route path="/user/:userId/profile" element={<Profile />} /> {/* Add the Profile route */}
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Verification from './components/Verification';
import Profile from './components/Profile'; // Import the Profile component
import AccessDenied from './components/AccessDenied'; 
import NotFound from './components/NotFound';
import MaliciousInput from './components/MaliciousInput'; // Import the MaliciousInput component


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/register" element={<Register />} />
        <Route path="/users/login" element={<Login />} />
        <Route path="/users/verification" element={<Verification />} />
        <Route path="/users/:userId/profile" element={<Profile />} /> {/* Add the Profile route */}
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/malicious-input" element={<MaliciousInput />} /> {/* Add the MaliciousInput route */}
        <Route path="*" element={<NotFound />} /> {/* <-- CATCH-ALL ROUTE */}
        

        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/user/register');
  };

  return (
    <div className="home-container">
      <h1>JobTrack</h1>
      <h2>Welcome</h2>
      <div className="image-container">
        <img src="https://via.placeholder.com/150" alt="Job 1" />
        <img src="https://via.placeholder.com/150" alt="Job 2" />
        <img src="https://via.placeholder.com/150" alt="Job 3" />
      </div>
      <div className="button-container">
        <button>Login</button>
        <button onClick={handleRegisterClick}>Register</button>
      </div>
    </div>
  );
}

export default Home;
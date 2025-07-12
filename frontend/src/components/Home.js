import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeView from './HomeView';

/**
 * Home Container Component - Manages navigation logic and state for the home page
 * Handles route navigation and passes handlers to HomeView component for presentation
 * Serves as the main landing page controller for the NextHire application
 * @returns {JSX.Element} HomeView component with all required props
 */
function Home() {
  /**
   * Navigation hook for programmatic routing
   * @type {Function}
   */
  const navigate = useNavigate();

  /**
   * Handles navigation to different routes
   * Provides centralized navigation logic for the home page
   * @param {string} path - The route path to navigate to
   */
  const handleNavigationClick = (path) => {
    navigate(path);
  };

  /**
   * Handles navigation to login page
   * Redirects user to the login form
   */
  const handleLoginClick = () => {
    handleNavigationClick('/users/login');
  };

  /**
   * Handles navigation to register page
   * Redirects user to the registration form
   */
  const handleRegisterClick = () => {
    handleNavigationClick('/users/register');
  };

  return (
    <HomeView
      handleLoginClick={handleLoginClick}
      handleRegisterClick={handleRegisterClick}
    />
  );
}

export default Home;
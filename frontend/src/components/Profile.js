import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProfileView from './ProfileView';

/**
 * Profile Container Component - Manages job application data and user profile logic
 * Handles API calls, state management, and business logic for job applications
 * Passes data and handlers to ProfileView component for presentation
 * @returns {JSX.Element} ProfileView component with all required props
 */
function Profile() {
  const { userId } = useParams(); // <-- Este é o userId da URL: /users/:userId/profile
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Check if user is authorized to access this profile
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('userId');
    
    // No token - redirect to login
    if (!token) {
      navigate('/users/login');
      return;
    }
    
    // Trying to access someone else's profile - access denied
    if (userId !== currentUserId) {
      navigate('/access-denied');
      return;
    }
  }, [userId, navigate]);

  /**
   * User's name from localStorage or navigation state
   * @type {string}
   */
  const userName = useMemo(() => 
    location.state?.name || localStorage.getItem('name') || 'User', 
    [location.state?.name]
  );

  /**
   * All job applications for the user
   * @type {Array<Object>}
   */
  const [jobs, setJobs] = useState([]);

  /**
   * Form data for adding new job applications
   * @type {Object}
   */
  const [newJob, setNewJob] = useState({
    Position: '',
    Company: '',
    Phase: '',
    CL: false,
    Status: true,
    Note: '',
    'Applied date': '',
  });

  /**
   * Current filter values for job applications
   * @type {Object}
   */
  const [filters, setFilters] = useState({
    Position: '',
    Company: '',
    Phase: '',
    CL: '',
    Status: '',
    Note: '',
    'Applied date': ''
  });

  /**
   * Error state for API operations
   * @type {string}
   */
  const [error, setError] = useState('');

  /**
   * Loading state for async operations
   * @type {boolean}
   */
  const [loading, setLoading] = useState(true);

  /**
   * Authentication token from localStorage
   * @type {string|null}
   */
  const token = useMemo(() => localStorage.getItem('token'), []);

  /**
   * Axios instance with default configuration
   */
  const apiClient = useMemo(() => axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  }), [token]);

  /**
   * Generates unique options for filter dropdowns
   * @param {string} field - The field to extract unique values from
   * @returns {Array} Array of unique values
   */
  const uniqueOptions = useCallback((field) => {
    return [...new Set(jobs.map(job => job[field]).filter(value => 
      value !== undefined && value !== null && value !== ''
    ))];
  }, [jobs]);

  /**
   * Fetches job applications from the API
   */
  const fetchJobs = useCallback(async () => {
    if (!token) {
      navigate('/users/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get(`/jobs/${userId}`);
      setJobs(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setJobs([]);
      } else if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        navigate('/users/login');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch jobs');
      }
    } finally {
      setLoading(false);
    }
  }, [userId, navigate, token, apiClient]);

  /**
   * Handles changes to new job form fields
   * @param {Event} e - Input change event
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setNewJob(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  /**
   * Handles updating a job field value
   * @param {string} jobId - The ID of the job to update
   * @param {string} field - The field name to update
   * @param {*} value - The new value for the field
   * @param {string} type - The input type (for checkbox handling)
   */
  const handleJobFieldChange = useCallback((jobId, field, value, type) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job._id === jobId
          ? { ...job, [field]: type === 'checkbox' ? value : value }
          : job
      )
    );
  }, []);

  /**
   * Sanitizes job data for API submission
   * @param {Object} job - Job object to sanitize
   * @returns {Object} Sanitized job object
   */
  const sanitizeJobData = useCallback((job) => {
    const allowedUpdates = ['Phase', 'Status', 'Note', 'Position', 'Applied date', 'Company', 'CL'];
    const sanitizedJob = {};

    allowedUpdates.forEach(field => {
      if (field in job) {
        if (field === 'Status' || field === 'CL') {
          sanitizedJob[field] = Boolean(job[field]);
        } else if (field === 'Applied date' && job[field]) {
          const date = new Date(job[field]);
          sanitizedJob[field] = !isNaN(date) ? date.toISOString().slice(0, 10) : '';
        } else {
          sanitizedJob[field] = job[field];
        }
      }
    });

    return sanitizedJob;
  }, []);

  /**
   * Updates a job application in the database
   * @param {Object} job - The job object to update
   */
  const handleUpdateJob = useCallback(async (job) => {
    try {
      const jobToSend = sanitizeJobData(job);
      
      await apiClient.patch(`/jobs/${job._id}`, jobToSend);
      
      setJobs(prevJobs =>
        prevJobs.map(j =>
          j._id === job._id ? { ...j, ...jobToSend } : j
        )
      );
    } catch (err) {
      if (
        err.response?.status === 400 && err.response?.data?.message === 'Insecure input detected!'
      ) {
        navigate('/malicious-input');
      } else {
        setError('Failed to update job');
      }
    }
  }, [apiClient, sanitizeJobData, navigate]);

  /**
   * Adds a new job application to the database
   */
  const handleAddJob = useCallback(async () => {
    try {
      const jobToSend = sanitizeJobData(newJob);
      
      const response = await apiClient.post('/jobs/createjob', jobToSend);
      
      setJobs(prevJobs => [...prevJobs, response.data.job]);
      setNewJob({
        Position: '',
        Company: '',
        Phase: '',
        CL: false,
        Status: true,
        Note: '',
        'Applied date': ''
      });
    } catch (err) {
      if (
        err.response?.status === 400 && err.response?.data?.message === 'Insecure input detected!'
      ) {
        navigate('/malicious-input');
      } else {
        setError('Failed to add job');
      }
    }
  }, [apiClient, sanitizeJobData, newJob, navigate]);

  /**
   * Deletes a job application from the database
   * @param {string} jobId - The ID of the job to delete
   */
  const handleDeleteJob = useCallback(async (jobId) => {
    try {
      await apiClient.delete(`/jobs/${jobId}`);
      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
    } catch (err) {
      setError('Failed to delete job');
    }
  }, [apiClient]);

  /**
   * Formats date values for display in date inputs
   * @param {string|Date} date - The date to format
   * @returns {string} Formatted date string (YYYY-MM-DD)
   */
  const getDateValue = useCallback((date) => {
    if (!date) return '';
    
    if (typeof date === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
      if (!isNaN(Date.parse(date))) return new Date(date).toISOString().slice(0, 10);
    }
    
    if (date instanceof Date && !isNaN(date)) {
      return date.toISOString().slice(0, 10);
    }
    
    return '';
  }, []);

  /**
   * Filters jobs based on current filter values
   * @returns {Array<Object>} Filtered array of job objects
   */
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesPosition = !filters.Position || 
        job.Position?.toLowerCase().includes(filters.Position.toLowerCase());
      
      const matchesCompany = !filters.Company || 
        job.Company?.toLowerCase().includes(filters.Company.toLowerCase());
      
      const matchesPhase = !filters.Phase || 
        job.Phase?.toLowerCase().includes(filters.Phase.toLowerCase());
      
      const matchesCL = !filters.CL || 
        String(job.CL).toLowerCase().includes(filters.CL.toLowerCase());
      
      const matchesStatus = !filters.Status || 
        (job.Status ? 'active' : 'inactive').includes(filters.Status.toLowerCase());
      
      const matchesNote = !filters.Note || 
        job.Note?.toLowerCase().includes(filters.Note.toLowerCase());
      
      const matchesDate = !filters['Applied date'] || 
        getDateValue(job['Applied date']).includes(filters['Applied date']);

      return matchesPosition && matchesCompany && matchesPhase && 
             matchesCL && matchesStatus && matchesNote && matchesDate;
    });
  }, [jobs, filters, getDateValue]);

  /**
   * Effect hook to fetch jobs on component mount
   */
  useEffect(() => {
    if (userId) {
      fetchJobs();
    }
  }, [userId, fetchJobs]);

  // Show loading state
  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  // Show error state
  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  // Render ProfileView with all required props
  return (
    <ProfileView
      filters={filters}
      setFilters={setFilters}
      uniqueOptions={uniqueOptions}
      filteredJobs={filteredJobs}
      jobs={jobs}
      newJob={newJob}
      setNewJob={setNewJob}
      handleChange={handleChange}
      handleJobFieldChange={handleJobFieldChange}
      handleUpdateJob={handleUpdateJob}
      handleDeleteJob={handleDeleteJob}
      handleAddJob={handleAddJob}
      getDateValue={getDateValue}
      userName={userName}
    />
  );
}

export default Profile;
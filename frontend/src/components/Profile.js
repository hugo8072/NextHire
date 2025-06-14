import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Profile.css';
import ProfileView from './ProfileView';

function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    Position: '',
    Company: '',
    Phase: '',
    CL: false,
    Status: true,
    Notes: '',
    'Applied date': '',
  });
  const [filters, setFilters] = useState({
    Position: '',
    Company: '',
    Phase: '',
    CL: '',
    Status: '',
    Note: '',
    'Applied date': ''
  });
  const [error, setError] = useState('');

  const uniqueOptions = (field) => [...new Set(jobs.map(j => j[field]).filter(v => v !== undefined && v !== null && v !== ''))];

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(
      "sjaddasssssssssssssssssssssssssssssssssssssssssss\n" +
      "sdammmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm\n" +
      "dsaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  );
    if (token) {
      console.log('TOKEN35:', token); // Deve mostrar o token
    } else {
      console.log('TOKEN35: sem token');
    }


    const fetchJobs = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/jobs/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
        setJobs(response.data);
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error &&
          error.response.status === 404
        ) {
          setJobs([]);
        } else if (error.response && error.response.data && error.response.data.error) {
          console.error('Error fetching jobs:', error.response.data.error);
          setError(error.response.data.error);
        } else {
          console.error('Error fetching jobs:', error.message);
          setError('Error fetching jobs: ' + error.message);
        }
      }
    };


    fetchJobs();
  }, [userId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewJob({
      ...newJob,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleJobFieldChange = (jobId, field, value, type) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === jobId
          ? { ...job, [field]: type === 'checkbox' ? value : value }
          : job
      )
    );
  };

  const handleUpdateJob = async (job) => {
    const token = localStorage.getItem('token');
    const allowedUpdates = [
      'Phase', 'Status', 'Note', 'Position', 'Applied date', 'Company', 'CL'
    ];
    const jobToSend = {};

    allowedUpdates.forEach(field => {
      if (field in job) {
        if (field === 'Status' || field === 'CL') {
          jobToSend[field] = !!job[field];
        } else if (field === 'Applied date' && job[field]) {
          const d = new Date(job[field]);
          jobToSend[field] = !isNaN(d) ? d.toISOString().slice(0, 10) : '';
        } else {
          jobToSend[field] = job[field];
        }
      }
    });

    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/jobs/${job._id}`,
        jobToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      setJobs(prevJobs =>
        prevJobs.map(j =>
          j._id === job._id ? { ...j, ...jobToSend } : j
        )
      );
    } catch (error) {
      if (error.response) {
        console.error('Error updating job:', error.response.data);
      } else {
        console.error('Error updating job:', error);
      }
    }
  };

  const handleAddJob = async () => {
    const token = localStorage.getItem('token');
    try {
      const jobToSend = {
        ...newJob,
        'Applied date': newJob['Applied date']
          ? new Date(newJob['Applied date']).toISOString().slice(0, 10)
          : '',
      };
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/jobs/createjob`,
        jobToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      setJobs([...jobs, response.data.job]);
      setNewJob({
        Position: '',
        Company: '',
        Phase: '',
        CL: false,
        Status: true,
        Notes: '',
        'Applied date': ''
      });
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };

const handleDeleteJob = async (jobId) => {
  const token = localStorage.getItem('token');
  try {
    await axios.delete(
      `${process.env.REACT_APP_API_URL}/jobs/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
    setJobs(jobs.filter(job => job._id !== jobId));
  } catch (error) {
    console.error('Error deleting job:', error);
  }
};

  const getDateValue = (date) => {
    if (!date) return '';
    if (typeof date === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
      if (!isNaN(Date.parse(date))) return new Date(date).toISOString().slice(0, 10);
    }
    if (date instanceof Date && !isNaN(date)) {
      return date.toISOString().slice(0, 10);
    }
    return '';
  };

  const filteredJobs = jobs.filter(job => {
    return (
      (filters.Position === '' || job.Position?.toLowerCase().includes(filters.Position.toLowerCase())) &&
      (filters.Company === '' || job.Company?.toLowerCase().includes(filters.Company.toLowerCase())) &&
      (filters.Phase === '' || job.Phase?.toLowerCase().includes(filters.Phase.toLowerCase())) &&
      (filters.CL === '' || String(job.CL).toLowerCase().includes(filters.CL.toLowerCase())) &&
      (filters.Status === '' || (job.Status ? 'active' : 'inactive').includes(filters.Status.toLowerCase())) &&
      (filters.Note === '' || job.Note?.toLowerCase().includes(filters.Note.toLowerCase())) &&
      (filters['Applied date'] === '' || getDateValue(job['Applied date']).includes(filters['Applied date']))
    );
  });

  if (error) {
    return <div className="error">{error}</div>;
  }

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

    
    />
  );
}

export default Profile;
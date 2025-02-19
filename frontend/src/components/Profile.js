// frontend/src/components/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const { userId } = useParams();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/users/${userId}/jobs`, {
          withCredentials: true,
        });
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, [userId]);

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Company</th>
            <th>Notes</th>
            <th>Status</th>
            <th>Applied Date</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job._id}>
              <td>{job.Position}</td>
              <td>{job.Company}</td>
              <td>{job.Note}</td>
              <td>{job.Status ? 'Active' : 'Inactive'}</td>
              <td>{job['Applied date']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Profile;
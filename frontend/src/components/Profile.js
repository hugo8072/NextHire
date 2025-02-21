import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const { userId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    Position: '',
    Company: '',
    Phase: '',
    CL: false,
    Note: '',
    'Applied date': ''
  });

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewJob({
      ...newJob,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:8000/users/${userId}/jobs`, newJob, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      setJobs([...jobs, response.data]);
      setNewJob({
        Position: '',
        Company: '',
        Phase: '',
        CL: false,
        Note: '',
        'Applied date': ''
      });
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Company</th>
            <th>Phase</th>
            <th>CL</th>
            <th>Status</th>
            <th>Note</th>
            <th>Applied Date</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job._id}>
              <td>{job.Position}</td>
              <td>{job.Company}</td>
              <td>{job.Phase}</td>
              <td>{job.CL ? 'Yes' : 'No'}</td>
              <td>{job.Status ? 'Active' : 'Inactive'}</td>
              <td>{job.Note}</td>
              <td>{job['Applied date']}</td>
            </tr>
          ))}
          {/* Nova linha para adicionar um novo Job */}
          <tr>
            <td><input type="text" name="Position" value={newJob.Position} onChange={handleChange} /></td>
            <td><input type="text" name="Company" value={newJob.Company} onChange={handleChange} /></td>
            <td><input type="text" name="Phase" value={newJob.Phase} onChange={handleChange} /></td>
            <td><input type="checkbox" name="CL" checked={newJob.CL} onChange={handleChange} /></td>
            <td>-</td>
            <td><input type="text" name="Note" value={newJob.Note} onChange={handleChange} /></td>
            <td><input type="date" name="Applied date" value={newJob['Applied date']} onChange={handleChange} /></td>
            <td><button onClick={handleAddJob}>Add Job</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Profile;

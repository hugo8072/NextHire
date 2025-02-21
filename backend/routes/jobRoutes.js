import express from 'express';
const router = express.Router();
import auth from '../middlewares/auth.js';
import Job from '../models/Job.js';

// Test route to verify if the job routes are working
router.get('/test', auth, (req, res) => {
    res.json({
        message: 'Job routes are working!',
        user: req.user
    });
});

// Create a job route
router.post('/createjob', auth, async (req, res) => {
    try {
        // Log the request body to the terminal for debugging
        console.log('Creating a new job:', req.body);

        // Logic to create the job here
        const job = new Job({
            ...req.body,   // Destructure the data from the request body
            owner: req.user._id  // Add the authenticated user's ID as the owner
        });

        await job.save();  // Save the job to the database

        // Log the created job to the terminal
        console.log('Job created:', job);

        // Send a successful response
        res.status(201).send({ job, message: "Job created successfully!" });
    } catch (error) {
        // Log error to the terminal and send a failure response
        console.error('Error creating job:', error);
        res.status(500).json({ message: error.message });
    }
});
// Get jobs for all users
router.get('/getjobs', async (req, res) => {
    try {
        const jobs = await Job.find();

        res.status(200).json({
            jobs: jobs,
            count: jobs.length,
            message: "Jobs fetched successfully"
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Fetch job by ID route
router.get('/:id', auth, async (req, res) => {
    const jobId = req.params.id; // Corrected "parms" to "params"

    try {
        const job = await Job.findOne({
            _id: jobId,  // Ensure the job ID matches
            owner: req.user._id  // Ensure that the user is the owner of the job
        });

        if (!job) {  // If the job is not found, send a 404 response
            return res.status(404).json({ message: "Job not found" });
        }

        // Send the found job in the response
        res.status(200).json({
            task: job,
            message: "Job found successfully"
        });
    } catch (err) {
        res.status(500).send({ error: err.message });  // Send an error message if something goes wrong
    }
});

// Update job route
router.patch('/:id', auth, async (req, res) => {
    const jobId = req.params.id;  // Extract job ID from the route parameters

    // Get the keys of the fields being updated from the request body
    const updates = Object.keys(req.body);

    // Define which fields are allowed to be updated
    const allowedUpdates = ['Phase', 'Status', 'Note'];

    // Check if all the fields in the request body are allowed to be updated
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    // If there are invalid fields, return a 400 (Bad Request) response
    if (!isValidOperation) {
        return res.status(400).json({ message: "Invalid updates" });
    }

    try {
        // Find the job by ID and ensure the user is the owner of the job
        const job = await Job.findOne({
            _id: jobId,
            owner: req.user._id,
            status: true
        });

        // If the job is not found, return a 404 (Not Found) response
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Update the allowed fields with the new values from the request body
        updates.forEach(update => job[update] = req.body[update]);

        // Save the updated job to the database
        await job.save();

        // Return a success message and the updated job
        res.status(200).json({
            message: "Job updated successfully",
            job: job
        });
    } catch (err) {
        // If an error occurs, return a 500 (Internal Server Error) response with the error message
        res.status(500).send({ error: err.message });
    }
});

// Delete job route
router.delete('/:id', auth, async (req, res) => {
    const jobId = req.params.id;  // Extract the job ID from the route parameters

    try {
        // Find and delete the job by ID and ensure the user is the owner
        const job = await Job.findOneAndDelete({
            _id: jobId,
            owner: req.user._id  // Ensure that the user deleting the job is the owner
        });

        // If the job is not found, return a 404 (Not Found) response
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Return a success message
        res.status(200).json({
            message: "Job deleted successfully"
        });
    } catch (err) {
        // If an error occurs, return a 500 (Internal Server Error) response with the error message
        res.status(500).send({ error: err.message });
    }
});

export default router;

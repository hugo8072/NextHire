import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, authorizeProfileAccess } from '../middlewares/auth.js';
import Job from '../models/Job.js';

const router = express.Router();

// Create job route
router.post('/createjob', auth, [
    body('Position').trim().escape().notEmpty().withMessage('Position is required'),
    body('Company').trim().escape().notEmpty().withMessage('Company is required'),
    body('Phase').optional().trim().escape(), // <-- agora opcional
    body('CL').isBoolean().withMessage('CL must be a boolean'),
    body('Status').isBoolean().withMessage('Status must be a boolean'),
    body('Note').optional().trim().escape(), // <-- agora opcional
    body('Applied date')
        .notEmpty().withMessage('Applied date is required')
        .isISO8601().toDate().withMessage('Applied date must be a valid date')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Garante que a data é um objeto Date
        const jobData = {
            ...req.body,
            owner: req.user._id,
            'Applied date': req.body['Applied date'] ? new Date(req.body['Applied date']) : undefined
        };

        const job = new Job(jobData);

        await job.save();
        console.log('Job created:', job);

        res.status(201).send({ job, message: "Job created successfully!" });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: error.message });
    }
});

// Fetch all jobs (only accessible by the master user)
router.get('/getjobs', auth, async (req, res) => {
    try {
        if (req.user.role !== 'master') {
            return res.status(403).json({ message: "Access denied" });
        }

        console.log('Fetching all jobs...');
        const jobs = await Job.find();
        console.log('Jobs fetched:', jobs);

        res.status(200).json({
            jobs: jobs,
            count: jobs.length,
            message: "Jobs fetched successfully"
        });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).send({ error: err.message });
    }
});

// Fetch jobs by user ID (accessible by the owner or the master user)
router.get('/:userId', auth, authorizeProfileAccess, async (req, res) => {
    const userId = req.params.userId;

    try {
        console.log(`Fetching jobs for user ${userId}...`);
        const jobs = await Job.find({ owner: userId });
        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ error: "No jobs found for this user." });
        }
        console.log('Jobs fetched:', jobs);

        res.status(200).json(jobs); // <-- devolve só o array!
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).json({ error: "Error fetching jobs: " + err.message });
    }
});

// Update job route
router.patch('/:id', auth, [
    body('Phase').optional().trim().escape(),
    body('Status').optional().isBoolean().withMessage('Status must be a boolean'),
    body('Note').optional().trim().escape(),
    body('Position').optional().trim().escape(),
    body('Applied date').optional().isISO8601().toDate().withMessage('Applied date must be a valid date'),
    body('Company').optional().trim().escape(),
    body('CL').optional().isBoolean().withMessage('CL must be a boolean')
], async (req, res) => {
    const jobId = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['Phase', 'Status', 'Note', 'Position', 'Applied date','CL', 'Company'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: "Invalid updates" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const job = await Job.findOne({
            _id: jobId,
            owner: req.user._id
        });

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        updates.forEach(update => job[update] = req.body[update]);
        await job.save();

        res.status(200).json({
            message: "Job updated successfully",
            job: job
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Delete job route
router.delete('/:id', auth, async (req, res) => {
    const jobId = req.params.id;

    try {
        const job = await Job.findOneAndDelete({
            _id: jobId,
            owner: req.user._id
        });

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({
            message: "Job deleted successfully"
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

export default router;
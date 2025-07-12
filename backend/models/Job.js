/**
 * Mongoose schema and model for storing job application records.
 *
 * - Each job document contains information about the position, company, application phase,
 *   whether a cover letter (CL) was sent, the current status, notes, and the applied date.
 * - The 'owner' field references the User who created the job entry.
 * - Timestamps are automatically added for creation and update times.
 */

import mongoose from 'mongoose';

// Define the schema for a job application
const jobSchema = new mongoose.Schema({
    Position: { type: String, required: true }, // Job position title
    Company: { type: String, required: true },  // Company name
    Phase: { type: String, required: true },    // Application phase (e.g., interview, applied)
    CL: { type: Boolean, required: true },      // Whether a cover letter was sent
    Status: { type: Boolean, required: true },  // Current status (e.g., active, closed)
    Note: { type: String, required: false },    // Optional notes about the application
    'Applied date': { type: String, required: true }, // Date the application was submitted
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Reference to the User model
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create and export the Job model from the schema
const Job = mongoose.model('Job', jobSchema);

export default Job;

/**
 * Middleware to track and limit 2FA (two-factor authentication) validation attempts by email.
 *
 * - Tracks failed 2FA validation attempts in memory for each email.
 * - Resets counters after a defined time window (default: 15 minutes).
 * - If the maximum number of failed attempts is exceeded for an email,
 *   logs the event to MongoDB using the TwoFALog model and blocks further attempts with a 429 response.
 * - Continues to the next middleware if limits are not exceeded.
 *
 * Usage: Place this middleware before your 2FA validation route handler to protect against brute-force attacks.
 */

import User from '../models/User.js';
import useragent from 'useragent';
import geoip from 'geoip-lite';
import requestIp from 'request-ip';
import device from 'express-device';
import mongoose from 'mongoose';

// Mongoose schema and model for logging 2FA attempt events
const twoFALogSchema = new mongoose.Schema({
  ip: String,
  email: String,
  userAgent: String,
  geo: Object,
  deviceType: String,
  timestamp: { type: Date, default: Date.now },
  attempts: Number,
  ips: [String]
});
const TwoFALog = mongoose.models.TwoFALog || mongoose.model('TwoFALog', twoFALogSchema);

// Maximum allowed failed attempts per email
const MAX_ATTEMPTS_EMAIL = 5;
// Time window to reset the attempt counters (15 minutes)
const ATTEMPT_RESET_TIME = 15 * 60 * 1000;

// In-memory tracker for attempts by email
const attemptTrackerEmail = {};

/**
 * Express middleware to track and limit 2FA validation attempts.
 * Blocks requests and logs to MongoDB if limits are exceeded.
 */
const twoFA_Track_Attempts = async (req, res, next) => {
    const ip = requestIp.getClientIp(req);
    const currentTime = Date.now();
    const { email, verificationCode } = req.body;

    // Initialize tracker for this email if it doesn't exist
    if (!attemptTrackerEmail[email]) {
        attemptTrackerEmail[email] = { attempts: 0, lastAttempt: currentTime, ips: [] };
    }

    // Reset email tracker if time window has passed
    if (currentTime - attemptTrackerEmail[email].lastAttempt > ATTEMPT_RESET_TIME) {
        attemptTrackerEmail[email] = { attempts: 0, lastAttempt: currentTime, ips: [] };
    }

    // Check if the verification code is correct for the given email
    const user = await User.findOne({ email });
    const isCodeCorrect = user && user.verificationCode === verificationCode;

    // If code is incorrect, increment attempt counters and log details
    if (!isCodeCorrect) {
        attemptTrackerEmail[email].attempts += 1;
        attemptTrackerEmail[email].lastAttempt = currentTime;
        attemptTrackerEmail[email].ips.push(ip);
    }

    // If the maximum number of attempts is exceeded for email, log to MongoDB and block further attempts
    if (attemptTrackerEmail[email].attempts > MAX_ATTEMPTS_EMAIL) {
        const agent = useragent.parse(req.headers['user-agent']);
        const geo = geoip.lookup(ip);

        // Save the attempt log to MongoDB
        await TwoFALog.create({
            ip,
            email,
            userAgent: agent.toString(),
            geo,
            deviceType: req.device?.type,
            attempts: attemptTrackerEmail[email].attempts,
            ips: attemptTrackerEmail[email].ips
        });

        return res.status(429).json({ message: 'Too many validation attempts. Please try again later.' });
    }

    // Continue to the next middleware or route handler
    next();
};

export { twoFA_Track_Attempts, attemptTrackerEmail };
export default twoFA_Track_Attempts;
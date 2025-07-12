/**
 * Middleware to track and limit login attempts by IP and email.
 *
 * - Tracks failed login attempts in memory for each IP and email.
 * - Resets counters after a defined time window (default: 15 minutes).
 * - If the maximum number of failed attempts is exceeded for either IP or email,
 *   logs the event to MongoDB using the LoginAttempt model and blocks further attempts with a 429 response.
 * - Does not log or store passwords.
 * - Continues to the next middleware if limits are not exceeded.
 *
 * Usage: Place this middleware before your login route handler to protect against brute-force attacks.
 */

import User from '../models/User.js';
import { verifyPassword } from '../utils/argon.js';
import useragent from 'useragent';
import geoip from 'geoip-lite';
import requestIp from 'request-ip';
import device from 'express-device';

// Maximum allowed failed attempts per IP and per email
const MAX_ATTEMPTS_IP = 10;
const MAX_ATTEMPTS_EMAIL = 5;
// Time window to reset the attempt counters (15 minutes)
const ATTEMPT_RESET_TIME = 15 * 60 * 1000;

// In-memory trackers for attempts by IP and by email
const attemptTrackerIP = {};
const attemptTrackerEmail = {};

/**
 * Express middleware to track and limit login attempts.
 * Blocks requests and logs to MongoDB if limits are exceeded.
 */
const login_Track_Attempts = async (req, res, next) => {
    const ip = requestIp.getClientIp(req);
    const currentTime = Date.now();
    const { email, password } = req.body;

    // Initialize tracker for this IP if it doesn't exist
    if (!attemptTrackerIP[ip]) {
        attemptTrackerIP[ip] = { attempts: 0, lastAttempt: currentTime, emails: [] };
    }

    // Initialize tracker for this email if it doesn't exist
    if (!attemptTrackerEmail[email]) {
        attemptTrackerEmail[email] = { attempts: 0, lastAttempt: currentTime, ips: [] };
    }

    // Reset IP tracker if time window has passed
    if (currentTime - attemptTrackerIP[ip].lastAttempt > ATTEMPT_RESET_TIME) {
        attemptTrackerIP[ip] = { attempts: 0, lastAttempt: currentTime, emails: [] };
    }

    // Reset email tracker if time window has passed
    if (currentTime - attemptTrackerEmail[email].lastAttempt > ATTEMPT_RESET_TIME) {
        attemptTrackerEmail[email] = { attempts: 0, lastAttempt: currentTime, ips: [] };
    }

    // Check if the password is correct for the given email
    const user = await User.findOne({ email });
    const isPasswordCorrect = user && await verifyPassword(user.password, password);

    // If password is incorrect, increment attempt counters and log details
    if (!isPasswordCorrect) {
        attemptTrackerIP[ip].attempts += 1;
        attemptTrackerIP[ip].lastAttempt = currentTime;
        attemptTrackerIP[ip].emails.push(email);

        attemptTrackerEmail[email].attempts += 1;
        attemptTrackerEmail[email].lastAttempt = currentTime;
        attemptTrackerEmail[email].ips.push(ip);
    }

    // If the maximum number of attempts is exceeded for IP or email, log to MongoDB and block further attempts
    if (attemptTrackerIP[ip].attempts > MAX_ATTEMPTS_IP || attemptTrackerEmail[email].attempts > MAX_ATTEMPTS_EMAIL) {
        const agent = useragent.parse(req.headers['user-agent']);
        const geo = geoip.lookup(ip);

        // Save the attempt log to MongoDB
        await LoginAttempt.create({
            ip,
            email,
            userAgent: agent.toString(),
            geo,
            deviceType: req.device?.type,
            attemptsByIP: attemptTrackerIP[ip].attempts,
            attemptsByEmail: attemptTrackerEmail[email].attempts
        });

        return res.status(429).json({ message: 'Too many attempts. Please try again later.' });
    }

    // Continue to the next middleware or route handler
    next();
};

export { login_Track_Attempts };
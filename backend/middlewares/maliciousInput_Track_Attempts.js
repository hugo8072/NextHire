/**
 * Middleware to sanitize and validate incoming request body fields,
 * and to track and limit malicious input attempts by IP and email.
 *
 * - Decodes HTML entities in all request body fields (if string).
 * - Checks each field for potentially malicious patterns (XSS, JS injection, etc).
 * - If a malicious pattern is detected, sets flags on the request object for downstream tracking,
 *   and continues to the next middleware.
 * - The tracking middleware counts attempts per IP/email, resets counters after 15 minutes,
 *   and logs to MongoDB if limits are exceeded.
 * - If the maximum number of detected malicious attempts is exceeded for either IP or email,
 *   blocks further attempts with a 429 response.
 * - Continues to the next middleware if limits are not exceeded.
 *
 * Usage: Place both middlewares before your route handlers to protect against insecure user input.
 */

import sanitizeHtml from 'sanitize-html';
import he from 'he';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import useragent from 'useragent';
import geoip from 'geoip-lite';
import requestIp from 'request-ip';
import device from 'express-device';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the real client IP address, considering HTTP headers and proxy scenarios.
 * @param {Object} req - Express request object
 * @returns {string} - The real client IP address
 */
const getRealIP = (req) => {
    let ip;
    if (req.headers['x-forwarded-for']) {
        const forwardedIps = req.headers['x-forwarded-for'].split(',');
        ip = forwardedIps[0].trim();
    } else if (req.headers['x-real-ip']) {
        ip = req.headers['x-real-ip'];
    } else {
        ip = req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    }
    return ip;
};

/**
 * Get the MAC address of the server.
 * @returns {string} - The MAC address or an error message
 */
const getMACAddress = () => {
    try {
        const networkInterfaces = os.networkInterfaces();
        for (const interfaceName in networkInterfaces) {
            const networkInterface = networkInterfaces[interfaceName];
            for (const net of networkInterface) {
                if (net.mac && net.mac !== '00:00:00:00:00:00') {
                    return net.mac;
                }
            }
        }
        return 'MAC address not found';
    } catch (error) {
        console.error('Error getting MAC address:', error);
        return 'MAC address retrieval failed';
    }
};

/**
 * Express middleware to sanitize and validate request body fields.
 * If a malicious pattern is detected, sets flags for downstream tracking middleware.
 * Sanitizes all other fields using a whitelist of allowed HTML tags and attributes.
 */
const sanitizeInputs = (req, res, next) => {
    try {
        console.log('[sanitizeInputs] called with body:', req.body);

        // List of regex patterns to detect potentially malicious input
        const insecurePatterns = [
            /<script.*?>.*?<\/script>/gi,
            /&lt;script.*?&gt;.*?&lt;\/script&gt;/gi,
            /<.*?on\w+=.*?>/gi,
            /&lt;.*?on\w+=.*?&gt;/gi,
            /javascript:/gi,
            /<iframe.*?>.*?<\/iframe>/gi,
            /&lt;iframe.*?&gt;.*?&lt;\/iframe&gt;/gi,
            /<object.*?>.*?<\/object>/gi,
            /&lt;object.*?&gt;.*?&lt;\/object&gt;/gi,
            /<embed.*?>.*?<\/embed>/gi,
            /&lt;embed.*?&gt;.*?&lt;\/embed&gt;/gi,
            /<applet.*?>.*?<\/applet>/gi,
            /&lt;applet.*?&gt;.*?&lt;\/applet&gt;/gi,
            /<meta.*?>/gi,
            /&lt;meta.*?&gt;/gi,
            /<link.*?>/gi,
            /&lt;link.*?&gt;/gi,
            /<style.*?>.*?<\/style>/gi,
            /&lt;style.*?&gt;.*?&lt;\/style&gt;/gi,
            /expression\(/gi,
            /&lt;.*?expression\(.*?\).*?&gt;/gi,
            /url\(.*?javascript:.*?\)/gi,
            /url\(.*?data:.*?\)/gi,
            /<!--.*?-->/gi,
            /\/\*.*?\*\//gi,
            /eval\(.*?\)/gi,
            /setTimeout\(.*?\)/gi,
            /setInterval\(.*?\)/gi,
            /new\s+Function\(.*?\)/gi,
            /document\.write\(.*?\)/gi,
            /innerHTML\s*=\s*['"][^'"]*['"]/gi,
            /document\.cookie\s*=\s*['"][^'"]*['"]/gi,
            /location\.replace\(.*?\)/gi,
            /window\.location\s*=\s*['"][^'"]*['"]/gi,
            /<a\s+href=['"]javascript:.*?['"][^>]*>/gi,
            /<img\s+.*?onload\s*=\s*['"][^'"]*['"][^>]*>/gi,
            /<img\s+.*?onerror\s*=\s*['"][^'"]*['"][^>]*>/gi,
            /<a\s+.*?href\s*=\s*['"]\s*javascript:[^'"]*['"][^>]*>/gi,
            /<.*?javascript:.*?>/gi,
            /<iframe.*?src\s*=\s*['"][^'"]*javascript:.*?['"][^>]*>/gi,
            /<object.*?data\s*=\s*['"][^'"]*javascript:.*?['"][^>]*>/gi,
            /<embed.*?src\s*=\s*['"][^'"]*javascript:.*?['"][^>]*>/gi,
            /<meta\s+.*?http-equiv\s*=\s*['"]refresh['"][^>]*>/gi,
            /<\/?(div|span|form|input|textarea|button|select|option|label|input|a).*?>/gi
        ];

        // Helper function to decode HTML entities (only if value is string)
        const decodeHtmlEntities = (str) => {
            if (typeof str !== 'string') return str;
            return he.decode(str);
        };

        // Iterate over all fields in the request body
        for (const key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                let value = req.body[key];

                if (typeof value === 'string') {
                    value = decodeHtmlEntities(value);

                    for (let pattern of insecurePatterns) {
                        if (pattern.test(value)) {
                            console.log(`[sanitizeInputs] Malicious pattern detected in field "${key}":`, value);
                            req.maliciousInputDetected = true;
                            req.maliciousInputField = key;
                            req.maliciousInputValue = value;
                            break;
                        }
                    }

                    req.body[key] = sanitizeHtml(value, {
                        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'blockquote'],
                        allowedAttributes: {
                            '*': ['href', 'target'],
                            'a': ['href', 'target']
                        },
                        allowedSchemes: ['http', 'https', 'mailto'],
                        selfClosing: ['br', 'img']
                    });
                }
            }
        }

        if (req.maliciousInputDetected) {
            console.log('[sanitizeInputs] Malicious input detected, passing to tracking middleware.');
        }

        next();
    } catch (error) {
        console.error('Error in sanitizeInputs middleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// --- Tracking Middleware ---

// Define the schema and model for malicious input attempts
const maliciousInputAttemptSchema = new mongoose.Schema({
  ip: String,
  email: String,
  userAgent: String,
  geo: Object,
  deviceType: String,
  timestamp: { type: Date, default: Date.now },
  attemptsByIP: Number,
  attemptsByEmail: Number,
  inputField: String,
  maliciousValue: String
});
const MaliciousInputAttempt = mongoose.models.MaliciousInputAttempt || mongoose.model('MaliciousInputAttempt', maliciousInputAttemptSchema);

// Maximum allowed failed attempts per IP and per email
const MAX_ATTEMPTS_IP = 3;
const MAX_ATTEMPTS_EMAIL = 3;
// Time window to reset the attempt counters (15 minutes)
const ATTEMPT_RESET_TIME = 15 * 60 * 1000;

// In-memory trackers for attempts by IP and by email
const attemptTrackerIP = {};
const attemptTrackerEmail = {};

/**
 * Express middleware to track and limit malicious input attempts.
 * Blocks requests and logs to MongoDB if limits are exceeded.
 */
const maliciousInput_Track_Attempts = async (req, res, next) => {
    const ip = requestIp.getClientIp(req);
    const currentTime = Date.now();
    const email = req.body.email || 'unknown';

    // Logging current state before increment
    console.log(`[maliciousInput_Track_Attempts] IP: ${ip}, Email: ${email}`);
    console.log(`[maliciousInput_Track_Attempts] Current attempts for IP:`, attemptTrackerIP[ip]);
    console.log(`[maliciousInput_Track_Attempts] Current attempts for Email:`, attemptTrackerEmail[email]);

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

    // This middleware expects req.maliciousInputDetected, req.maliciousInputField, req.maliciousInputValue to be set by a previous sanitizer
    if (req.maliciousInputDetected) {
        attemptTrackerIP[ip].attempts += 1;
        attemptTrackerIP[ip].lastAttempt = currentTime;
        attemptTrackerIP[ip].emails.push(email);

        attemptTrackerEmail[email].attempts += 1;
        attemptTrackerEmail[email].lastAttempt = currentTime;
        attemptTrackerEmail[email].ips.push(ip);

        // Logging after increment
        console.log(`[maliciousInput_Track_Attempts] Updated attempts for IP:`, attemptTrackerIP[ip]);
        console.log(`[maliciousInput_Track_Attempts] Updated attempts for Email:`, attemptTrackerEmail[email]);

        if (attemptTrackerIP[ip].attempts > MAX_ATTEMPTS_IP || attemptTrackerEmail[email].attempts > MAX_ATTEMPTS_EMAIL) {
            console.log(`[maliciousInput_Track_Attempts] BLOCKED! IP: ${ip}, Email: ${email}`);
            // Save the attempt log to MongoDB
            await MaliciousInputAttempt.create({
                ip,
                email,
                userAgent: useragent.parse(req.headers['user-agent']).toString(),
                geo: geoip.lookup(ip),
                deviceType: req.device?.type,
                attemptsByIP: attemptTrackerIP[ip].attempts,
                attemptsByEmail: attemptTrackerEmail[email].attempts,
                inputField: req.maliciousInputField,
                maliciousValue: req.maliciousInputValue
            });

            return res.status(429).json({ message: 'Too many malicious input attempts. Please try again later.' });
        }
        // Block immediately on detection
        return res.status(400).json({ message: 'Insecure input detected!' });
    }

    // Continue to the next middleware or route handler
    next();
};

export { sanitizeInputs, maliciousInput_Track_Attempts };

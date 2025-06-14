// twoFA_Track_Attempts.js

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import useragent from 'useragent';
import geoip from 'geoip-lite';
import requestIp from 'request-ip';
import device from 'express-device';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_ATTEMPTS_EMAIL = 5;
const ATTEMPT_RESET_TIME = 15 * 60 * 1000; // 15 minutes

const attemptTrackerEmail = {};

const twoFA_Track_Attempts = async (req, res, next) => {
    const ip = requestIp.getClientIp(req);
    const currentTime = Date.now();
    const { email, verificationCode } = req.body;

    if (!attemptTrackerEmail[email]) {
        attemptTrackerEmail[email] = { attempts: 0, lastAttempt: currentTime, ips: [], codes: [] };
    }

    const { attempts, lastAttempt, ips, codes } = attemptTrackerEmail[email];

    if (currentTime - lastAttempt > ATTEMPT_RESET_TIME) {
        attemptTrackerEmail[email] = { attempts: 0, lastAttempt: currentTime, ips: [], codes: [] };
    }

    const user = await User.findOne({ email });
    const isCodeCorrect = user && user.verificationCode === verificationCode;

    if (!isCodeCorrect) {
        attemptTrackerEmail[email].attempts += 1;
        attemptTrackerEmail[email].lastAttempt = currentTime;
        attemptTrackerEmail[email].ips.push(ip);
        attemptTrackerEmail[email].codes.push(verificationCode);
    }

    if (attemptTrackerEmail[email].attempts > MAX_ATTEMPTS_EMAIL) {
        const securityDir = path.join(__dirname, 'security');

        if (!fs.existsSync(securityDir)) {
            fs.mkdirSync(securityDir);
        }

        const filePath = path.join(securityDir, `2AF_authentication_attempts_${email}.log`);
        const agent = useragent.parse(req.headers['user-agent']);
        const geo = geoip.lookup(ip);
        const systemInfo = `
            Time: ${new Date().toISOString()}
            IP Address: ${ip}
            Email: ${email}
            User Agent: ${agent.toString()}
            Hostname: ${os.hostname()}
            Platform: ${os.platform()}
            Architecture: ${os.arch()}
            CPU: ${JSON.stringify(os.cpus(), null, 2)}
            Memory: ${os.totalmem()} bytes
            Free Memory: ${os.freemem()} bytes
            Geo Location: ${geo ? JSON.stringify(geo) : 'N/A'}
            Device Type: ${req.device.type}
            Attempts: ${attemptTrackerEmail[email].attempts}
            IPs: ${attemptTrackerEmail[email].ips.join(', ')}
            Codes: ${attemptTrackerEmail[email].codes.join(', ')}
        `;

        fs.appendFileSync(filePath, systemInfo);
        return res.status(429).json({ message: 'Too many validation attempts. Please try again later.' });
    }

    next();
};

export { twoFA_Track_Attempts, attemptTrackerEmail };
export default twoFA_Track_Attempts;
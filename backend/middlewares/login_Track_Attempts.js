import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { verifyPassword } from '../utils/argon.js';
import useragent from 'useragent';
import geoip from 'geoip-lite';
import requestIp from 'request-ip';
import device from 'express-device';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_ATTEMPTS_IP = 10;
const MAX_ATTEMPTS_EMAIL = 5;
const ATTEMPT_RESET_TIME = 15 * 60 * 1000; // 15 minutes

const attemptTrackerIP = {};
const attemptTrackerEmail = {};

const login_Track_Attempts = async (req, res, next) => {
    const ip = requestIp.getClientIp(req);
    const currentTime = Date.now();
    const { email, password } = req.body;

    if (!attemptTrackerIP[ip]) {
        attemptTrackerIP[ip] = { attempts: 0, lastAttempt: currentTime, emails: [], passwords: [] };
    }

    if (!attemptTrackerEmail[email]) {
        attemptTrackerEmail[email] = { attempts: 0, lastAttempt: currentTime, ips: [], passwords: [] };
    }

    const { attempts: attemptsIP, lastAttempt: lastAttemptIP, emails: emailsIP, passwords: passwordsIP } = attemptTrackerIP[ip];
    const { attempts: attemptsEmail, lastAttempt: lastAttemptEmail, ips: ipsEmail, passwords: passwordsEmail } = attemptTrackerEmail[email];

    if (currentTime - lastAttemptIP > ATTEMPT_RESET_TIME) {
        attemptTrackerIP[ip] = { attempts: 0, lastAttempt: currentTime, emails: [], passwords: [] };
    }

    if (currentTime - lastAttemptEmail > ATTEMPT_RESET_TIME) {
        attemptTrackerEmail[email] = { attempts: 0, lastAttempt: currentTime, ips: [], passwords: [] };
    }

    const user = await User.findOne({ email });
    const isPasswordCorrect = user && await verifyPassword(user.password, password);

    if (!isPasswordCorrect) {
        attemptTrackerIP[ip].attempts += 1;
        attemptTrackerIP[ip].lastAttempt = currentTime;
        attemptTrackerIP[ip].emails.push(email);
        attemptTrackerIP[ip].passwords.push(password);

        attemptTrackerEmail[email].attempts += 1;
        attemptTrackerEmail[email].lastAttempt = currentTime;
        attemptTrackerEmail[email].ips.push(ip);
        attemptTrackerEmail[email].passwords.push(password);
    }

    if (attemptTrackerIP[ip].attempts > MAX_ATTEMPTS_IP || attemptTrackerEmail[email].attempts > MAX_ATTEMPTS_EMAIL) {
        const securityDir = path.join(__dirname, 'security');

        if (!fs.existsSync(securityDir)) {
            fs.mkdirSync(securityDir);
        }

        const filePath = path.join(securityDir, `login_attempts_${ip}_${email}.log`);
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
            Attempts by IP: ${attemptTrackerIP[ip].attempts}
            Attempts by Email: ${attemptTrackerEmail[email].attempts}
            Emails: ${attemptTrackerIP[ip].emails.join(', ')}
            Passwords: ${attemptTrackerIP[ip].passwords.join(', ')}
            IPs: ${attemptTrackerEmail[email].ips.join(', ')}
            Passwords: ${attemptTrackerEmail[email].passwords.join(', ')}
        `;

        fs.appendFileSync(filePath, systemInfo);
        return res.status(429).json({ message: 'Too many attempts. Please try again later.' });
    }

    next();
};

export default login_Track_Attempts;
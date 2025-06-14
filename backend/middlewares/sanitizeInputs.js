import sanitizeHtml from 'sanitize-html';
import he from 'he';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para pegar o IP real do cliente (considerando cabeçalhos HTTP)
const getRealIP = (req) => {
    let ip;

    // Tentando pegar o IP real do cliente a partir do cabeçalho 'X-Forwarded-For'
    if (req.headers['x-forwarded-for']) {
        // 'X-Forwarded-For' pode ter uma lista de IPs (se passar por múltiplos proxies)
        const forwardedIps = req.headers['x-forwarded-for'].split(',');
        ip = forwardedIps[0].trim();  // O primeiro IP é o IP real do cliente
    }
    // Verificando o cabeçalho 'X-Real-IP' caso o 'X-Forwarded-For' não exista
    else if (req.headers['x-real-ip']) {
        ip = req.headers['x-real-ip'];
    }
    // Se os cabeçalhos não existirem, pega diretamente o IP da conexão
    else {
        ip = req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    }

    return ip;
};

// Função para pegar o MAC Address
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

// Middleware de sanitização e verificação de inputs inseguros
const sanitizeInputs = (req, res, next) => {
    try {
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

        const decodeHtmlEntities = (str) => {
            return he.decode(str);
        };

        for (const key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                let value = req.body[key];
                console.log(`Original input: ${key} = ${value}`);

                value = decodeHtmlEntities(value);
                console.log(`Decoded input: ${key} = ${value}`);

                for (let pattern of insecurePatterns) {
                    if (pattern.test(value)) {
                        console.log(`Insecure pattern detected: ${pattern} in input: ${key} = ${value}`);

                        const securityDir = path.join(__dirname, 'security');
                        if (!fs.existsSync(securityDir)) {
                            fs.mkdirSync(securityDir);
                        }

                        const filePath = path.join(securityDir, `malicious_input_${Date.now()}.log`);
                        const realIP = getRealIP(req); // Obtendo o IP real do cliente
                        const macAddress = getMACAddress();
                        const systemInfo = `
                            Time: ${new Date().toISOString()}
                            IP Address: ${realIP}
                            MAC Address: ${macAddress}
                            User Agent: ${req.headers['user-agent']}
                            Hostname: ${os.hostname()}
                            Platform: ${os.platform()}
                            Architecture: ${os.arch()}
                            CPU: ${JSON.stringify(os.cpus(), null, 2)}
                            Memory: ${os.totalmem()} bytes
                            Free Memory: ${os.freemem()} bytes
                            Input Field: ${key}
                            Malicious Value: ${value}
                        `;

                        fs.writeFileSync(filePath, systemInfo);
                        return res.status(400).json({ message: 'Insecure input detected!' });
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

                console.log(`Sanitized input: ${key} = ${req.body[key]}`);
            }
        }

        next();
    } catch (error) {
        console.error('Error in sanitizeInputs middleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default sanitizeInputs;

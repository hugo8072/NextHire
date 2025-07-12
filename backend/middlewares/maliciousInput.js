import sanitizeHtml from 'sanitize-html';
import he from 'he';

/**
 * Express middleware to sanitize and validate request body fields.
 * If a malicious pattern is detected, returns 400 and blocks the request.
 * Sanitizes all other fields using a whitelist of allowed HTML tags and attributes.
 */
const maliciousInput = (req, res, next) => {
    try {
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
                }
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default maliciousInput;
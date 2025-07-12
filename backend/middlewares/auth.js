/**
 * Middleware for authenticating users using JWT tokens and authorizing profile access.
 * 
 * - `auth`: Verifies the JWT token from the Authorization header, finds the user in the database,
 *   and attaches the user and token to the request object. Responds with 401 if authentication fails.
 * 
 * - `authorizeProfileAccess`: Allows access if the authenticated user is the profile owner or has the 'master' role.
 *   Responds with 403 if access is denied.
 */

import jwt from 'jsonwebtoken'; // Import the jsonwebtoken library for handling JWTs
import User from '../models/User.js'; // Import the User model

/**
 * Middleware to authenticate the user using JWT.
 * Attaches the authenticated user and token to the request object.
 * Responds with 401 Unauthorized if authentication fails.
 */
const auth = async (req, res, next) => {
    try {
        // Get the Authorization header from the request
        const authorizationHeader = req.header('Authorization');
        if (!authorizationHeader) {
            console.error('Authorization header is missing');
            throw new Error('Authorization header is missing');
        }

        // Extract the token from the Authorization header
        const token = authorizationHeader.replace('Bearer ', '');

        // Verify the token and decode its payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Extract the user ID from the decoded token
        const userId = decoded.userId;

        // Find the user in the database by their ID
        const user = await User.findOne({ _id: userId });
        if (!user) {
            console.error(`Unable to login, invalid credentials: User not found with ID ${userId}`);
            throw new Error('Unable to login, invalid credentials');
        }

        // Attach the user and token to the request object
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).send({ error: error.message });
    }
};

/**
 * Middleware to authorize access to a user's profile.
 * Allows access if the authenticated user is the profile owner or has the 'master' role.
 * Responds with 403 Forbidden if access is denied.
 */
const authorizeProfileAccess = async (req, res, next) => {
    const { user } = req;
    const { userId } = req.params;

    const userIdStr = String(user._id);
    const paramIdStr = String(userId);
    const idsAreEqual = userIdStr === paramIdStr;

    try {
        if (user.role === 'master' || idsAreEqual) {
            return next();
        } else {
            console.error(`User ${user._id} is not authorized to access profile of user ${userId}`);
            return res.status(403).send({ error: 'Access denied.' });
        }
    } catch (err) {
        return res.status(500).send({ error: 'Internal Server Error' });
    }
};

export { auth, authorizeProfileAccess };
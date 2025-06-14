import jwt from 'jsonwebtoken'; // Import the jsonwebtoken library for handling JWTs
import User from '../models/User.js'; // Import the User model

// Middleware to authenticate the user
const auth = async (req, res, next) => {
    try {
        // Get the Authorization header from the request
        const authorizationHeader = req.header('Authorization');
        if (!authorizationHeader) {
            console.error('Authorization header is missing'); // Log an error if the header is missing
            throw new Error('Authorization header is missing'); // Throw an error if the header is missing
        }

        // Extract the token from the Authorization header
        const token = authorizationHeader.replace('Bearer ', '');
        console.log('Token:', token); // Log the token

        // Verify the token and decode its payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log('Decoded token:', decoded); // Log the decoded token

        // Extract the user ID from the decoded token
        const userId = decoded.userId;
        console.log('User ID from token:', userId); // Log the user ID

        // Find the user in the database by their ID
        const user = await User.findOne({ _id: userId });
        if (!user) {
            console.error(`Unable to login, invalid credentials: User not found with ID ${userId}`); // Log an error if the user is not found
            throw new Error('Unable to login, invalid credentials'); // Throw an error if the user is not found
        }

        console.log('Authenticated user:', user); // Log the authenticated user

        // Attach the user and token to the request object
        req.user = user;
        req.token = token;
        next(); // Call the next middleware
    } catch (error) {
        console.error('Authentication error:', error.message); // Log the authentication error
        res.status(401).send({ error: error.message }); // Send a 401 Unauthorized response
    }
};

// Middleware to authorize access to a user's profile
const authorizeProfileAccess = async (req, res, next) => {
    const { user } = req;
    const { userId } = req.params;
    console.log(user._id, userId, 'authorizeProfileAccess middleware called');

    const userIdStr = String(user._id);
    const paramIdStr = String(userId);
    const idsAreEqual = userIdStr === paramIdStr;
    //console.log('Comparação:', 'String(user._id):', userIdStr, 'String(userId):', paramIdStr, "equal:", idsAreEqual);
    //console.log('User role:', user.role);

    try {
        if ( user.role === 'master' || idsAreEqual ) {
            console.log("estou aqui 60");
            return next(); // <-- return aqui
        } else {
            console.log(`User ${user._id} is not authorized to access profile of user ${userId}`);
            return res.status(403).send({ error: 'Access denied.' }); // <-- return aqui
        }
    } catch (err) {
        return res.status(500).send({ error: 'Internal Server Error' }); // <-- return aqui
    }
};

console.log(authorizeProfileAccess)
export { auth, authorizeProfileAccess }; // Export the auth and authorizeProfileAccess middlewares
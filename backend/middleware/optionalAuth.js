// Optional authentication middleware - doesn't fail if no token
const jwt = require('jsonwebtoken');

const optionalAuthenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            } catch (error) {
                // Token invalid, but continue without auth
                req.user = null;
            }
        } else {
            req.user = null;
        }
        next();
    } catch (error) {
        // Continue without auth
        req.user = null;
        next();
    }
};

module.exports = { optionalAuthenticate };

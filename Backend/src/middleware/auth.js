import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        console.log('Auth middleware: Headers received:', req.headers);
        console.log('Auth middleware: Authorization header:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Auth middleware: No valid authorization header found');
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        console.log('Auth middleware: Token extracted:', token ? 'PRESENT' : 'MISSING');
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Auth middleware: Token decoded successfully:', { id: decoded.id, email: decoded.email });
        
        // Add user data to request
        req.user = decoded;
        console.log('Auth middleware: User data added to request:', req.user);
        
        next();
    } catch (error) {
        console.error('Auth middleware: Token verification failed:', error);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

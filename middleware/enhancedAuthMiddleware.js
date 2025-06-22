import jwt from 'jsonwebtoken';
import UserInfo from '../models/UserInfo.js';

export const protect = async (req, res, next) => {
  let token;

  // Log headers for debugging
  console.log('Authorization Header:', req.headers.authorization);

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found:', token ? 'Yes (length: ' + token.length + ')' : 'No');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      console.log('Token verified, decoded ID:', decoded.id);

      // Get user from the token
      const user = await UserInfo.findById(decoded.id).select('-password');
      console.log('User found in DB:', user ? 'Yes' : 'No');

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found with the provided token' 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed',
        error: error.message 
      });
    }
  } else {
    console.log('No Bearer token found in headers');
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};
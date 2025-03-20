import jwt from 'jsonwebtoken';
import { errorResMsg } from '../utils/lib/response.js';
import Admin from '../resources/user/models/admin.models.js';
import logger from '../utils/log/logger.js';

export const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResMsg(res, 401, 'Access denied. No token provided');
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return errorResMsg(res, 401, 'Access denied. Invalid token format');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if admin still exists and is active
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        return errorResMsg(res, 401, 'Invalid token. Admin not found');
      }
      
      if (admin.status !== 'active') {
        return errorResMsg(res, 403, 'Account is not active. Please contact super admin');
      }

      // Add admin info to request
      req.user = decoded;
      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      return errorResMsg(res, 401, 'Invalid token');
    }
  } catch (error) {
    logger.error('Admin auth middleware error:', error);
    return errorResMsg(res, 500, 'Internal server error');
  }
};

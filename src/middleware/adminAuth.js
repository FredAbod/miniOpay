import jwt from 'jsonwebtoken';
import { errorResMsg } from '../utils/lib/response.js';
import Admin from '../resources/user/models/admin.models.js';
import logger from '../utils/log/logger.js';

// export const adminAuth = async (req, res, next) => {
//   try {
//     // Get token from header
//     const authHeader = req.headers.authorization;
//     logger.info('Auth Header-------> ', authHeader);
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return errorResMsg(res, 401, 'Access denied. No token provided');
//     }

//     const token = authHeader.split(' ')[1];
//     if (!token) {
//       return errorResMsg(res, 401, 'Access denied. Invalid token format');
//     }

//     // Verify token
//     let decoded;
//     try { 
//       logger.error('This is the token -------> ', token);
//       // decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
// logger.info('Decoded token:', decoded);
//     } catch (error) {
//       if (error.name === 'TokenExpiredError') {
//         logger.error('Token expired:', error);
//         return errorResMsg(res, 401, 'Token expired. Please log in again');
//       }
//       logger.error('Token verification error:', error);
//       return errorResMsg(res, 401, 'Invalid token');
//     }

//     // Check if admin still exists and is active
//     const admin = await Admin.findById(decoded.id).select('-password');
//     if (!admin) {
//       logger.error('Admin not found for token:', decoded.id);
//       return errorResMsg(res, 401, 'Invalid token. Admin not found');
//     }

//     if (admin.status !== 'active') {
//       logger.error('Admin account not active:', decoded.id);
//       return errorResMsg(res, 403, 'Account is not active. Please contact super admin');
//     }

//     // Add admin info to request
//     req.user = decoded;
//     next();
//   } catch (error) {
//     logger.error('Admin auth middleware error:', error);
//     return errorResMsg(res, 500, 'Internal server error');
//   }
// };
export const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    logger.info('Auth Header-------> ', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResMsg(res, 401, 'Access denied. No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResMsg(res, 401, 'Access denied. Invalid token format');
    }

    // Verify token
    let decoded;
    try {
      logger.info('Verifying token:', token);
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.info('Decoded token:', decoded);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.error('Token expired:', error);
        return errorResMsg(res, 401, 'Token expired. Please log in again');
      }
      logger.error('Token verification error:', error);
      return errorResMsg(res, 401, 'Invalid token');
    }

    // Check if admin still exists and is active
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      logger.error('Admin not found for token:', decoded.id);
      return errorResMsg(res, 401, 'Invalid token. Admin not found');
    }

    if (admin.status !== 'active') {
      logger.error('Admin account not active:', decoded.id);
      return errorResMsg(res, 403, 'Account is not active. Please contact super admin');
    }

    // Add admin info to request
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Admin auth middleware error:', error);
    return errorResMsg(res, 500, 'Internal server error');
  }
};
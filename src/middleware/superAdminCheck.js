import { errorResMsg } from '../utils/lib/response.js';
import logger from '../utils/log/logger.js';

// export const superAdminCheck = (req, res, next) => {
//   try {
//     // Check if user is authenticated
//     if (!req.user) {
//       logger.error('Super admin check failed: No user found in request');
//       return errorResMsg(res, 401, 'Unauthorized. Please log in');
//     }

//     // Check if user has super-admin role
//     if (req.user.role !== 'super-admin') {
//       logger.error(`Super admin check failed: User role is ${req.user.role}`);
//       return errorResMsg(res, 403, 'Access denied. Super admin privileges required');
//     }

//     // User is a super-admin, proceed to the next middleware/controller
//     next();
//   } catch (error) {
//     logger.error('Super admin check middleware error:', error);
//     return errorResMsg(res, 500, 'Internal server error');
//   }
// };


export const superAdminCheck = (req, res, next) => {
  try {
    // Log the user object for debugging
    logger.info('User object:', req.user);

    // Check if user is authenticated
    if (!req.user) {
      logger.error('Super admin check failed: No user found in request');
      return errorResMsg(res, 401, 'Unauthorized. Please log in');
    }

    // Check if user has super-admin role
    if (req.user.role !== 'super-admin') {
      logger.error(`Super admin check failed: User role is ${req.user.role}`);
      return errorResMsg(res, 403, 'Access denied. Super admin privileges required');
    }

    // User is a super-admin, proceed to the next middleware/controller
    next();
  } catch (error) {
    logger.error('Super admin check middleware error:', error);
    return errorResMsg(res, 500, 'Internal server error');
  }
};
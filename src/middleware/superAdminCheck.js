import { errorResMsg } from '../utils/lib/response.js';
import logger from '../utils/log/logger.js';

export const superAdminCheck = (req, res, next) => {
  try {
    if (req.user?.role !== 'super-admin') {
      return errorResMsg(res, 403, 'Access denied. Super admin privileges required');
    }
    next();
  } catch (error) {
    logger.error('Super admin check middleware error:', error);
    return errorResMsg(res, 500, 'Internal server error');
  }
};
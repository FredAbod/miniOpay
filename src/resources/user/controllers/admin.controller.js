import { errorResMsg, successResMsg } from "../../../utils/lib/response.js";
import logger from "../../../utils/log/logger.js";
import Admin from "../models/admin.models.js";
import User from "../models/user.js";
import Transaction from "../models/transaction.model.js";
import mongoose from "mongoose";

// ========== ADMIN AUTHENTICATION ==========

/**
 * Register a new admin (super-admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createAdmin = async (req, res) => {
  try {
    // Check if requester is super-admin
    if (req.user?.role !== 'super-admin') {
      return errorResMsg(res, 403, "Only super admins can create new admins");
    }

    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phoneNumber, 
      role, 
      permissions 
    } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return errorResMsg(res, 400, "Required fields missing");
    }

    // Check if admin with this email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return errorResMsg(res, 409, "Admin with this email already exists");
    }

    // Create new admin
    const newAdmin = await Admin.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role: role || 'admin',
      permissions: permissions || undefined
    });

    // Remove password from response
    newAdmin.password = undefined;

    return successResMsg(res, 201, {
      message: "Admin created successfully",
      admin: newAdmin
    });
  } catch (error) {
    logger.error("Error creating admin:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

/**
 * Admin sign in
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const adminSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResMsg(res, 400, "Email and password are required");
    }

    // Find admin by email and include password for comparison
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return errorResMsg(res, 401, "Invalid email or password");
    }

    // Check if admin account is active
    if (admin.status !== 'active') {
      return errorResMsg(res, 403, "Account is not active. Please contact super admin");
    }

    // Compare passwords
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return errorResMsg(res, 401, "Invalid email or password");
    }

    // Generate JWT token
    const token = admin.generateAuthToken();

    // Update last login time
    admin.lastLogin = new Date();
    await admin.save();

    // Create admin response without sensitive information
    const adminResponse = {
      _id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      status: admin.status,
      lastLogin: admin.lastLogin
    };

    return successResMsg(res, 200, {
      message: "Admin signed in successfully",
      token,
      admin: adminResponse
    });
  } catch (error) {
    logger.error("Error during admin sign in:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

// ========== ADMIN PROFILE MANAGEMENT ==========

/**
 * Get admin profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      return errorResMsg(res, 404, "Admin not found");
    }

    return successResMsg(res, 200, {
      message: "Admin profile retrieved successfully",
      admin
    });
  } catch (error) {
    logger.error("Error getting admin profile:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

/**
 * Update admin profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { firstName, lastName, phoneNumber, profilePicture } = req.body;

    // Create update object with only provided fields
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (profilePicture) updates.profilePicture = profilePicture;

    // Update the admin profile
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedAdmin) {
      return errorResMsg(res, 404, "Admin not found");
    }

    return successResMsg(res, 200, {
      message: "Profile updated successfully",
      admin: updatedAdmin
    });
  } catch (error) {
    logger.error("Error updating admin profile:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

/**
 * Change admin password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return errorResMsg(res, 400, "Current password and new password are required");
    }

    if (newPassword.length < 6) {
      return errorResMsg(res, 400, "New password must be at least 6 characters long");
    }

    // Find admin with password
    const admin = await Admin.findById(adminId).select('+password');
    if (!admin) {
      return errorResMsg(res, 404, "Admin not found");
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return errorResMsg(res, 401, "Current password is incorrect");
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    return successResMsg(res, 200, {
      message: "Password changed successfully"
    });
  } catch (error) {
    logger.error("Error changing admin password:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

// ========== ADMIN MANAGEMENT (SUPER ADMIN ONLY) ==========

/**
 * Get all admins (super-admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllAdmins = async (req, res) => {
  try {
    // Check if requester is super-admin
    if (req.user?.role !== 'super-admin') {
      return errorResMsg(res, 403, "Only super admins can view all admins");
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const statusFilter = req.query.status ? { status: req.query.status } : {};
    const roleFilter = req.query.role ? { role: req.query.role } : {};

    // Count total admins for pagination
    const totalAdmins = await Admin.countDocuments({
      ...statusFilter,
      ...roleFilter
    });

    // Get paginated admins
    const admins = await Admin.find({
      ...statusFilter,
      ...roleFilter
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(totalAdmins / limit);

    return successResMsg(res, 200, {
      message: "Admins retrieved successfully",
      admins,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalAdmins,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    logger.error("Error getting all admins:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

/**
 * Get admin by ID (super-admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAdminById = async (req, res) => {
  try {
    // Check if requester is super-admin
    if (req.user?.role !== 'super-admin') {
      return errorResMsg(res, 403, "Only super admins can view admin details");
    }

    const { adminId } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return errorResMsg(res, 400, "Invalid admin ID format");
    }

    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      return errorResMsg(res, 404, "Admin not found");
    }

    return successResMsg(res, 200, {
      message: "Admin retrieved successfully",
      admin
    });
  } catch (error) {
    logger.error("Error getting admin by ID:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

/**
 * Update admin (super-admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateAdmin = async (req, res) => {
  try {
    // Check if requester is super-admin
    if (req.user?.role !== 'super-admin') {
      return errorResMsg(res, 403, "Only super admins can update admin details");
    }

    const { adminId } = req.params;
    const { 
      firstName, 
      lastName, 
      phoneNumber, 
      role, 
      permissions, 
      status 
    } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return errorResMsg(res, 400, "Invalid admin ID format");
    }

    // Create update object with only provided fields
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (role) updates.role = role;
    if (permissions) updates.permissions = permissions;
    if (status) updates.status = status;

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedAdmin) {
      return errorResMsg(res, 404, "Admin not found");
    }

    return successResMsg(res, 200, {
      message: "Admin updated successfully",
      admin: updatedAdmin
    });
  } catch (error) {
    logger.error("Error updating admin:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

/**
 * Delete admin (super-admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteAdmin = async (req, res) => {
  try {
    // Check if requester is super-admin
    if (req.user?.role !== 'super-admin') {
      return errorResMsg(res, 403, "Only super admins can delete admins");
    }

    const { adminId } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return errorResMsg(res, 400, "Invalid admin ID format");
    }

    // Prevent self-deletion
    if (adminId === req.user.id) {
      return errorResMsg(res, 400, "You cannot delete your own account");
    }

    const deletedAdmin = await Admin.findByIdAndDelete(adminId);
    if (!deletedAdmin) {
      return errorResMsg(res, 404, "Admin not found");
    }

    return successResMsg(res, 200, {
      message: "Admin deleted successfully"
    });
  } catch (error) {
    logger.error("Error deleting admin:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

// ========== USER MANAGEMENT ==========

/**
 * Get all users with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering options
    const filter = {};
    
    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: 'i' };
    }
    
    if (req.query.userName) {
      filter.userName = { $regex: req.query.userName, $options: 'i' };
    }

    // Count total users for pagination
    const totalUsers = await User.countDocuments(filter);

    // Get paginated users
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);

    return successResMsg(res, 200, {
      message: "Users retrieved successfully",
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalUsers,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    logger.error("Error getting all users:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return errorResMsg(res, 400, "Invalid user ID format");
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    return successResMsg(res, 200, {
      message: "User retrieved successfully",
      user
    });
  } catch (error) {
    logger.error("Error getting user by ID:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      firstName, 
      lastName, 
      phoneNumber,
      accountBalance,
      status
    } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return errorResMsg(res, 400, "Invalid user ID format");
    }

    // Create update object with only provided fields
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phoneNumber) {
      updates.phoneNumber = phoneNumber;
      // Update account number if phone number changes
      const accountNumber = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
      updates.accountNumber = accountNumber;
    }
    
    // Only super-admin can update account balance or status
    if (req.user?.role === 'super-admin') {
      if (accountBalance !== undefined) updates.accountBalance = accountBalance;
      if (status) updates.status = status;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return errorResMsg(res, 404, "User not found");
    }

    return successResMsg(res, 200, {
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    logger.error("Error updating user:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

/**
 * Delete user (super-admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteUser = async (req, res) => {
  try {
    // Check if requester is super-admin
    if (req.user?.role !== 'super-admin') {
      return errorResMsg(res, 403, "Only super admins can delete users");
    }

    const { userId } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return errorResMsg(res, 400, "Invalid user ID format");
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return errorResMsg(res, 404, "User not found");
    }

    return successResMsg(res, 200, {
      message: "User deleted successfully"
    });
  } catch (error) {
    logger.error("Error deleting user:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

// ========== TRANSACTION MANAGEMENT ==========

/**
 * Get all transactions with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllTransactions = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    
    if (req.query.transactionType) {
      filter.transactionType = req.query.transactionType;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Date range filtering
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Count total transactions for pagination
    const totalTransactions = await Transaction.countDocuments(filter);

    // Get paginated transactions
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'firstName lastName email userName')
      .populate('receiver', 'firstName lastName email userName');

    // Calculate total pages
    const totalPages = Math.ceil(totalTransactions / limit);

    return successResMsg(res, 200, {
      message: "Transactions retrieved successfully",
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalTransactions,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    logger.error("Error getting all transactions:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

/**
 * Get transaction by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return errorResMsg(res, 400, "Invalid transaction ID format");
    }

    const transaction = await Transaction.findById(transactionId)
      .populate('sender', 'firstName lastName email userName')
      .populate('receiver', 'firstName lastName email userName');
    
    if (!transaction) {
      return errorResMsg(res, 404, "Transaction not found");
    }

    return successResMsg(res, 200, {
      message: "Transaction retrieved successfully",
      transaction
    });
  } catch (error) {
    logger.error("Error getting transaction by ID:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

/**
 * Update transaction status (super-admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateTransactionStatus = async (req, res) => {
  try {
    // Check if requester is super-admin
    if (req.user?.role !== 'super-admin') {
      return errorResMsg(res, 403, "Only super admins can update transaction status");
    }

    const { transactionId } = req.params;
    const { status } = req.body;

    // Validate input
    if (!status || !['pending', 'successful', 'failed'].includes(status)) {
      return errorResMsg(res, 400, "Invalid status. Status must be 'pending', 'successful', or 'failed'");
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return errorResMsg(res, 400, "Invalid transaction ID format");
    }

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status },
      { new: true }
    )
      .populate('sender', 'firstName lastName email userName')
      .populate('receiver', 'firstName lastName email userName');
    
    if (!transaction) {
      return errorResMsg(res, 404, "Transaction not found");
    }

    return successResMsg(res, 200, {
      message: "Transaction status updated successfully",
      transaction
    });
  } catch (error) {
    logger.error("Error updating transaction status:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

// ========== DASHBOARD STATISTICS ==========

/**
 * Get dashboard statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get new users in the last 7 days
    const lastWeekUsersCount = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Get total transactions count
    const totalTransactions = await Transaction.countDocuments();
    
    // Get transactions in the last 7 days
    const lastWeekTransactionsCount = await Transaction.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Calculate total transaction volume
    const transactionAggregation = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" }
        }
      }
    ]);
    
    const totalTransactionVolume = transactionAggregation.length > 0 
      ? transactionAggregation[0].totalVolume 
      : 0;

    // Calculate transaction volume by type
    const transactionsByType = await Transaction.aggregate([
      {
        $group: {
          _id: "$transactionType",
          count: { $sum: 1 },
          volume: { $sum: "$amount" }
        }
      }
    ]);

    // Get transactions by status
    const transactionsByStatus = await Transaction.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format transaction types and status for easier consumption
    const formattedTransactionsByType = {};
    transactionsByType.forEach(item => {
      formattedTransactionsByType[item._id] = {
        count: item.count,
        volume: item.volume
      };
    });
    
    const formattedTransactionsByStatus = {};
    transactionsByStatus.forEach(item => {
      formattedTransactionsByStatus[item._id] = item.count;
    });

    return successResMsg(res, 200, {
      message: "Dashboard statistics retrieved successfully",
      stats: {
        users: {
          total: totalUsers,
          lastWeek: lastWeekUsersCount
        },
        transactions: {
          total: totalTransactions,
          lastWeek: lastWeekTransactionsCount,
          totalVolume: totalTransactionVolume,
          byType: formattedTransactionsByType,
          byStatus: formattedTransactionsByStatus
        }
      }
    });
  } catch (error) {
    logger.error("Error getting dashboard statistics:", error);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

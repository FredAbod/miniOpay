import express from "express";
import {
  // Admin authentication
  adminSignIn,
  createAdmin,
  
  // Admin profile management
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  
  // Admin management (super-admin only)
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  
  // User management
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  
  // Transaction management
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  
  // Dashboard statistics
  getDashboardStats
} from "../controllers/admin.controller.js";

import { adminAuth } from "../../../middleware/adminAuth.js";
import { superAdminCheck } from "../../../middleware/superAdminCheck.js";

const router = express.Router();

// Admin Authentication
router.post("/signin", adminSignIn);
router.post("/create",  createAdmin);

// adminAuth, superAdminCheck,

// Admin Profile Management
router.get("/profile", adminAuth, getAdminProfile);
router.put("/profile", adminAuth, updateAdminProfile);
router.put("/change-password", adminAuth, changeAdminPassword);

// Admin Management (super-admin only)
router.get("/", adminAuth, superAdminCheck, getAllAdmins);
router.get("/:adminId", adminAuth, superAdminCheck, getAdminById);
router.put("/:adminId", adminAuth, superAdminCheck, updateAdmin);
router.delete("/:adminId", adminAuth, superAdminCheck, deleteAdmin);

// User Management
router.get("/users", adminAuth, getAllUsers);
router.get("/users/:userId", adminAuth, getUserById);
router.put("/users/:userId", adminAuth, updateUser);
router.delete("/users/:userId", adminAuth, superAdminCheck, deleteUser);

// Transaction Management
router.get("/transactions", adminAuth, getAllTransactions);
router.get("/transactions/:transactionId", adminAuth, getTransactionById);
router.put("/transactions/:transactionId/status", adminAuth, superAdminCheck, updateTransactionStatus);

// Dashboard
router.get("/dashboard/stats", adminAuth, getDashboardStats);

export default router;

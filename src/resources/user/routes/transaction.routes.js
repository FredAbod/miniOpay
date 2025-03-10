import express from "express";
import { deposit, transfer, withdraw, getUserTransactions } from "../controllers/transaction.controller.js";
import { flutterwaveWebhook } from "../controllers/flutterwaveTransaction.js";
// import { auth } from "../../../middleware/auth.js";

const router = express.Router();

// Protected transaction routes
router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.post("/transfer", transfer);

// Get user transactions
router.get("/user/:userId", getUserTransactions);

// Flutterwave webhook route (no auth needed as it's called by Flutterwave)
router.post("/flutterwave-webhook", flutterwaveWebhook);

export default router;

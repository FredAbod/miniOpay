import express from "express";
import { deposit, transfer, withdraw } from "../controllers/transaction.controller.js";
import { flutterwaveDeposit } from "../controllers/flutterwaveTransaction.js";
import { auth } from "../../../middleware/auth.js";

const router = express.Router();

// Protected transaction routes
router.post("/deposit", auth, deposit);
router.post("/withdraw", auth, withdraw);
router.post("/transfer", auth, transfer);

// Flutterwave webhook route (no auth needed as it's called by Flutterwave)
router.post("/flutterwave-webhook", flutterwaveDeposit);

export default router;

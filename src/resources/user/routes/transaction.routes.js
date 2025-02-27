// write user routes logic here
import express from "express";
import { deposit, transfer, withdraw } from "../controllers/transaction.Controller.js";
const router = express.Router();

router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.post("/transfer", transfer);

export default router;

// write user routes logic here
import express from "express";
import { addPhoneNumber, addUserName, signIn, signUp } from "../controllers/user.controller.js";
const router = express.Router();

router.post("/signup", signUp);
router.post("/signIn", signIn);
router.put("/add/:_id", addPhoneNumber);
router.put("/addUsername/:_id", addUserName);

export default router;

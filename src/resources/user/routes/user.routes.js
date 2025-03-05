import express from "express";
import { 
    signUp, 
    signIn, 
    addPhoneNumber, 
    addUserName,
    getProfile,
    updateProfile
} from "../controllers/user.controller.js";
// import { auth } from "../../../middleware/auth.js";

const router = express.Router();

// Authentication routes
router.post("/signup", signUp);
router.post("/signin", signIn);

// Routes requiring authentication
router.put("/phone/:_id", addPhoneNumber);
router.put("/username/:_id", addUserName);
router.get("/profile/:id", getProfile);
router.put("/profile/:id", updateProfile);

export default router;

import { errorResMsg, successResMsg } from "../../../utils/lib/response.js";
import logger from "../../../utils/log/logger.js";
import User from "../models/user.js";


export const signUp = async (req, res, next) => {
    const {email, password} = req.body;
    try {
        if (!email || !password) {
            return errorResMsg(res, 400, "Email and password are required");
        }
        const newUser = (await User.create(req.body));
        return successResMsg(res, 201, {
            message: "User created successfully",
            user: newUser
        });
    } catch (e) {
        logger.error(e);
        return errorResMsg(res, 500, "Internal Server Error");
    }
}

export const signIn = async (req, res, next) => {
    const {email, password} = req.body;
    try {
        if (!email || !password) {
            return errorResMsg(res, 400, "Email and password are required");
        }
        const user = await User.findOne({email}).select('+password');
        if (!user) {
            return errorResMsg(res, 401, "Invalid email or password");
        }
        
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return errorResMsg(res, 401, "Invalid email or password");
        }

        const token = user.generateAuthToken();
        return successResMsg(res, 200, {
            message: "User signed in successfully",
            token
        });
    } catch (e) {
        logger.error(e);
        return errorResMsg(res, 500, "Internal Server Error");
    }
}

// Add Phone Number to User And Generate Accoint Number
export const addPhoneNumber = async (req, res, next) => {
    const { phoneNumber } = req.body;
    try {
        if (!phoneNumber) {
            return errorResMsg(res, 400, "Phone number is required");
        }
        // Remove the first '0' from phone number to create account number
        const accountNumber = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
        
        const user = await User.findByIdAndUpdate(
            req.params._id, 
            { phoneNumber, accountNumber },
            { new: true }
        );

        if (!user) {
            return errorResMsg(res, 404, "User not found");
        }

        return successResMsg(res, 200, {
            message: "Phone number and account number added successfully",
            user
        });
    } catch (e) {
        logger.error(e);
        return errorResMsg(res, 500, "Internal Server Error");
    }
}

// Add UserName
export const addUserName = async (req, res, next) => {
    const { userName } = req.body;
    try {
        if (!userName) {
            return errorResMsg(res, 400, "User name is required");
        }
        
        const user = await User.findByIdAndUpdate(
            req.params._id, 
            { userName },
            { new: true }
        );

        if (!user) {
            return errorResMsg(res, 404, "User not found");
        }

        return successResMsg(res, 200, {
            message: "User name added successfully",
            user
        });
    } catch (e) {
        logger.error(e);
        return errorResMsg(res, 500, "Internal Server Error");
    }
}
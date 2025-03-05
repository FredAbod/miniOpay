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
        const existingUserName = await User.findOne({userName: userName})
        if (existingUserName) {
            return errorResMsg(res, 409, "User name already exists");
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

/**
 * Get user profile details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProfile = async (req, res) => {
    try {
        // Get user ID from authenticated user (set by auth middleware)
        const userId = req.params.id;
        
        // Find the user and exclude sensitive fields
        const user = await User.findById(userId).select('-password -__v');
        
        if (!user) {
            return errorResMsg(res, 404, "User not found");
        }
        
        // Return user profile
        return successResMsg(res, 200, {
            message: "Profile retrieved successfully",
            user
        });
    } catch (e) {
        logger.error(e);
        return errorResMsg(res, 500, "Internal Server Error");
    }
};

/**
 * Update user profile details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { 
            firstName, 
            lastName, 
            email, 
            phoneNumber,
            address,
            dateOfBirth,
            profilePicture
        } = req.body;
        
        // Create an updates object with only the fields that were provided
        const updates = {};
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (email) updates.email = email;
        if (phoneNumber) {
            updates.phoneNumber = phoneNumber;
            // Update account number if phone number is being updated
            const accountNumber = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
            updates.accountNumber = accountNumber;
        }
        if (address) updates.address = address;
        if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
        if (profilePicture) updates.profilePicture = profilePicture;
        
        // Check if email already exists for another user
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return errorResMsg(res, 409, "Email already in use by another account");
            }
        }
        
        // Check if phone number already exists for another user
        if (phoneNumber) {
            const existingPhone = await User.findOne({ phoneNumber, _id: { $ne: userId } });
            if (existingPhone) {
                return errorResMsg(res, 409, "Phone number already in use by another account");
            }
        }
        
        // Update the user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password -__v');
        
        if (!updatedUser) {
            return errorResMsg(res, 404, "User not found");
        }
        
        return successResMsg(res, 200, {
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (e) {
        logger.error(e);
        return errorResMsg(res, 500, "Internal Server Error");
    }
};
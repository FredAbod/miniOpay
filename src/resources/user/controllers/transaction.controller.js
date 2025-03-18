import mongoose from "mongoose";
import { errorResMsg, successResMsg } from "../../../utils/lib/response.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.js";
import logger from "../../../utils/log/logger.js";
import { sendEmail } from "../../../config/email.js"

export const deposit = async (req, res) => {
  const session = await mongoose.startSession(); // Start a new session with mongoose
  session.startTransaction(); // Start a new transaction
  try {
    const { userName, amount, description } = req.body; // Destructure the request body to get userName, amount, and description
    if (!userName || !amount || !description) {
      return errorResMsg(res, 400, "All fields are required"); // Return an error if any field is missing
    }
    const user = await User.findOneAndUpdate(
      { userName }, // Find the user by userName
      { $inc: { accountBalance: amount } }, // Increment the user's account balance by the amount
      { session, new: true } // Use the current session and return the updated document
    );

    if (!user) {
      return errorResMsg(res, 404, "User not found"); // Return an error if the user is not found
    }

    const userAccountBalance = parseFloat(user.accountBalance.toString()); // Parse the user's account balance to a float
    const amountNum = parseFloat(amount);

    // Modify to pass an array as first argument to Transaction.create()
    const transactions = await Transaction.create(
      [
        {
          sender: user._id, // Set the sender to the user's ID
          transactionType: "deposit", // Set the transaction type to 'deposit'
          amount, // Set the amount
          description, // Set the description
          balanceBefore: userAccountBalance - amountNum, // Set the balance before the deposit
          balanceAfter: userAccountBalance, // Set the balance after the deposit
          status: "successful", // Set the status
        },
      ],
      { session }
    ); // Use the current session

    await session.commitTransaction(); // Commit the transaction
    session.endSession(); // End the session

    const email = user.email;


    await sendEmail(email, userName, "Deposit", amount, userAccountBalance, description);

    return successResMsg(res, 201, {
      message: "Deposit successful", // Return a success message
      transaction: transactions[0], // Return the first (and only) transaction from the array
    });
  } catch (e) {
    logger.error(e); // Log the error
    await session.abortTransaction(); // Abort the transaction
    session.endSession(); // End the session
    return errorResMsg(res, 500, "Internal Server Error"); // Return an internal server error
  }
};

// Withdrawal

export const withdraw = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userName, amount, description } = req.body;

    if (!userName || !amount || !description) {
      return errorResMsg(res, 400, "All fields are required");
    }

    if (amount < 1000) {
      return errorResMsg(res, 400, "Minimum withdrawal amount is 1000");
    }

    // Fetch user first without modifying balance
    const user = await User.findOne({ userName }).session(session);

    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    const email = user.email;

    const currentBalance = parseFloat(user.accountBalance); // Ensure number format
    const amountNum = parseFloat(amount);

    console.log("DEBUG: Current Balance Before Withdrawal:", currentBalance);
    console.log("DEBUG: Withdrawal Amount:", amountNum);

    if (currentBalance < amountNum) {  // Correct balance check
      return errorResMsg(res, 400, "Insufficient funds");
    }

    // Now deduct the balance
    const updatedUser = await User.findOneAndUpdate(
      { userName },
      { $inc: { accountBalance: -amountNum } },
      { session, returnDocument: "after" } // Ensures latest balance is fetched
    );

    console.log("DEBUG: Updated Balance After Withdrawal:", updatedUser.accountBalance);

    // Modify transaction logging
    const transactions = await Transaction.create(
      [
        {
          sender: updatedUser._id,
          transactionType: "withdrawal",
          amount: amountNum,
          description,
          balanceBefore: currentBalance,  //  Correct balance before withdrawal
          balanceAfter: updatedUser.accountBalance, //  Updated balance after withdrawal
          status: "successful",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    await sendEmail(email, userName, "Withdrawal", amount, updatedUser.accountBalance, description); 

    return successResMsg(res, 201, {
      message: "Withdrawal successful",
      transaction: transactions[0],
    });
  } catch (e) {
    logger.error(e);
    await session.abortTransaction();
    session.endSession();
    return errorResMsg(res, 500, "Internal Server Error");
  }
};


// Transfer

export const transfer = async (req, res) => {
  const session = await mongoose.startSession(); // Start a new session

  try {
    await session.withTransaction(async () => {
      const { senderUserName, receiverUserName, amount, description } = req.body;
      if (!senderUserName || !receiverUserName || !amount || !description) {
        await session.abortTransaction();
        return errorResMsg(res, 400, "All fields are required");
      }

      const sender = await User.findOne({ userName: senderUserName }).session(session);
      if (!sender) {
        await session.abortTransaction();
        return errorResMsg(res, 404, "Sender not found");
      }

      const receiver = await User.findOne({ userName: receiverUserName }).session(session);
      if (!receiver) {
        await session.abortTransaction();
        return errorResMsg(res, 404, "Receiver not found");
      }

      // Ensure account balance is treated as a number
    const senderBalance = parseFloat(sender.accountBalance); 
    const amountNum = parseFloat(amount); 

    if (senderBalance < amountNum) {
      await session.abortTransaction();
      return errorResMsg(res, 400, "Insufficient funds");
    }

    // Update sender's balance and ensure we get the updated value
    const senderUpdated = await User.findOneAndUpdate(
      { userName: senderUserName },
      { $inc: { accountBalance: -amountNum } },
      { session, returnDocument: "after" } // Ensure we get the updated balance
    );

    if (senderUpdated.accountBalance < 0) {
      await session.abortTransaction();
      return errorResMsg(res, 400, "Insufficient funds");
    }

      // Update receiver's balance
      await User.updateOne(
        { userName: receiverUserName },
        { $inc: { accountBalance: amount } },
        { session }
      );

      // Create transaction record
      const transaction = await Transaction.create(
        [
          {
            sender: sender._id,
            receiver: receiver._id,
            transactionType: "transfer",
            amount,
            description,
            balanceBefore: sender.accountBalance,
            balanceAfter: sender.accountBalance - amount,
            status: "successful",
          },
        ],
        { session }
      );

      const email = sender.email;
      const receiverEmail = receiver.email;


      await sendEmail(email, sender.userName, "Transfer", amount, sender.accountBalance - amount, description);
      await sendEmail(receiverEmail, receiver.userName, "Transfer Received", + amount, receiver.accountBalance, description);

    

      return successResMsg(res, 201, {
        message: "Transfer successful",
        transaction: transaction[0],
      });
    });

    session.endSession(); // Close session after transaction completes
  } catch (e) {
    logger.error(e);
    await session.abortTransaction();
    session.endSession();
    return errorResMsg(res, 500, "Internal Server Error");
  }
};


/**
 * Get all transactions for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return errorResMsg(res, 400, "Invalid user ID format");
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter by transaction type if provided
    const typeFilter = req.query.type ? { transactionType: req.query.type } : {};
    
    // Count total transactions for pagination
    const totalTransactions = await Transaction.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      ...typeFilter
    });
    
    // Find transactions where user is either sender or receiver
    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
      ...typeFilter
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'firstName lastName email userName')
      .populate('receiver', 'firstName lastName email userName');
    
    // If no transactions found
    if (transactions.length === 0) {
      return successResMsg(res, 200, {
        message: "No transactions found for this user",
        transactions: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit
        }
      });
    }
    
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
  } catch (e) {
    logger.error(e);
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

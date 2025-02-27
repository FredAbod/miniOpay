import mongoose from "mongoose";
import { errorResMsg, successResMsg } from "../../../utils/lib/response.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.js";
import logger from "../../../utils/log/logger.js";

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
  const session = await mongoose.startSession(); // Start a new session with mongoose
  session.startTransaction(); // Start a new transaction
  try {
    const { userName, amount, description } = req.body; // Destructure the request body to get userName, amount, and description
    if (!userName || !amount || !description) {
      return errorResMsg(res, 400, "All fields are required"); // Return an error if any field is missing
    }

    if (amount < 1000) {
      return errorResMsg(res, 400, "Minimum withdrawal amount is 1000"); // Return an error if the withdrawal amount is less than 1000
    }

    const user = await User.findOneAndUpdate(
      { userName }, // Find the user by userName
      { $inc: { accountBalance: -amount } }, // Decrement the user's account balance by the amount
      { session, new: true } // Use the current session and return the updated document
    );

    if (user.accountBalance < amount) {
      return errorResMsg(res, 400, "Insufficient funds"); // Return an error if the user does not have enough funds
    }

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
          transactionType: "withdrawal", // Set the transaction type to 'withdrawal'
          amount, // Set the amount
          description, // Set the description
          balanceBefore: userAccountBalance + amountNum, // Set the balance before the withdrawal
          balanceAfter: userAccountBalance, // Set the balance after the withdrawal
          status: "successful", // Set the status
        },
      ],
      { session }
    ); // Use the current session

    await session.commitTransaction(); // Commit the transaction
    session.endSession(); // End the session

    return successResMsg(res, 201, {
      message: "Withdrawal successful", // Return a success message
      transaction: transactions[0], // Return the first (and only) transaction from the array
    });
  } catch (e) {
    logger.error(e); // Log the error
    await session.abortTransaction(); // Abort the transaction
    session.endSession(); // End the session
    return errorResMsg(res, 500, "Internal Server Error"); // Return an internal server error
  }
};

// Transfer

export const transfer = async (req, res) => {
  const session = await mongoose.startSession(); // Start a new session with mongoose
  session.startTransaction(); // Start a new transaction
  try {
    const { senderUserName, receiverUserName, amount, description } = req.body; // Destructure the request body to get senderUserName, receiverUserName, amount, and description
    if (!senderUserName || !receiverUserName || !amount || !description) {
      return errorResMsg(res, 400, "All fields are required"); // Return an error if any field is missing
    }
    
    const sender = await User.findOne({ userName: senderUserName });
    if (!sender) {
      return errorResMsg(res, 404, "Sender not found"); // Return an error if the sender is not found
    }
    
    const receiver = await User.findOne({ userName: receiverUserName });
    if (!receiver) {
      return errorResMsg(res, 404, "Receiver not found"); // Return an error if the receiver is not found
    }

    const senderTrx = await User.findOneAndUpdate(
      {     
        userName: senderUserName,
      },
      {
        $inc: { accountBalance: -amount },
      },
      { session, new: true }
    );

    if (senderTrx.accountBalance < amount) {
      return errorResMsg(res, 400, "Insufficient funds"); // Return an error if the sender does not have enough funds
    }
    const receiverTrx = await User.findOneAndUpdate(
          {
            userName: receiverUserName,
          },
          {
            $inc: { accountBalance: amount },
          },
          { session, new: true }
        );


    const senderAccountBalance = parseFloat(senderTrx.accountBalance.toString()); // Parse the sender's account balance to a float
      const receiverAccountBalance = parseFloat(receiverTrx.accountBalance.toString()); // Parse the receiver's account balance to a float
      const amountNum = parseFloat(amount);

      // Modify to pass an array as first argument to Transaction.create()
      const transactions = await Transaction.create(
        [
          {
            sender: senderTrx._id, // Set the sender to the sender's ID
            receiver: receiverTrx._id, // Set the receiver to the receiver's ID
            transactionType: "transfer", // Set the transaction type to 'transfer'
            amount, // Set the amount
            description, // Set the description
            balanceBefore: senderAccountBalance + amountNum, // Set the balance before the transfer
            balanceAfter: senderAccountBalance, // Set the balance after the transfer
            status: "successful", // Set the status
          },
        ],
        { session }
      ); // Use the current session
      
    await session.commitTransaction(); // Commit the transaction
    session.endSession(); // End the session
    
    return successResMsg(res, 201, {
      message: "Transfer successful", // Return a success message
      transaction: transactions[0], // Return the first (and only) transaction from the array
    });
  } catch (e) {
    logger.error(e); // Log the error
    await session.abortTransaction(); // Abort the transaction
    session.endSession(); // End the session
    return errorResMsg(res, 500, "Internal Server Error"); // Return an internal server error
  }
};

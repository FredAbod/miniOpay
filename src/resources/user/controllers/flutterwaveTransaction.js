import mongoose from "mongoose";
import { errorResMsg, successResMsg } from "../../../utils/lib/response.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.js";
import logger from "../../../utils/log/logger.js";
import dotenv from 'dotenv';
dotenv.config();

export const flutterwaveWebhook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    logger.info("Flutterwave webhook triggered");

    // Validate webhook signature
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verif-hash"];

    if (!signature || signature !== secretHash) {
      logger.error("Invalid signature: Signature doesn't match the secret hash");
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ message: "Unauthorized: Invalid signature" });
    }

    const event = req.body.event;
    const { data } = req.body;

    if (!event) {
      logger.error("Event is undefined in webhook payload");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Bad request: Event is undefined" });
    }

    if (event === "charge.completed") {
      const email = data.customer?.email;
      const { tx_ref: txRef, amount, status } = data;

      if (!email || !txRef || !amount) {
        logger.error("Missing essential payment details");
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Bad request: Missing payment details" });
      }
      
      // Check for duplicate transaction
      const existingTransaction = await Transaction.findOne({ payment_reference: txRef });
      if (existingTransaction) {
        logger.info("Transaction already processed:", txRef);
        await session.abortTransaction();
        session.endSession();
        return res.status(200).json({ message: "Transaction already processed" });
      }

      // Find and update user's balance
      const user = await User.findOne({ email });
      if (!user) {
        logger.error(`User not found with email: ${email}`);
        await session.abortTransaction();
        session.endSession();
        return errorResMsg(res, 404, "User not found");
      }

      const userAccountBalance = parseFloat(user.accountBalance.toString());
      const amountNum = parseFloat(amount);

      let transactionType;
      let balanceBefore;
      let balanceAfter;

      // Determine if it's a deposit or withdrawal
      if (amount > 0) {
        transactionType = "deposit";
        balanceBefore = userAccountBalance - amountNum;
        balanceAfter = userAccountBalance + amountNum;
        user.accountBalance += amountNum;
      } else {
        transactionType = "withdrawal";
        balanceBefore = userAccountBalance + amountNum;
        balanceAfter = userAccountBalance - amountNum;
        user.accountBalance -= amountNum;
      }

      // Update user's balance
      await user.save({ session });

      // Create transaction record
      const transactions = await Transaction.create(
        [{
          sender: user._id,
          transactionType,
          amount: amountNum,
          description: `Flutterwave ${transactionType}: ${data.narration || 'Online payment'}`,
          balanceBefore,
          balanceAfter,
          status: "successful",
          payment_reference: txRef,
          flw_reference: data.flw_ref,
          transaction_details: JSON.stringify(data)
        }],
        { session }
      );

      // Commit the transaction and return success response
      await session.commitTransaction();
      session.endSession();

      return successResMsg(res, 201, {
        message: `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} successful`,
        transaction: transactions[0]
      });
    } else {
      logger.info(`Unhandled event type: ${event}`);
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({ message: "Unhandled event type" });
    }
  } catch (e) {
    logger.error(e);
    await session.abortTransaction();
    session.endSession();
    return errorResMsg(res, 500, "Internal Server Error");
  }
};

// export const flutterwaveDeposit = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
  
//   try {
//     logger.info("Flutterwave webhook triggered");

//     // Validate webhook signature
//     const secretHash = process.env.FLW_SECRET_HASH;
//     const signature = req.headers["verif-hash"];

//     if (!signature || signature !== secretHash) {
//       logger.error("Invalid signature: Signature doesn't match the secret hash");
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(401).json({ message: "Unauthorized: Invalid signature" });
//     }

//     const event = req.body.event;
//     const { data } = req.body;

//     if (!event) {
//       logger.error("Event is undefined in webhook payload");
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: "Bad request: Event is undefined" });
//     }

//     if (event === "charge.completed") {
//       const email = data.customer?.email;
//       const { tx_ref: txRef, amount, status } = data;

//       if (!email || !txRef || !amount) {
//         logger.error("Missing essential payment details");
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({ message: "Bad request: Missing payment details" });
//       }
      
//       // Check for duplicate transaction
//       const existingTransaction = await Transaction.findOne({ payment_reference: txRef });
//       if (existingTransaction) {
//         logger.info("Transaction already processed:", txRef);
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(200).json({ message: "Transaction already processed" });
//       }

//       // Find and update user's balance
//       const user = await User.findOneAndUpdate(
//         { email },
//         { $inc: { accountBalance: amount } },
//         { session, new: true }
//       );
  
//       if (!user) {
//         logger.error(`User not found with email: ${email}`);
//         await session.abortTransaction();
//         session.endSession();
//         return errorResMsg(res, 404, "User not found");
//       }
  
//       const userAccountBalance = parseFloat(user.accountBalance.toString());
//       const amountNum = parseFloat(amount);

//       // Create transaction record
//       const transactions = await Transaction.create(
//         [{
//           sender: user._id,
//           transactionType: "deposit",
//           amount: amountNum,
//           description: `Flutterwave deposit: ${data.narration || 'Online payment'}`,
//           balanceBefore: userAccountBalance - amountNum,
//           balanceAfter: userAccountBalance,
//           status: "successful",
//           payment_reference: txRef,
//           flw_reference: data.flw_ref,
//           transaction_details: JSON.stringify(data)
//         }],
//         { session }
//       );

//       // Commit the transaction and return success response
//       await session.commitTransaction();
//       session.endSession();

//       return successResMsg(res, 201, {
//         message: "Deposit successful",
//         transaction: transactions[0]
//       });
//     } else {
//       logger.info(`Unhandled event type: ${event}`);
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(200).json({ message: "Unhandled event type" });
//     }
//   } catch (e) {
//     logger.error(e);
//     await session.abortTransaction();
//     session.endSession();
//     return errorResMsg(res, 500, "Internal Server Error");
//   }
// };
import mongoose from 'mongoose';
import { errorResMsg } from '../../../utils/lib/response';
import Transaction from '../models/transaction.model';
import User from '../models/user';
import logger from '../../../utils/log/logger';


export const deposit = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userName, amount, description } = req.body;
        if (!userName || !amount || !description) {
            return errorResMsg(res, 400, "All fields are required");
            
        }
        const user = await User.findOneAndUpdate(
            { userName },
            { $inc: { accountBalance: amount } },
            { session, new: true }
        );
        if (!user) {
             return errorResMsg(res, 404, "User not found");
        }
        const dep = await Transaction.Create({
            sender: user._id,
            transactionType: 'deposit',
            amount,
            description,
            balanceBefore: user.accountBalance - amount,
            balanceAfter: user.accountBalance
        }, { session });
        await session.commitTransaction();
        session.endSession();

        return successResMsg(res, 200, {
            message: "Deposit successful",
            user,
            transaction: dep
        });
    } catch (e) {
        logger.error(e);
        await session.abortTransaction();
        session.endSession();
        return errorResMsg(res, 500, "Internal Server Error");
    }
}
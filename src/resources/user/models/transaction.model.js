import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const transactionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    transactionType: {
        type: String,
        enum: ['deposit', 'transfer', 'withdrawal'],
        required: true
    },
    amount: {
        type: mongoose.Decimal128,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    referenceNo: {
        type: String,
        unique: true,
        required: false, // Changed to false since we'll auto-generate it
        default: () => `TXN_${uuidv4().substring(0, 8).toUpperCase()}`
    },
    description: {
        type: String,
        required: false
    },
    balanceBefore: {
        type: mongoose.Decimal128,
        required: true
    },
    balanceAfter: {
        type: mongoose.Decimal128,
        required: true
    }
    // metadata: {
    //     type: Object,
    //     default: {}
    // }
}, {
    timestamps: true,
    versionKey: false
});

// Ensure referenceNo is generated before saving if not provided
transactionSchema.pre('save', function(next) {
    if (!this.referenceNo) {
        this.referenceNo = `TXN_${uuidv4().substring(0, 8).toUpperCase()}`;
    }
    next();
});

// Index for faster queries
transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ receiver: 1, createdAt: -1 });
transactionSchema.index({ reference: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

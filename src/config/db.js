import mongoose from 'mongoose';
import logger from '../utils/log/logger.js';
import dotenv from "dotenv"
dotenv.config;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Add these specific timeout options
      serverSelectionTimeoutMS: 10000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket operations
      // These options help with handling transient network issues
      connectTimeoutMS: 10000,
      // Add this option to handle write concerns properly
      w: 'majority',
      retryWrites: true,
      // Increase lock request timeout
      // maxTimeMS: 30000
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

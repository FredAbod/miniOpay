import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { sendServerFailure } from '../utils/email/email-sender.js';
import logger from '../utils/log/logger.js';

const connectDB = async (url) => {
  mongoose.set('strictQuery', true);
  let retries = 3;
  while (retries) {
    try {
      await mongoose.connect(url);
      // console.log(`Database connected successfully`);
      logger.info(`Database connected successfully`);
      return;
    } catch (error) {
      console.log(`Database connection error: ${error.message}`);
      retries--;
      if (retries === 0) {
        await sendServerFailure(process.env.ADMIN_EMAIL);
        throw new Error(`Failed to connect to database after ${retries} attempts`);
      }
      console.log(`Retrying in 10 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

export default connectDB;

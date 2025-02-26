import app from "./app.js";
import dotenv from "dotenv";
import logger from "./src/utils/log/logger.js";
import connectDB from "./src/database/db.js"
// import { sendServerFailure } from "./utils/email/email-sender.js";


const port = process.env.PORT || 4000;
dotenv.config();

const server = app.listen(port, async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    logger.info(`Server is running on port ${port}`);
  } catch (error) {
    logger.error(error);
  }
});

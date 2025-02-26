import jwt from "jsonwebtoken";
import { errorResMsg } from "../utils/lib/response.js";
import logger from "../utils/log/logger.js";

const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return errorResMsg(res, 401, "Authentication failed");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) return errorResMsg(res, 401, "Authentication failed");
    req.user = decoded;
    next();
  } catch (error) {
    return errorResMsg(res, 401, "Authentication failed: 🔒🔒🔒🔒🔒");
  }
};

const createJwtToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "2day",
  });
  return token;
};

const verifyJwtToken = (token, next) => {
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    return userId;
  } catch (err) {
    next(err);
  }
};

const passwordJwtToken =(payload)=>{
  const token =jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"5m"});
  return token;
};

export  {isAuthenticated,createJwtToken,verifyJwtToken,passwordJwtToken};

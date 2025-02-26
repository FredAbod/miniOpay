import Joi from "joi";
import mongoose from "mongoose";

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    if (!req.value) {
      req.value = {}; // create an empty object the request value doesn't exist yet
    }
    req.value["body"] = req.body;
    next();
  };
};

const savingsSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  savingsIcon: Joi.string().required(),
  amount: Joi.number().positive().required(),
  frequency: Joi.string().valid("daily", "weekly", "monthly").required(),
  dayOfWeek: Joi.number().integer().min(0).max(6),
  endDate: Joi.date(),
});

const budgetSchema = Joi.object({
  budgetName: Joi.string().required(),
  // customBudgetName: Joi.string(),
  amount: Joi.number().positive().required(),
  duration: Joi.string().required(),
  icon: Joi.string().required(),
});

const validateMongoDbId = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw new Error("this id is not valid or not found");
};

const schemas = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: Joi.string().min(8).trim().required().messages({
    "string.pattern.base": `Password should be 8 characters and contain letters or numbers only`,
    "string.empty": `Password cannot be empty`,
    "any.required": `Password is required`,
  }),
  phone: Joi.string()
    .max(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .optional(),
  phoneOtp: Joi.string().optional(),
  emailOtp: Joi.string().optional(),
  role: Joi.string()
    .valid("super admin", "admin", "user")
    .default("user")
    .optional(),
  token: Joi.string().optional(),
});

const requiredPhoneSchema = Joi.object({
  phone: Joi.string()
    .max(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required(),
  countryCode: Joi.string().max(5).required(),
});

const otpSchema = Joi.object({
  otp: Joi.string().min(6).max(6).required(),
});

const bvnSchema = Joi.object({
  bvn: Joi.string().min(11).max(11).required(),
});

const setLoginSchema = Joi.object({
  loginPin: Joi.string().min(6).max(6).required(),
});

const loginSchema = Joi.object({
  phone: Joi.string()
    .max(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .optional(),
  password: Joi.string().min(8).max(25).trim().required().messages({
    "string.pattern.base": `Password should be 8 characters and contain letters or numbers only`,
    "string.empty": `Password cannot be empty`,
    "any.required": `Password is required`,
  }),
  countryCode: Joi.string().max(5),
});

const forgetPassSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
});

const verifyFgPassOTPSchema = Joi.object({
  resetOTP: Joi.string().min(6).max(6).required(),
});

const resetPasswordSchema = Joi.object({
  newPass: Joi.string().min(8).max(25).trim().required().messages({
    "string.pattern.base": `Password should be 8 characters and contain letters or numbers only`,
    "string.empty": `Password cannot be empty`,
    "any.required": `Password is required`,
  }),
});

const analysisSchema = Joi.object({
  goals: Joi.string(),
});

const walletDetails = Joi.object({
  recipientDetails: Joi.string().required(),
});

const amountTrf = Joi.object({
  recipientId: Joi.string().required(),
  recipientId:Joi.string().required(),
  amount:Joi.number().required(),
  recipientName:Joi.string().required(),
  remark:Joi.string(),
  budgetId:Joi.string(),
  transactionPin: Joi.number().required(),
});

const initiateCardPaymentSchema = Joi.object({
  amount: Joi.number().required(),
  paymentDescription: Joi.string().required(),
})

const setTransactionSchema = Joi.object({
  transactionPin: Joi.number().required(),
})

const updateTransactionSchema = Joi.object({
  oldPin: Joi.number().required(),
  newPin: Joi.number().required(),
})
const updatePhoneNumber = Joi.object({
  phone: Joi.string()
  .max(10)
  .pattern(/[6-9]{1}[0-9]{9}/)
  .optional(),
});
const updateEmail = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
});
const passwordSchema= Joi.string().min(8).max(25).trim().required().messages({
  "string.pattern.base": `Password should be 8 characters and contain letters or numbers only`,
  "string.empty": `Password cannot be empty`,
  "any.required": `Password is required`,
});
const updatePassword = Joi.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: Joi.valid(Joi.ref('newPassword')).required(),
});



export {
  validateRequest,
  schemas,
  requiredPhoneSchema,
  otpSchema,
  bvnSchema,
  setLoginSchema,
  loginSchema,
  savingsSchema,
  budgetSchema,
  forgetPassSchema,
  verifyFgPassOTPSchema,
  resetPasswordSchema,
  analysisSchema,
  validateMongoDbId,
  walletDetails,
  amountTrf,
  initiateCardPaymentSchema,
  setTransactionSchema,
  updateTransactionSchema,
  updatePhoneNumber,
  updateEmail,
  updatePassword
};

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, 'Last name is required'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, 'Email is required'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'super-admin'],
      default: 'admin',
    },
    permissions: {
      manageUsers: {
        type: Boolean,
        default: true,
      },
      manageTransactions: {
        type: Boolean,
        default: true,
      },
      manageSettings: {
        type: Boolean,
        default: false,
      },
      manageAdmins: {
        type: Boolean,
        default: false,
      },
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active',
    },
    lastLogin: {
      type: Date,
    },
    profilePicture: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate authentication token
adminSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role,
      permissions: this.permissions 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// Virtual for full name
adminSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Method to update last login time
adminSchema.methods.updateLastLogin = async function () {
  this.lastLogin = Date.now();
  await this.save();
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    // required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    // required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    // required: [true, 'Phone number is required'],
    unique: true
  },
  address: {
    type: String,
    // required: [true, 'Address is required']
  },
  accountNumber: {
    type: String,
    //unique: true
  },
  userName: {
    type: String,
    // required: [true, 'Username is required'],
    //unique: true,
    trim: true
  },
  profilePicture: {
    type: String,
    // default: 'default.jpg'
  },
  accountBalance: {
    type: mongoose.Decimal128,
    default: 0
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    // select: false
  }
}, {
  timestamps: true,
  versionKey: false
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// Generate JWT Token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN 
    }
  );
};

// Generate Reset Password Token
userSchema.methods.generateResetToken = function() {
  return jwt.sign(
    { 
      userId: this._id 
    },
    process.env.JWT_RESET_SECRET,
    { 
      expiresIn: '1h' 
    }
  );
};

const User = mongoose.model('User', userSchema);

export default User;

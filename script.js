// createSuperAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Admin from './src/resources/user/models/admin.models.js'; // Adjust the path as needed

dotenv.config();
const createSuperAdmin = async () => {
  try {
    // Connect to your MongoDB database
    await mongoose.connect('mongodb+srv://olamidestephen81:HovvBAn4LRZ6LPbI@cluster0.oil41.mongodb.net/miniopay-1', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('superadminpassword', saltRounds);

    // Create the super-admin
    const superAdmin = await Admin.create({
      firstName: 'iioffffe',
      lastName: 'Blfdffesgoios',
      email: 'looldo@yopmail.com',
      password: hashedPassword,
      phoneNumber: 'dklmfkjhcksllsllmfklmvklf',
      role: 'super-admin',
      permissions: ['read', 'write', 'delete'],
      status: 'active',
    });

    // Generate a JWT token for the super-admin
    // const token = jwt.sign(
    //   {
    //     _id: superAdmin._id,
    //     email: superAdmin.email,
    //     role: superAdmin.role,
    //   },
    //   process.env.JWT_SECRET || 'your-secret-key', // Use a secure secret key
    //   { expiresIn: '5d' } // Token expires in 1 hour
    // );
    const token = jwt.sign(
      { id: superAdmin._id, role: 'superadmin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Log the payload, secret, and token for debugging
    console.log('Token Payload:', { id: superAdmin._id, role: 'superadmin' });
    console.log('JWT Secret:', process.env.JWT_SECRET);
    console.log('Generated Token:', token);

    console.log('Super-admin created successfully:', superAdmin);
    console.log('Generated Token:', token);
  } catch (error) {
    console.error('Error creating super-admin:', error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
  }
};

createSuperAdmin();
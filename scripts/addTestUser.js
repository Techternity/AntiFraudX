import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import UserInfo from '../models/UserInfo.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

// Test user
const testUser = {
  name: 'Riyaz Ahmed',
  username: 'riyaz',
  email: 'riyaz@gmail.com',
  password: 'riyaz@gmail.com',
  role: 'Bank Manager',
  organization: 'HDFC Bank',
  phoneNumber: '9876543212',
  address: 'Bangalore, India'
};

// Connect to MongoDB
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

// Add test user
async function addTestUser() {
  try {
    await connectDB();
    
    // Check if user already exists
    const existingUser = await UserInfo.findOne({ email: testUser.email });
    
    if (existingUser) {
      console.log(`User with email ${testUser.email} already exists. Deleting...`);
      await UserInfo.deleteOne({ email: testUser.email });
    }
    
    // Create new user
    const user = await UserInfo.create(testUser);
    console.log(`Created test user: ${user.email} with role ${user.role}`);
    console.log('Test user details:');
    console.log(`- Email: ${user.email}`);
    console.log(`- Password: ${testUser.password}`);
    console.log(`- Role: ${user.role}`);
    
    console.log('Login with these credentials should now work');
    process.exit(0);
  } catch (error) {
    console.error(`Error adding test user: ${error.message}`);
    process.exit(1);
  }
}

addTestUser();
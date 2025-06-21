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

// Demo users
const demoUsers = [
  {
    name: 'Bank Manager',
    username: 'bankmanager',
    email: 'bank.manager@example.com',
    password: 'demo123',
    role: 'Bank Manager',
    organization: 'SBI',
    phoneNumber: '9876543210',
    address: 'Mumbai, India'
  },
  {
    name: 'Bank Employee',
    username: 'bankemployee',
    email: 'bank.employee@example.com',
    password: 'demo123',
    role: 'Bank Employee',
    organization: 'SBI',
    phoneNumber: '9876543211',
    address: 'Delhi, India'
  }
];

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

// Seed demo users
async function seedDemoUsers() {
  try {
    await connectDB();
    
    // Delete any existing demo users
    await UserInfo.deleteMany({ 
      email: { $in: demoUsers.map(user => user.email) } 
    });
    
    console.log('Deleted existing demo users');
    
    // Create new demo users
    for (const user of demoUsers) {
      await UserInfo.create(user);
      console.log(`Created demo user: ${user.email}`);
    }
    
    console.log('Demo users seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding demo users: ${error.message}`);
    process.exit(1);
  }
}

seedDemoUsers();
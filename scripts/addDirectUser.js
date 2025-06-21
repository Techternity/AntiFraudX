import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

// Connect to MongoDB
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection.db;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

// Add user directly to MongoDB collection
async function addUserDirectly() {
  try {
    const db = await connectDB();
    
    // Check if user_infos collection exists
    const collections = await db.listCollections({ name: 'user_infos' }).toArray();
    if (collections.length === 0) {
      console.log('Creating user_infos collection...');
      await db.createCollection('user_infos');
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('riyaz@gmail.com', salt);
    
    // Delete any existing user with this email
    const deleteResult = await db.collection('user_infos').deleteOne({ 
      email: 'riyaz@gmail.com' 
    });
    console.log(`Deleted ${deleteResult.deletedCount} existing users with same email`);
    
    // Create the new user
    const user = {
      name: 'Riyaz Ahmed',
      username: 'riyaz',
      email: 'riyaz@gmail.com',
      password: hashedPassword,
      role: 'Bank Manager',
      organization: 'HDFC Bank',
      phoneNumber: '9876543212',
      address: 'Bangalore, India',
      createdAt: new Date()
    };
    
    const result = await db.collection('user_infos').insertOne(user);
    
    console.log(`\nSuccessfully added user to database:`);
    console.log(`- ID: ${result.insertedId}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Plain text password (for testing): riyaz@gmail.com`);
    
    console.log('\nYou can now log in with:');
    console.log('Email: riyaz@gmail.com');
    console.log('Password: riyaz@gmail.com');
    console.log('Role: Bank Manager');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error adding user: ${error.message}`);
    process.exit(1);
  }
}

addUserDirectly();
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define the user schema
const UserInfoSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  role: String,
  phoneNumber: String,
  address: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the model
const UserInfo = mongoose.model('user_info', UserInfoSchema);

// Function to connect to the database
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

// Function to get user input
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Main function
async function addUser() {
  // Connect to the database
  const conn = await connectDB();
  
  try {
    console.log('\n===== AntiFraudX User Registration =====\n');
    
    const name = await question('Enter full name: ');
    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');
    
    console.log('\nAvailable roles:');
    console.log('1. Bank Employee');
    console.log('2. Individual');
    console.log('3. Business');
    console.log('4. Bank Manager');
    console.log('5. Security Expert');
    
    const roleChoice = await question('\nSelect role (1-5): ');
    
    const roles = ['Bank Employee', 'Individual', 'Business', 'Bank Manager', 'Security Expert'];
    let role = '';
    
    if (roleChoice >= 1 && roleChoice <= 5) {
      role = roles[roleChoice - 1];
    } else {
      console.log('Invalid role selection. Defaulting to Individual.');
      role = 'Individual';
    }
      const organization = await question('Enter organization name (optional): ');
    const phoneNumber = await question('Enter phone number (optional): ');
    const address = await question('Enter address (optional): ');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
      // Create user
    const user = await UserInfo.create({
      name,
      username,
      email,
      password: hashedPassword,
      role,
      organization,
      phoneNumber,
      address
    });
    
    console.log('\n===== User Created Successfully =====');    console.log(`Name: ${user.name}`);
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    if(user.organization) {
      console.log(`Organization: ${user.organization}`);
    }
    console.log(`Created at: ${user.createdAt}`);
    
  } catch (error) {
    console.error(`Error creating user: ${error.message}`);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    rl.close();
  }
}

// Run the script
addUser();
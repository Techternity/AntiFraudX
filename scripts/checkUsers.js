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
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

// List all collections
async function listCollections() {
  try {
    const conn = await connectDB();
    
    console.log('Available collections:');
    const collections = await conn.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    return collections.map(c => c.name);
  } catch (error) {
    console.error(`Error listing collections: ${error.message}`);
    process.exit(1);
  }
}

// Check users in a specific collection
async function checkUsersInCollection(collectionName) {
  try {
    const conn = await connectDB();
    
    console.log(`\nChecking users in collection: ${collectionName}`);
    const users = await conn.connection.db.collection(collectionName).find({}).toArray();
    
    if (users.length === 0) {
      console.log(`No users found in ${collectionName}`);
    } else {
      console.log(`Found ${users.length} users in ${collectionName}:`);
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`- _id: ${user._id}`);
        console.log(`- name: ${user.name || 'Not set'}`);
        console.log(`- username: ${user.username || 'Not set'}`);
        console.log(`- email: ${user.email || 'Not set'}`);
        console.log(`- role: ${user.role || 'Not set'}`);
        console.log(`- organization: ${user.organization || 'Not set'}`);
      });
    }
    
    return users;
  } catch (error) {
    console.error(`Error checking users: ${error.message}`);
    process.exit(1);
  }
}

// Create a test user directly in the MongoDB collection
async function createTestUserDirectly(collectionName) {
  try {
    const conn = await connectDB();
    const collection = conn.connection.db.collection(collectionName);
    
    // Generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('riyaz@gmail.com', salt);
    
    // Delete any existing user with the same email
    await collection.deleteOne({ email: 'riyaz@gmail.com' });
    
    // Create user directly in the collection
    const result = await collection.insertOne({
      name: 'Riyaz Ahmed',
      username: 'riyaz',
      email: 'riyaz@gmail.com',
      password: hashedPassword,
      role: 'Bank Manager',
      organization: 'HDFC Bank',
      phoneNumber: '9876543212',
      address: 'Bangalore, India',
      createdAt: new Date()
    });
    
    console.log('\nCreated test user directly in collection:');
    console.log(`- Collection: ${collectionName}`);
    console.log(`- User ID: ${result.insertedId}`);
    console.log('- Email: riyaz@gmail.com');
    console.log('- Password: riyaz@gmail.com');
    console.log('- Role: Bank Manager');
    
  } catch (error) {
    console.error(`Error creating test user: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  try {
    // First list all collections
    const collections = await listCollections();
    
    // Check for user_info and user_infos collections
    const userCollection = collections.includes('user_infos') ? 'user_infos' : 
                          (collections.includes('user_info') ? 'user_info' : null);
    
    if (!userCollection) {
      console.log('\nNo user collection found. Creating a new collection: user_infos');
      await createTestUserDirectly('user_infos');
      await checkUsersInCollection('user_infos');
    } else {
      console.log(`\nFound user collection: ${userCollection}`);
      await checkUsersInCollection(userCollection);
      
      // Create a test user in the existing collection
      console.log('\nCreating a test user in the existing collection...');
      await createTestUserDirectly(userCollection);
      
      // Check the collection again
      await checkUsersInCollection(userCollection);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error in main function: ${error.message}`);
    process.exit(1);
  }
}

main();
import mongoose from 'mongoose';
import UserInfo from '../models/UserInfo.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, role, organization, phoneNumber, address } = req.body;

    // Check if user already exists with that email or username
    const userExistsEmail = await UserInfo.findOne({ email });
    if (userExistsEmail) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const userExistsUsername = await UserInfo.findOne({ username });
    if (userExistsUsername) {
      return res.status(400).json({ success: false, message: 'Username already in use' });
    }

    // Create user
    const user = await UserInfo.create({
      name,
      username,
      email,
      password,
      role,
      organization,
      phoneNumber,
      address
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          organization: user.organization,
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    console.log('Login attempt with:', req.body);
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Debug: Log the collection names to verify which collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Debug: Try finding the user with a raw MongoDB call
    const rawUser = await mongoose.connection.db.collection('user_infos').findOne({ email });
    console.log('Raw MongoDB user found:', rawUser ? 'Yes' : 'No');
    
    if (rawUser) {
      console.log('User details from raw query:', { 
        email: rawUser.email, 
        role: rawUser.role,
        hasPassword: !!rawUser.password
      });
    }

    // Check for user with the given email using Mongoose
    const user = await UserInfo.findOne({ email }).select('+password');
    console.log('User found with Mongoose:', user ? 'Yes' : 'No');

    if (!user && rawUser) {
      // If we found a user with raw MongoDB but not with Mongoose, use the raw user
      console.log('Using raw MongoDB user data instead of Mongoose');
      
      // IMPORTANT: Using consistent response format with user object
      return res.json({
        success: true,
        user: {
          _id: rawUser._id,
          name: rawUser.name,
          username: rawUser.username || email.split('@')[0],
          email: rawUser.email,
          role: rawUser.role,
          organization: rawUser.organization,
        },
        token: generateToken(rawUser._id)
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials - User not found' 
      });
    }

    // Check if password matches
    console.log('Password from request:', password);
    console.log('Stored hashed password:', user.password);
    
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials - Password incorrect' 
      });
    }

    // Verify the role matches what was provided (if role was specified)
    console.log('Role comparison:', { 
      providedRole: role, 
      userRole: user.role, 
      matches: (!role || user.role === role)
    });
    
    if (role && user.role !== role) {
      return res.status(401).json({ 
        success: false, 
        message: `Invalid role. User is registered as: ${user.role}` 
      });
    }

    // Only allow Bank Employee and Bank Manager roles (as per requirements)
    if (user.role !== 'Bank Employee' && user.role !== 'Bank Manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access is currently restricted to Bank Employee and Bank Manager roles only' 
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();    console.log('Login successful for:', email);

    // IMPORTANT: Always use consistent response format with user nested
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username || email.split('@')[0],
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await UserInfo.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
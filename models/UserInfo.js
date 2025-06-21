import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['Bank Employee', 'Individual', 'Business', 'Bank Manager', 'Security Expert'],
    required: [true, 'Please specify a role']
  },
  organization: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Encrypt password using bcrypt
UserInfoSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserInfoSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Explicitly set the collection name to 'user_infos' (plural)
const UserInfo = mongoose.model('user_info', UserInfoSchema, 'user_infos');

export default UserInfo;
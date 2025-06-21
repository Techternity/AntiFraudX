import { BankUser } from '../types';

// Sample bank data
export const BANKS = [
  {
    id: 'sbi',
    name: 'State Bank of India',
    code: 'SBI',
    logo: '/logos/sbi.png'
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    code: 'HDFC',
    logo: '/logos/hdfc.png'
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    code: 'ICICI',
    logo: '/logos/icici.png'
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    code: 'AXIS',
    logo: '/logos/axis.png'
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank',
    code: 'PNB',
    logo: '/logos/pnb.png'
  }
];

// Demo users for login
const DEMO_USERS: BankUser[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@sbi.co.in',
    bankName: 'State Bank of India',
    role: 'ADMIN',
    accessLevel: 'All Access',
    password: 'demo123'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@hdfcbank.com',
    bankName: 'HDFC Bank',
    role: 'ANALYST',
    accessLevel: 'Medium Access',
    password: 'demo123'
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit.patel@icicibank.com',
    bankName: 'ICICI Bank',
    role: 'VIEWER',
    accessLevel: 'Basic Access',
    password: 'demo123'
  }
];

export const authenticateUser = (email: string, password: string): BankUser | null => {
  // Find user by email
  const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  // Check if user exists and password matches
  if (user && user.password === password) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as BankUser;
  }
  
  return null;
};
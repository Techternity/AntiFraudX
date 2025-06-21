import { BankInfo, BankUser } from '../types';

export const BANKS: BankInfo[] = [
  {
    code: 'SBI',
    name: 'State Bank of India',
    ifsc_prefix: 'SBIN',
    headquarters: 'Mumbai',
    established: '1955',
    total_branches: 22405,
    logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    code: 'HDFC',
    name: 'HDFC Bank',
    ifsc_prefix: 'HDFC',
    headquarters: 'Mumbai',
    established: '1994',
    total_branches: 6378,
    logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    code: 'ICICI',
    name: 'ICICI Bank',
    ifsc_prefix: 'ICIC',
    headquarters: 'Mumbai',
    established: '1994',
    total_branches: 5275,
    logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    code: 'AXIS',
    name: 'Axis Bank',
    ifsc_prefix: 'UTIB',
    headquarters: 'Mumbai',
    established: '1993',
    total_branches: 4684,
    logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    code: 'PNB',
    name: 'Punjab National Bank',
    ifsc_prefix: 'PUNB',
    headquarters: 'New Delhi',
    established: '1894',
    total_branches: 12248,
    logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  },
  {
    code: 'BOB',
    name: 'Bank of Baroda',
    ifsc_prefix: 'BARB',
    headquarters: 'Vadodara',
    established: '1908',
    total_branches: 9490,
    logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
  }
];

export const DEMO_USERS: BankUser[] = [
  {
    id: 'user_sbi_001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@sbi.co.in',
    bank_code: 'SBI',
    bank_name: 'State Bank of India',
    role: 'ADMIN',
    permissions: ['VIEW_ALL', 'EXPORT_DATA', 'MANAGE_ALERTS', 'APPROVE_TRANSACTIONS'],
    last_login: '2024-01-15T10:30:00Z'
  },
  {
    id: 'user_hdfc_001',
    name: 'Priya Sharma',
    email: 'priya.sharma@hdfcbank.com',
    bank_code: 'HDFC',
    bank_name: 'HDFC Bank',
    role: 'ANALYST',
    permissions: ['VIEW_BANK_DATA', 'EXPORT_DATA', 'CREATE_REPORTS'],
    last_login: '2024-01-15T09:15:00Z'
  },
  {
    id: 'user_icici_001',
    name: 'Amit Patel',
    email: 'amit.patel@icicibank.com',
    bank_code: 'ICICI',
    bank_name: 'ICICI Bank',
    role: 'VIEWER',
    permissions: ['VIEW_BANK_DATA'],
    last_login: '2024-01-15T08:45:00Z'
  }
];

export const getBankByCode = (code: string): BankInfo | undefined => {
  return BANKS.find(bank => bank.code === code);
};

export const getUsersByBank = (bankCode: string): BankUser[] => {
  return DEMO_USERS.filter(user => user.bank_code === bankCode);
};

export const authenticateUser = (email: string, password: string): BankUser | null => {
  // Simple demo authentication - in production, this would be secure
  const user = DEMO_USERS.find(u => u.email === email);
  if (user && password === 'demo123') {
    return user;
  }
  return null;
};
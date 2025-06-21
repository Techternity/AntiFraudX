import React, { useState } from 'react';
import { Shield, User, Lock, Building2, UserCheck, Briefcase } from 'lucide-react';
import { BankUser, UserRole } from '../types';
import { BANKS } from '../utils/bankData';
import { loginUser, storeAuthToken } from '../services/authService';

interface LoginFormProps {
  onLogin: (user: BankUser) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  // Print onLogin function for debugging
  console.log("onLogin function:", onLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim() || !role) {
      setError('Please enter email, password, and select a role.');
      return;
    }

    // Only allow login for Bank Employee and Bank Manager roles
    if (role !== 'Bank Employee' && role !== 'Bank Manager') {
      setError('Access is currently restricted to Bank Employee and Bank Manager roles only.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting to authenticate with:', { email, password, role });
      
      // Call the backend API for authentication
      const response = await loginUser({ email, password, role });
      console.log('Full authentication response:', response);
      
      // Check if we got a successful response (based on the response format shown in your log)
      if (response && response.success === true) {
        console.log('Login successful!');
        
        // Store the JWT token
        if (response.token) {
          storeAuthToken(response.token);
        }
        
        // Handle both response formats (with user object or direct fields)
        let user: BankUser;
        
        if (response.user) {
          // Response has user object
          user = {
            id: response.user._id,
            name: response.user.name,
            email: response.user.email,
            role: response.user.role as UserRole,
            organization: response.user.organization || 'Unknown',
          };        } else if (response._id) {
          // Response has direct user fields
          user = {
            id: response._id,
            name: response.name || 'Unknown User',
            email: response.email || 'unknown@email.com',
            role: (response.role as UserRole) || 'Bank Employee' as UserRole,
            organization: response.organization || 'Unknown',
          };
        } else {
          throw new Error('Invalid response format');
        }
        
        console.log('Constructed user object:', user);
        onLogin(user);
      } else {
        console.log('Authentication failed - Invalid response format');
        setError(response?.message || 'Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    } finally {
      // Ensure loading state is reset if there's an unexpected error
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-white p-3 shadow-lg">
            <Shield className="text-indigo-600" size={42} />
          </div>
        </div>        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          AntiFraudX
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Advanced Fraud Detection & Prevention Platform
        </p>
      </div>      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  placeholder="name@bankname.com"
                />
              </div>
            </div>            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="mt-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="appearance-none block w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                >
                  <option value="">Select your role</option>
                  <option value="Bank Employee">Bank Employee</option>
                  <option value="Individual">Individual</option>
                  <option value="Business">Business</option>
                  <option value="Bank Manager">Bank Manager</option>
                  <option value="Security Expert">Security Expert</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white ${
                  isLoading 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:shadow-lg'
                }`}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Supported banks</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {BANKS.slice(0, 6).map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-center bg-gray-50 hover:bg-indigo-50 p-3 rounded-lg shadow-sm text-xs text-gray-700 transition-all duration-200 ease-in-out border border-transparent hover:border-indigo-200"
                >
                  <Building2 className="text-indigo-500 mr-1" size={16} />
                  {bank.code}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
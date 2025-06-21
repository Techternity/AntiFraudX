import React, { useState } from 'react';
import { Shield, Building2, Lock, User, AlertCircle } from 'lucide-react';
import { BankUser } from '../types';
import { authenticateUser, BANKS } from '../utils/bankData';

interface LoginFormProps {
  onLogin: (user: BankUser) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const user = authenticateUser(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { email: 'rajesh.kumar@sbi.co.in', bank: 'State Bank of India', role: 'Admin' },
    { email: 'priya.sharma@hdfcbank.com', bank: 'HDFC Bank', role: 'Analyst' },
    { email: 'amit.patel@icicibank.com', bank: 'ICICI Bank', role: 'Viewer' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Shield className="text-indigo-600" size={48} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">RBI Banking Portal</h1>
          <p className="text-blue-200">Secure Transaction Monitoring System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="text-indigo-600 mr-2" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Bank Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your bank email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-500 mr-2" size={16} />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Shield className="mr-2" size={20} />
                  Secure Login
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Demo Credentials:</h3>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="text-xs text-gray-600">
                  <div className="font-medium">{cred.bank} ({cred.role})</div>
                  <div className="text-gray-500">{cred.email} / demo123</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-blue-200 text-sm">
            🔒 FIPS 140-2 Compliant | AES-256 Encrypted | Multi-Factor Authentication
          </p>
        </div>
      </div>
    </div>
  );
};
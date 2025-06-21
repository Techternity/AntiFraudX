import React, { useState } from 'react';
import { loginUser, testLoginUser } from '../services/authService';
import { UserRole } from '../types';

const TestLogin: React.FC = () => {
  const [email, setEmail] = useState('riyaz@sbi.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Bank Manager');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRealLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginUser({ email, password, role });
      setResponse(result);
      console.log('Real login response:', result);
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await testLoginUser({ email, password, role });
      setResponse(result);
      console.log('Test login response:', result);
    } catch (err) {
      console.error('Test login error:', err);
      setError('An error occurred during test login');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSimulateLogin = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate a fixed response that matches what you're getting from the backend
    setTimeout(() => {
      const simulatedResponse = {
        success: true,
        _id: '685708f9fe01e95dccd31835',
        name: 'Sk Riyaz',
        username: 'Riyaz',
        email: 'riyaz@sbi.com',
        organization: 'State Bank of India',
        role: 'Bank Manager',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      };
      
      setResponse(simulatedResponse);
      console.log('Simulated response:', simulatedResponse);
      setIsLoading(false);
    }, 500);
  };
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login Test Page</h1>
      
      <div className="mb-6">
        <div className="mb-4">
          <label className="block mb-1">Email:</label>
          <input 
            type="text" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">Role:</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="Bank Manager">Bank Manager</option>
            <option value="Bank Employee">Bank Employee</option>
            <option value="Individual">Individual</option>
            <option value="Business">Business</option>
          </select>
        </div>
      </div>
      
      <div className="flex space-x-4 mb-8">
        <button 
          onClick={handleRealLogin}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Real Login Test
        </button>
        
        <button 
          onClick={handleTestLogin}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Test Endpoint Login
        </button>
        
        <button 
          onClick={handleSimulateLogin}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Simulate Response
        </button>
      </div>
      
      {isLoading && <p className="mb-4">Loading...</p>}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
      
      {response && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Response:</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-80">
            <pre className="whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold">User Object Creation Test:</h3>
            <div className="bg-gray-100 p-4 rounded mt-2">
              {(() => {
                try {
                  let user;
                  
                  if (response.user) {
                    // Response has user object
                    user = {
                      id: response.user._id,
                      name: response.user.name || 'Unknown',
                      email: response.user.email || 'unknown@email.com',
                      role: response.user.role as UserRole || 'Bank Employee' as UserRole,
                      organization: response.user.organization || 'Unknown',
                    };
                  } else if (response._id) {
                    // Response has direct user fields
                    user = {
                      id: response._id,
                      name: response.name || 'Unknown User',
                      email: response.email || 'unknown@email.com',
                      role: response.role as UserRole || 'Bank Employee' as UserRole,
                      organization: response.organization || 'Unknown',
                    };
                  } else {
                    return <p className="text-red-500">Could not create user object</p>;
                  }
                  
                  return (
                    <div>
                      <p className="text-green-600">Successfully created user object:</p>
                      <pre className="whitespace-pre-wrap mt-2">{JSON.stringify(user, null, 2)}</pre>
                    </div>
                  );
                } catch (err) {
                  return (
                    <p className="text-red-500">
                      Error creating user object: {(err as Error).message}
                    </p>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestLogin;
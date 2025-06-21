import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, User, Building2, Siren, CreditCard } from 'lucide-react';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { BankUser } from './types';

function App() {
  const [showSolution, setShowSolution] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<BankUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for existing user session in localStorage when the app loads
  useEffect(() => {
    console.log("App initialization useEffect running");
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log("Found saved user:", user);
        setCurrentUser(user);
        setShowSolution(true);
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsInitialized(true);
    console.log("App initialized");
  }, []);

  // Handle state updates that should happen after render
  useEffect(() => {
    if (isInitialized && showSolution && !currentUser) {
      console.log("Redirecting to login form because showSolution=true but no user");
      setShowLoginForm(true);
      setShowSolution(false);
    }
  }, [showSolution, currentUser, isInitialized]);

  const handleLogin = (user: any) => {
    console.log("Login handler called with user:", user);
    // Ensure user has all required properties
    const completeUser: BankUser = {
      id: user.id || '',
      name: user.name || '',
      email: user.email || '',
      bankName: user.bankName || '',
      role: user.role || 'VIEWER',
      accessLevel: user.accessLevel || ''
    };
    
    setCurrentUser(completeUser);
    // Save user to localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(completeUser));
    setShowLoginForm(false);
    setShowSolution(true); // Navigate to full RBI System page after successful login
    console.log("User logged in, showSolution set to true");
  };

  const handleLogout = () => {
    console.log("Logout handler called");
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setShowSolution(false);
    setShowLoginForm(false);
  };

  // Determine what to render
  const renderContent = () => {
    console.log("Rendering content with states:", { 
      showLoginForm, 
      showSolution, 
      hasUser: !!currentUser 
    });

    if (showLoginForm) {
      return <LoginForm onLogin={handleLogin} />;
    }

    if (showSolution && currentUser) {
      return (
        <div key="dashboard-container">
          <Dashboard user={currentUser} onLogout={handleLogout} />
        </div>
      );
    }

    // Default landing page
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-lg">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="text-indigo-600 mr-2" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">RBI SecureTrust</h1>
            </div>
            <div className="space-x-6">
              <a href="/" className="text-gray-600 hover:text-indigo-600 font-medium">Home</a>
              <a href="/about" className="text-gray-600 hover:text-indigo-600 font-medium">About</a>
              <a href="/contact" className="text-gray-600 hover:text-indigo-600 font-medium">Contact</a>
              <button 
                onClick={() => currentUser ? setShowSolution(true) : setShowLoginForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                {currentUser ? 'Dashboard' : 'Login'}
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-6 py-12">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              SecureTrust: One-Stop Solution for Financial Security
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Empowering RBI, Banks, Cyber-Crime Branches, and Customers with our advanced Trust Score system to protect India's financial ecosystem.
            </p>
          </section>

          {/* Trust Score Explanation */}
          <section className="mb-16">
            <h3 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
              Understanding the Trust Score
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Danger Zone (0-300)</h4>
                <p className="text-gray-600">
                  High-risk accounts with suspicious transaction patterns requiring immediate attention.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <AlertTriangle className="text-yellow-500 mx-auto mb-4" size={40} />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Warning Zone (301-600)</h4>
                <p className="text-gray-600">
                  Moderate-risk accounts needing review to prevent potential fraud.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <CheckCircle className="text-green-500 mx-auto mb-4" size={40} />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Good Zone (601-900)</h4>
                <p className="text-gray-600">
                  Low-risk accounts with trustworthy transaction histories.
                </p>
              </div>
            </div>
          </section>

          {/* Stakeholder Benefits */}
          <section className="mb-16">
            <h3 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
              Empowering Stakeholders
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customers */}
              <div className="bg-white rounded-lg shadow-md p-8 flex items-start">
                <User className="text-indigo-600 mr-4" size={40} />
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">For Customers</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      View your Trust Score (0-900) to understand your financial standing.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      Check all linked accounts (savings, current, etc.) via PAN card.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      Monitor transaction patterns to stay informed and secure.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Banks */}
              <div className="bg-white rounded-lg shadow-md p-8 flex items-start">
                <Building2 className="text-indigo-600 mr-4" size={40} />
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">For Banks</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      Analyze customer transaction patterns to detect and prevent fraud.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      Use Trust Score insights to tailor product offerings.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      Enhance customer trust with transparent security measures.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Cyber-Crime Branch */}
              <div className="bg-white rounded-lg shadow-md p-8 flex items-start">
                <Siren className="text-indigo-600 mr-4" size={40} />
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">For Cyber-Crime Branch</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      Identify high-risk accounts (Trust Score {'<'} 300) for immediate action.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      Freeze accounts based on complaints or suspicious activity.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      Streamline investigations with detailed transaction data.
                    </li>
                  </ul>
                </div>
              </div>

              {/* RBI */}
              <div className="bg-white rounded-lg shadow-md p-8 flex items-start">
                <Shield className="text-indigo-600 mr-4" size={40} />
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">For RBI</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      Integrate banks, cyber-crime branches, and customers seamlessly.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      Monitor national financial security with Trust Score analytics.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={16} />
                      Enforce compliance with real-time fraud detection.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center bg-indigo-600 text-white rounded-lg p-12">
            <h3 className="text-3xl font-bold mb-4">Join SecureTrust Today</h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Protect India's financial future with our comprehensive Trust Score solution. Connect with us to learn how SecureTrust can safeguard your stakeholders.
            </p>
            <button 
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
              onClick={() => currentUser ? setShowSolution(true) : setShowLoginForm(true)}
            >
              See Demo
            </button>
          </section>
        </main>

        {/* Footer */}        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">About SecureTrust</h4>
                <p className="text-gray-400">
                  A revolutionary platform by RBI to ensure financial security through advanced Trust Score analytics.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="/about" className="text-gray-400 hover:text-white">About</a></li>
                  <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                <p className="text-gray-400">Email: support@securetrust.in</p>
                <p className="text-gray-400">Phone: +91 123 456 7890</p>
              </div>
            </div>
            <div className="mt-8 text-center text-gray-400">
              &copy; 2025 SecureTrust. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  };

  return renderContent();
}

export default App;


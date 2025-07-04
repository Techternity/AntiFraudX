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

  // Check for existing user session in localStorage when the app loads AND
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
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col relative overflow-hidden">        {/* Animated Grid Background */}
        <div className="absolute inset-0 z-0 grid-background opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 via-transparent to-indigo-900 opacity-20 pointer-events-none"></div>
        {/* Animated Floating Elements */}
        <div className="absolute top-20 left-20 w-24 h-24 rounded-full bg-blue-600 opacity-10 animate-float-slow pointer-events-none"></div>
        <div className="absolute bottom-40 right-20 w-32 h-32 rounded-full bg-indigo-600 opacity-10 animate-float-medium pointer-events-none"></div>
        <div className="absolute top-60 right-60 w-16 h-16 rounded-full bg-purple-600 opacity-10 animate-float-fast pointer-events-none"></div>
        
        <style jsx>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-20px) translateX(15px); }
          }
          @keyframes float-medium {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-15px) translateX(-15px); }
          }
          @keyframes float-fast {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-25px) translateX(10px); }
          }
          .animate-float-slow {
            animation: float-slow 8s ease-in-out infinite;
          }
          .animate-float-medium {
            animation: float-medium 6s ease-in-out infinite;
          }
          .animate-float-fast {
            animation: float-fast 4s ease-in-out infinite;
          }
          .grid-background {
            background-image: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 1px, transparent 1px),
                              linear-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px);
            background-size: 40px 40px;
          }
          .shadow-glow {
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
          }
        `}</style>{/* Navigation Bar */}        <nav className="bg-gradient-to-r from-indigo-800 to-blue-700 shadow-xl relative z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg shadow-md mr-3">
                  <Shield className="text-indigo-700" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">FraudShield</h1>
                  <p className="text-xs text-indigo-200">Government Authorized Financial Security System</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                <a href="/" className="px-3 py-2 text-white hover:bg-indigo-600 hover:text-white rounded-md transition duration-300 relative z-50">
                  Home
                </a>
                
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentUser) {
                      setShowSolution(true);
                    } else {
                      setShowLoginForm(true);
                      console.log("Login button clicked, showing login form");
                    }
                  }}
                  className="ml-4 bg-white text-indigo-700 px-5 py-2 rounded-md hover:bg-indigo-100 shadow-md font-medium transition duration-300 flex items-center cursor-pointer relative z-50"
                >
                  <User className="mr-2" size={16} />
                  {currentUser ? 'Dashboard' : 'Login'}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-6 py-12">
          {/* Hero Section */}          <section className="mb-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl opacity-20 -z-10"></div>
            <div className="absolute inset-0 bg-gray-800 rounded-3xl opacity-80 -z-10 backdrop-blur-sm"></div>
            <div className="relative z-10 py-16 px-10 rounded-3xl border border-gray-700 shadow-2xl backdrop-blur-sm min-h-[500px] flex flex-col justify-center">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 py-3 rounded-full shadow-lg">
                <h4 className="text-sm font-bold tracking-wider uppercase">Government Endorsed Financial Security Platform</h4>
              </div>                <div className="text-center">
                <h2 className="font-bold text-white leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 text-5xl md:text-6xl block mb-3 animate-pulse">FraudShield</span>
                  <span className="text-3xl md:text-4xl text-gray-200 block mb-6">Advanced Payment Fraud Prevention</span>
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-300 mx-auto rounded-full mb-8"></div>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
                  Protecting Banks with AI-Powered Trust Scores and Blockchain Verification to Secure Financial Transactions
                </p>
              </div>
                <div className="flex flex-wrap justify-center mt-10 gap-6">
                <div className="flex items-center px-8 py-6 bg-blue-900/30 backdrop-blur-sm rounded-xl border border-blue-400/20 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 hover:bg-blue-800/30">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-lg shadow-md">
                    <Shield className="text-white" size={28} />
                  </div>
                  <div className="ml-4">
                    <span className="text-blue-300 font-bold text-lg block">Blockchain Secured</span>
                    <span className="text-blue-200 text-sm">Immutable transaction records</span>
                  </div>
                </div>
                <div className="flex items-center px-8 py-6 bg-green-900/30 backdrop-blur-sm rounded-xl border border-green-400/20 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 hover:bg-green-800/30">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-lg shadow-md">
                    <CheckCircle className="text-white" size={28} />
                  </div>
                  <div className="ml-4">
                    <span className="text-green-300 font-bold text-lg block">AI Powered</span>
                    <span className="text-green-200 text-sm">Advanced pattern recognition</span>
                  </div>
                </div>
                <div className="flex items-center px-8 py-6 bg-purple-900/30 backdrop-blur-sm rounded-xl border border-purple-400/20 shadow-lg transition-all hover:shadow-xl hover:-translate-y-2 hover:bg-purple-800/30">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-lg shadow-md">
                    <AlertTriangle className="text-white" size={28} />
                  </div>
                  <div className="ml-4">
                    <span className="text-purple-300 font-bold text-lg block">Real-time Protection</span>
                    <span className="text-purple-200 text-sm">Instant fraud detection</span>
                  </div>
                </div>
              </div>
                <div className="mt-10 text-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentUser) {
                      setShowSolution(true);
                    } else {
                      setShowLoginForm(true);
                      console.log("Get Started button clicked, showing login form");
                    }
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl relative z-10 cursor-pointer"
                >
                  Get Started Now → 
                </button>
              </div>            </div>          </section>
            {/* Marquee Banner */}          <section className="relative mb-12 mt-6 overflow-hidden py-1 bg-gradient-to-r from-indigo-900 to-blue-900">            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%234338ca\' fill-opacity=\'0.15\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 20L20 0L40 20L20 40z\'/%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
            
            <div className="marquee-container relative overflow-hidden h-16">
              <style jsx>{`
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .marquee-content {
                  display: flex;
                  white-space: nowrap;
                  height: 100%;
                }
                .animate-marquee {
                  animation: marquee 30s linear infinite;
                }
              `}</style>
                <div className="marquee-content flex items-center h-full">
                  <div className="flex items-center h-full animate-marquee">
                    {/* First segment */}
                    
                    
                    {/* Second segment */}
                    <div className="flex items-center h-full">
                      <div className="bg-white/95 rounded-full h-12 w-12 flex items-center justify-center shadow-glow mr-3">
                        <img src="/assets/india-govt-logo.png" alt="Government of India" className="w-9 h-9 object-contain"
                           onError={(e) => {
                             e.currentTarget.onerror = null;
                             e.currentTarget.src = '';
                             if (e.currentTarget.parentElement) {
                               e.currentTarget.parentElement.innerHTML = 'GOI';
                             }
                           }}
                        />
                      </div>
                      
                      <span className="text-white font-bold text-lg tracking-wider">
                        EXCLUSIVELY FOR GOVERNMENT OF INDIA
                      </span>
                      
                      <span className="text-indigo-300 px-4 mx-4">•</span>
                    </div>
                    
                    {/* Third segment */}
                    <div className="flex items-center h-full">
                      <div className="bg-white/95 rounded-full h-12 w-12 flex items-center justify-center shadow-glow mr-3">
                        <img src="/assets/financial-logo.png" alt="Financial Institutions" className="w-9 h-9 object-contain"
                           onError={(e) => {
                             e.currentTarget.onerror = null;
                             e.currentTarget.src = '';
                             if (e.currentTarget.parentElement) {
                               e.currentTarget.parentElement.innerHTML = 'FI';
                             }
                           }}
                        />
                      </div>
                      
                      <span className="text-white font-bold text-lg">
                        (FINANCIAL INSTITUTIONS) TO PREVENT FINANCIAL FRAUDS
                      </span>
                      
                      <span className="text-indigo-300 px-4 mx-4">•</span>
                    </div>
                    
                    {/* Fourth segment */}
                    <div className="flex items-center h-full">
                      <div className="bg-white/95 rounded-full h-12 w-12 flex items-center justify-center shadow-glow mr-3">
                        <img src="/assets/digital-india-logo.png" alt="Digital India" className="w-9 h-9 object-contain"
                           onError={(e) => {
                             e.currentTarget.onerror = null;
                             e.currentTarget.src = '';
                             if (e.currentTarget.parentElement) {
                               e.currentTarget.parentElement.innerHTML = 'DI';
                             }
                           }}
                        />
                      </div>
                      
                      <span className="text-white font-bold text-xl tracking-wider">
                        DIGITAL INDIA
                      </span>
                      
                      <span className="text-indigo-300 px-4 mx-4">•</span>
                    </div>
                    
                    {/* Repeat for continuous effect */}
                    {/* First segment (duplicate) */}
                    
                    
                    {/* Second segment (duplicate) */}
                    <div className="flex items-center h-full">
                      <div className="bg-white/95 rounded-full h-12 w-12 flex items-center justify-center shadow-glow mr-3">
                        <img src="/assets/india-govt-logo.png" alt="Government of India" className="w-9 h-9 object-contain"
                           onError={(e) => {
                             e.currentTarget.onerror = null;
                             e.currentTarget.src = '';
                             if (e.currentTarget.parentElement) {
                               e.currentTarget.parentElement.innerHTML = 'GOI';
                             }
                           }}
                        />
                      </div>
                      
                      <span className="text-white font-bold text-lg tracking-wider">
                        EXCLUSIVELY FOR GOVERNMENT OF INDIA
                      </span>
                      
                      <span className="text-indigo-300 px-4 mx-4">•</span>
                    </div>
                    
                    {/* Third segment (duplicate) */}
                    <div className="flex items-center h-full">
                      <div className="bg-white/95 rounded-full h-12 w-12 flex items-center justify-center shadow-glow mr-3">
                        <img src="/assets/financial-logo.png" alt="Financial Institutions" className="w-9 h-9 object-contain"
                           onError={(e) => {
                             e.currentTarget.onerror = null;
                             e.currentTarget.src = '';
                             if (e.currentTarget.parentElement) {
                               e.currentTarget.parentElement.innerHTML = 'FI';
                             }
                           }}
                        />
                      </div>
                      
                      <span className="text-white font-bold text-lg">
                        (FINANCIAL INSTITUTIONS) TO PREVENT FINANCIAL FRAUDS
                      </span>
                      
                      <span className="text-indigo-300 px-4 mx-4">•</span>
                    </div>
                    
                    {/* Fourth segment (duplicate) */}
                    <div className="flex items-center h-full">
                      <div className="bg-white/95 rounded-full h-12 w-12 flex items-center justify-center shadow-glow mr-3">
                        <img src="/assets/digital-india-logo.png" alt="Digital India" className="w-9 h-9 object-contain"
                           onError={(e) => {
                             e.currentTarget.onerror = null;
                             e.currentTarget.src = '';
                             if (e.currentTarget.parentElement) {
                               e.currentTarget.parentElement.innerHTML = 'DI';
                             }
                           }}
                        />
                      </div>
                      
                      <span className="text-white font-bold text-xl tracking-wider">
                        DIGITAL INDIA
                      </span>
                      
                      <span className="text-indigo-300 px-4 mx-4">•</span>
                    </div>
                  </div>
                </div>
            </div>
          </section>
          
          {/* Trust Score Explanation */}          <section className="mb-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 rounded-xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            
            <div className="relative z-10 py-16 px-8">
              <div className="text-center mb-16 relative">
                <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                <span className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-medium tracking-wider mb-4">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                  TRUST ANALYTICS
                </span>
                <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">Understanding the Trust Score</h3>
                <p className="text-gray-300 max-w-3xl mx-auto text-lg">
                  Our advanced algorithm analyzes multiple factors to calculate a comprehensive Trust Score that helps identify potentially fraudulent activities
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Danger Zone Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl blur-sm group-hover:blur opacity-70 group-hover:opacity-80 transition-all duration-300 -z-10"></div>
                  <div className="backdrop-blur-md bg-black/30 p-8 rounded-2xl border border-red-500/30 hover:border-red-500/50 shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
                          <AlertTriangle className="text-white" size={24} />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-xl font-bold text-white">Danger Zone</h4>
                          <p className="text-red-300 font-medium">Score: 0-300</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-red-400">30%</span>
                    </div>
                    <p className="text-gray-300 mb-6">
                      High-risk accounts with suspicious transaction patterns requiring immediate attention and investigation.
                    </p>
                    <div className="mt-auto">
                      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-red-700 rounded-full" style={{width: '30%'}}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>High Risk</span>
                        <span>Critical</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Warning Zone Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-800 rounded-2xl blur-sm group-hover:blur opacity-70 group-hover:opacity-80 transition-all duration-300 -z-10"></div>
                  <div className="backdrop-blur-md bg-black/30 p-8 rounded-2xl border border-amber-500/30 hover:border-amber-500/50 shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg">
                          <AlertTriangle className="text-white" size={24} />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-xl font-bold text-white">Warning Zone</h4>
                          <p className="text-amber-300 font-medium">Score: 301-600</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-amber-400">60%</span>
                    </div>
                    <p className="text-gray-300 mb-6">
                      Moderate-risk accounts needing careful review and monitoring to prevent potential fraudulent activities.
                    </p>
                    <div className="mt-auto">
                      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-700 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Moderate Risk</span>
                        <span>Needs Attention</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Good Zone Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-800 rounded-2xl blur-sm group-hover:blur opacity-70 group-hover:opacity-80 transition-all duration-300 -z-10"></div>
                  <div className="backdrop-blur-md bg-black/30 p-8 rounded-2xl border border-green-500/30 hover:border-green-500/50 shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg">
                          <CheckCircle className="text-white" size={24} />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-xl font-bold text-white">Good Zone</h4>
                          <p className="text-green-300 font-medium">Score: 601-900</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-green-400">90%</span>
                    </div>
                    <p className="text-gray-300 mb-6">
                      Low-risk accounts with established trustworthy transaction histories and consistent patterns.
                    </p>
                    <div className="mt-auto">
                      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-700 rounded-full" style={{width: '90%'}}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Low Risk</span>
                        <span>Secure</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Statistics Section */}
          <section className="mb-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-70 rounded-xl"></div>
            <div className="relative z-10 py-12 px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="backdrop-blur-md bg-white/10 p-6 rounded-xl border border-white/20 transform transition-all hover:scale-105">
                  <span className="text-5xl font-bold text-white mb-2 block">30+</span>
                  <span className="text-gray-300">Banking Partners</span>
                </div>
                <div className="backdrop-blur-md bg-white/10 p-6 rounded-xl border border-white/20 transform transition-all hover:scale-105">
                  <span className="text-5xl font-bold text-white mb-2 block">₹2.7B</span>
                  <span className="text-gray-300">Fraud Prevented</span>
                </div>
                <div className="backdrop-blur-md bg-white/10 p-6 rounded-xl border border-white/20 transform transition-all hover:scale-105">
                  <span className="text-5xl font-bold text-white mb-2 block">15K+</span>
                  <span className="text-gray-300">Fraudulent Transactions Blocked</span>
                </div>
                <div className="backdrop-blur-md bg-white/10 p-6 rounded-xl border border-white/20 transform transition-all hover:scale-105">
                  <span className="text-5xl font-bold text-white mb-2 block">99.8%</span>
                  <span className="text-gray-300">Detection Accuracy</span>
                </div>
              </div>
            </div>
          </section>

          {/* Stakeholder Benefits */}<section className="mb-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-30 rounded-3xl"></div>
            <div className="relative z-10 py-10 px-6">
              <h3 className="text-3xl font-semibold text-white mb-8 text-center">
                Empowering Stakeholders
              </h3>            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customers */}
              <div className="backdrop-blur-md bg-white/20 rounded-xl border border-white/20 p-8 flex items-start shadow-xl hover:bg-white/30 transition-all">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-full shadow-lg">
                  <User className="text-white" size={36} />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-white mb-2">For Customers</h4>
                  <ul className="text-gray-200 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      View your Trust Score (0-900) to understand your financial standing.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      Check all linked accounts (savings, current, etc.) via PAN card.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      Monitor transaction patterns to stay informed and secure.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Banks */}
              <div className="backdrop-blur-md bg-white/20 rounded-xl border border-white/20 p-8 flex items-start shadow-xl hover:bg-white/30 transition-all">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-full shadow-lg">
                  <Building2 className="text-white" size={36} />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-white mb-2">For Banks</h4>
                  <ul className="text-gray-200 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      Analyze customer transaction patterns to detect and prevent fraud.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      Use Trust Score insights to tailor product offerings.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      Enhance customer trust with transparent security measures.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Cyber-Crime Branch */}
              <div className="backdrop-blur-md bg-white/20 rounded-xl border border-white/20 p-8 flex items-start shadow-xl hover:bg-white/30 transition-all">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-full shadow-lg">
                  <Siren className="text-white" size={36} />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-white mb-2">For Cyber-Crime Branch</h4>
                  <ul className="text-gray-200 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      Identify high-risk accounts (Trust Score {'<'} 300) for immediate action.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      Freeze accounts based on complaints or suspicious activity.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      Streamline investigations with detailed transaction data.
                    </li>
                  </ul>
                </div>
              </div>

              {/* RBI */}
              <div className="backdrop-blur-md bg-white/20 rounded-xl border border-white/20 p-8 flex items-start shadow-xl hover:bg-white/30 transition-all">
                <div className="bg-gradient-to-br from-rose-500 to-pink-500 p-3 rounded-full shadow-lg">
                  <Shield className="text-white" size={36} />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-white mb-2">For RBI</h4>
                  <ul className="text-gray-200 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      Integrate banks, cyber-crime branches, and customers seamlessly.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      Monitor national financial security with Trust Score analytics.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="text-green-400 mr-2" size={16} />
                      Enforce compliance with real-time fraud detection.
                    </li>
                  </ul>
                </div>
              </div>
            </div></div>
          </section>

          {/* Call to Action */}<section className="relative rounded-2xl overflow-hidden mb-16">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-indigo-900"></div>
            <div className="absolute inset-0 bg-pattern opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
            <div className="relative z-10 px-8 py-16 text-center">
              <div className="inline-block p-2 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <span className="text-white font-bold px-4 py-2">Trusted by Leading Financial Institutions</span>
              </div>
              <h3 className="text-4xl font-bold mb-6 text-white">Join AntiFraudX Today</h3>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                Elevate your bank's fraud detection capabilities with our blockchain-secured, AI-powered Trust Score platform. Get started with a personalized demo.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 shadow-lg transition-all hover:-translate-y-1"
                  onClick={() => currentUser ? setShowSolution(true) : setShowLoginForm(true)}
                >
                  Request Demo
                </button>
                <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all">
                  Contact Sales
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}        <footer className="bg-gray-900 bg-opacity-80 text-white py-8 backdrop-blur-sm border-t border-gray-800">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>                <h4 className="text-lg font-semibold mb-4">About AntiFraudX</h4>
                <p className="text-gray-400">
                  A revolutionary platform for banks to prevent payment fraud through blockchain-secured Trust Scores and AI-powered analytics.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">                  <li><a href="/about" className="text-gray-400 hover:text-white">About</a></li>
                  <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
                  <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-gray-400 hover:text-white">Terms of Use</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact Us</h4>                <p className="text-gray-400 mb-2">Email: contact@techternity.in</p>
                <p className="text-gray-400 mb-2">Phone: +91 7501005155</p>
                <p className="text-gray-400">Kolkata, India</p>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400 mb-4 md:mb-0">
                © 2025 AntiFraudX. An Techternity initiative. All rights reserved.
              </p>
              <div className="flex space-x-4">                <a href="#" className="text-gray-400 hover:text-white">
                  Facebook
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  return renderContent();
}

export default App;


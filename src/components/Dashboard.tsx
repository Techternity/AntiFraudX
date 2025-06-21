// filepath: f:\H4B\AntiFraudX\src\components\Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Upload, 
  LayoutDashboard, 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  LogOut, 
  User, 
  CheckCircle,
  Download
} from 'lucide-react';
import { FileUploader } from './FileUploader';
import { ProcessingAnimation } from './ProcessingAnimation';
import { StatsCards } from './StatsCards';
import { BankUser, ProcessedTransaction, SecurityStats } from '../types';
import { generateSessionKey, parseCSV, processTransaction } from '../utils/mockSecurity';
//HEALED
interface DashboardProps {
  user: BankUser | null;
  onLogout: () => void;
}

type NavItem = 'upload' | 'overview' | 'transactions' | 'alerts' | 'reports';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeNav, setActiveNav] = useState<NavItem>('upload');
  const [sessionKey, setSessionKey] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [processedTransactions, setProcessedTransactions] = useState<ProcessedTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);  const [lastActivity, setLastActivity] = useState(Date.now());
  // Add debug logs
  console.log("Dashboard rendered with user:", user);
  console.log("Current active nav:", activeNav);
  
  // Define navigation handler function
  const handleNavClick = (nav: NavItem) => {
    console.log(`Navigation clicked: ${nav}`);
    setActiveNav(nav);
    updateActivity();
  };

  // Initialize session
  useEffect(() => {
    const newSessionKey = generateSessionKey();
    setSessionKey(newSessionKey);
  }, []);

  // Activity tracking
  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  const calculateStats = (transactions: ProcessedTransaction[]): SecurityStats => {
    const stats: SecurityStats = {
      total_transactions: transactions.length,
      safe_transactions: 0,
      needs_review: 0,
      high_risk: 0,
      blocked_transactions: 0
    };

    transactions.forEach(t => {
      const { risk_level, recommendation } = t.risk_analysis;
      
      if (risk_level === 'LOW') stats.safe_transactions++;
      if (risk_level === 'MODERATE') stats.needs_review++;
      if (risk_level === 'HIGH' || risk_level === 'CRITICAL') stats.high_risk++;
      if (recommendation === 'BLOCK') stats.blocked_transactions++;
    });

    return stats;
  };

  const handleFileUpload = async (file: File) => {
    updateActivity();
    setError(null);
    setIsProcessing(true);
    setCurrentStep(0);

    try {
      // Step 1: Read file
      const content = await file.text();
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Parse CSV
      const transactions = parseCSV(content);
      if (transactions.length === 0) {
        throw new Error('No valid transactions found in CSV');
      }
      if (transactions.length > 10000) {
        throw new Error('Too many transactions (max 10000)');
      }
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 800));

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Prediction server failed');
      }

      const results: { user_id: string; score_label: string }[] = await response.json();

      // Map results to ProcessedTransaction objects
      const processed = results.map((result, i) => {
        // Find the original transaction data
        const originalTx = transactions.find(t => t.user_id === result.user_id);

        const riskLevelMap = {
          good: 'LOW',
          moderate: 'MODERATE',
          bad: 'CRITICAL',
        };
        
        const risk_level = riskLevelMap[result.score_label as keyof typeof riskLevelMap] || 'MODERATE';

        return {
          original_data: originalTx || {
            account_id: `ACC${i}`,
            user_id: result.user_id,
            transaction_amount: 0,
            recipient_account: 'N/A',
            sender_country: 'N/A',
            recipient_country: 'N/A',
            account_age_days: 0,
            previous_failed_transactions: 0,
            transaction_type: 'N/A',
            purpose: 'N/A',
            sender_account_verified: false,
          },
          encrypted_data: {
            encrypted_data: 'mock_encrypted_data',
            transaction_hash: 'mock_tx_hash',
            hmac: 'mock_hmac',
            encryption_method: 'AES-256-GCM',
            timestamp: Date.now(),
            nonce: 'mock_nonce',
          },
          blockchain_tx: {
            tx_hash: `0xmock_tx_hash_${i}`,
            block_number: 1,
            from_address: '0xmock_from',
            to_address: '0xmock_to',
            gas_used: 21000,
            gas_price: 50,
            status: 'confirmed',
            timestamp: Date.now(),
            data_hash: 'mock_data_hash',
            merkle_leaf: 'mock_merkle_leaf',
            chain_id: 1,
            nonce: 'mock_nonce',
          },
          risk_analysis: {
            cibyl_score: 0,
            risk_level: risk_level,
            risk_factors: [result.score_label],
            recommendation: risk_level === 'CRITICAL' ? 'BLOCK' : (risk_level === 'MODERATE' ? 'REVIEW' : 'APPROVE'),
            confidence: 0.95,
            security_checks: [],
          },
          processed_at: new Date().toISOString(),
          security_session: sessionKey,
        } as ProcessedTransaction;
      });

      setCurrentStep(8);
      await new Promise(resolve => setTimeout(resolve, 500));

      setProcessedTransactions(processed);
      setActiveNav('overview'); // Auto-switch to overview after successful upload
      setIsProcessing(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setIsProcessing(false);
    }
  };

  const handleDownloadReport = () => {
    updateActivity();
    const reportData = processedTransactions.map(t => ({
      Account_ID: t.original_data.account_id,
      User_ID: t.original_data.user_id,
      Account_Holder_Name: t.original_data.account_holder_name || 'N/A',
      Transaction_Amount: t.original_data.transaction_amount,
      CIBYL_Score: t.risk_analysis.cibyl_score,
      Risk_Level: t.risk_analysis.risk_level,
      Recommendation: t.risk_analysis.recommendation,
      Risk_Factors: t.risk_analysis.risk_factors.join('; '),
      Security_Checks: t.risk_analysis.security_checks.join('; '),
      Confidence_Level: t.risk_analysis.confidence,
      Blockchain_TX_Hash: t.blockchain_tx.tx_hash,
      Block_Number: t.blockchain_tx.block_number,
      Merkle_Leaf: t.blockchain_tx.merkle_leaf,
      Processed_Timestamp: t.processed_at,
      Sender_Country: t.original_data.sender_country,
      Recipient_Country: t.original_data.recipient_country,
      Transaction_Type: t.original_data.transaction_type,
      Purpose: t.original_data.purpose,
      Session_ID: t.security_session.substring(0, 8) + '...'
    }));

    const csv = [
      Object.keys(reportData[0]).join(','),
      ...reportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RBI_Security_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = processedTransactions.length > 0
    ? calculateStats(processedTransactions)
    : {
        total_transactions: 0,
        safe_transactions: 0,
        needs_review: 0,
        high_risk: 0,
        blocked_transactions: 0
      };

  // Filter high-risk transactions for alerts
  const highRiskTransactions = processedTransactions.filter(
    t => t.risk_analysis.risk_level === 'HIGH' || t.risk_analysis.risk_level === 'CRITICAL'
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        {/* Logo & Header */}
        <div className="p-4 border-b border-indigo-800">
          <div className="flex items-center">
            <Shield className="text-white mr-2" size={24} />
            <h1 className="text-xl font-bold">SecureTrust</h1>
          </div>
          <div className="text-xs text-indigo-300 mt-1">Transaction Security System</div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-indigo-800">
          <div className="flex items-center">
            <div className="bg-indigo-700 p-2 rounded-full">
              <User className="text-indigo-300" size={16} />
            </div>
            <div className="ml-2">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-xs text-indigo-300">{user?.bankName}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4">
          <div className="mb-2 text-xs text-indigo-300 uppercase tracking-wider">Main</div>
          <ul className="space-y-1">            <li>
              <button
                onClick={() => handleNavClick('upload')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                  activeNav === 'upload' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <Upload size={18} className="mr-2" />
                Upload CSV
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('overview')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                  activeNav === 'overview' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <LayoutDashboard size={18} className="mr-2" />
                Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('transactions')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                  activeNav === 'transactions' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <FileText size={18} className="mr-2" />
                Transactions
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('alerts')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                  activeNav === 'alerts' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <AlertTriangle size={18} className="mr-2" />
                Risk Alerts
                {highRiskTransactions.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {highRiskTransactions.length}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('reports')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                  activeNav === 'reports' 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <BarChart3 size={18} className="mr-2" />
                Reports
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-indigo-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2 text-indigo-300 hover:bg-indigo-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">
                {activeNav === 'upload' && 'Upload Transaction Data'}
                {activeNav === 'overview' && 'Dashboard Overview'}
                {activeNav === 'transactions' && 'Transaction History'}
                {activeNav === 'alerts' && 'Risk Alerts & Notifications'}
                {activeNav === 'reports' && 'Analytics & Reports'}
              </h1>
              <div className="text-sm text-gray-600">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  Session Active
                </span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="p-6">
          {/* Upload CSV Section */}
          {activeNav === 'upload' && (
            <div className="space-y-6">
              <FileUploader onFileUpload={handleFileUpload} disabled={isProcessing} />
              
              {(isProcessing || error) && (
                <div className="mt-4">
                  <ProcessingAnimation
                    currentStep={currentStep}
                    totalSteps={8}
                    isComplete={!isProcessing && !error}
                    error={error || undefined}
                  />
                </div>
              )}
            </div>
          )}

          {/* Overview Section */}
          {activeNav === 'overview' && (
            <div className="space-y-6">
              <StatsCards stats={stats} />
              
              {processedTransactions.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <div className="text-gray-400 mb-4">
                    <LayoutDashboard size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                  <p className="text-gray-600">Upload a transaction CSV file to see the dashboard overview.</p>
                  <button
                    onClick={() => setActiveNav('upload')}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Upload Data
                  </button>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-lg font-semibold mb-4">Risk Analysis Summary</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-800 font-medium">Safe Transactions</div>
                      <div className="text-2xl font-bold text-green-700">{stats.safe_transactions}</div>
                      <div className="text-xs text-green-600 mt-1">{Math.round((stats.safe_transactions / stats.total_transactions) * 100)}% of total</div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm text-yellow-800 font-medium">Needs Review</div>
                      <div className="text-2xl font-bold text-yellow-700">{stats.needs_review}</div>
                      <div className="text-xs text-yellow-600 mt-1">{Math.round((stats.needs_review / stats.total_transactions) * 100)}% of total</div>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm text-red-800 font-medium">High Risk</div>
                      <div className="text-2xl font-bold text-red-700">{stats.high_risk}</div>
                      <div className="text-xs text-red-600 mt-1">{Math.round((stats.high_risk / stats.total_transactions) * 100)}% of total</div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-800 font-medium">Blocked</div>
                      <div className="text-2xl font-bold text-purple-700">{stats.blocked_transactions}</div>
                      <div className="text-xs text-purple-600 mt-1">{Math.round((stats.blocked_transactions / stats.total_transactions) * 100)}% of total</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => setActiveNav('reports')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      View Detailed Reports →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}          {/* Transactions Section */}
          {activeNav === 'transactions' && (
            <div className="space-y-6">
              {processedTransactions.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <div className="text-gray-400 mb-4">
                    <FileText size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Available</h3>
                  <p className="text-gray-600">Upload a transaction CSV file to view transaction history.</p>
                  <button
                    onClick={() => setActiveNav('upload')}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Upload Data
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold">Detailed Transaction Analysis</h2>
                      <button
                        onClick={handleDownloadReport}
                        className="bg-indigo-600 text-white flex items-center px-4 py-2 rounded hover:bg-indigo-700"
                      >
                        <Download size={16} className="mr-2" />
                        Download Report
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain TX</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Prediction</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {processedTransactions.map((transaction, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {transaction.original_data.account_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.original_data.user_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${transaction.original_data.transaction_amount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {transaction.risk_analysis.risk_level === 'LOW' && (
                                  <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
                                    <CheckCircle className="mr-1" size={12} />
                                    Low
                                  </span>
                                )}
                                {transaction.risk_analysis.risk_level === 'MODERATE' && (
                                  <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full">
                                    <AlertTriangle className="mr-1" size={12} />
                                    Moderate
                                  </span>
                                )}
                                {(transaction.risk_analysis.risk_level === 'HIGH' || transaction.risk_analysis.risk_level === 'CRITICAL') && (
                                  <span className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full">
                                    <AlertTriangle className="mr-1" size={12} />
                                    {transaction.risk_analysis.risk_level}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full ${
                                  transaction.risk_analysis.recommendation === 'APPROVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : transaction.risk_analysis.recommendation === 'REVIEW'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.risk_analysis.recommendation}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md font-mono">
                                  {transaction.blockchain_tx.tx_hash.substring(0, 10)}...
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.risk_analysis.risk_factors.join(', ')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                                <button>View Details</button>
                              </td>
                            </tr>
                          ))}
                          
                          {processedTransactions.length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                                No transactions found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Risk Alerts Section */}
          {activeNav === 'alerts' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertTriangle className="text-red-500 mr-2" size={20} />
                  High Risk Transactions
                </h2>
                
                {highRiskTransactions.length === 0 ? (
                  <div className="bg-green-50 p-6 rounded-lg text-center">
                    <CheckCircle className="text-green-500 mx-auto mb-2" size={32} />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Risk Alerts</h3>
                    <p className="text-gray-600">No high-risk transactions detected in the current dataset.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Factors</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {highRiskTransactions.map((tx, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{tx.original_data.account_id}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{tx.original_data.user_id}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">${tx.original_data.transaction_amount.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                                {tx.risk_analysis.risk_level}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{tx.risk_analysis.risk_factors.join(', ')}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                                {tx.risk_analysis.recommendation}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <button className="text-indigo-600 hover:text-indigo-800 mr-2">View Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports Section */}
          {activeNav === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="text-indigo-600 mr-2" size={20} />
                  Analytics & Reports
                </h2>
                
                {processedTransactions.length === 0 ? (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <BarChart3 className="text-gray-400 mx-auto mb-2" size={32} />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Data Available</h3>
                    <p className="text-gray-600">Upload a transaction CSV file to generate reports and analytics.</p>
                    <button
                      onClick={() => setActiveNav('upload')}
                      className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Upload Data
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-md font-medium mb-3">Risk Distribution</h3>
                        <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                          {stats.total_transactions > 0 && (
                            <>
                              <div 
                                className="h-full bg-green-500 float-left" 
                                style={{ width: `${(stats.safe_transactions / stats.total_transactions) * 100}%` }}
                                title={`${stats.safe_transactions} Safe Transactions`}
                              ></div>
                              <div 
                                className="h-full bg-yellow-500 float-left" 
                                style={{ width: `${(stats.needs_review / stats.total_transactions) * 100}%` }}
                                title={`${stats.needs_review} Transactions Needing Review`}
                              ></div>
                              <div 
                                className="h-full bg-red-500 float-left" 
                                style={{ width: `${(stats.high_risk / stats.total_transactions) * 100}%` }}
                                title={`${stats.high_risk} High-Risk Transactions`}
                              ></div>
                            </>
                          )}
                        </div>
                        <div className="flex mt-2 text-xs">
                          <div className="flex items-center mr-3">
                            <div className="w-3 h-3 bg-green-500 rounded mr-1"></div> Safe
                          </div>
                          <div className="flex items-center mr-3">
                            <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div> Review
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded mr-1"></div> High Risk
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-md font-medium mb-3">Risk Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Transactions</span>
                            <span className="font-semibold">{stats.total_transactions}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Safe Transactions</span>
                            <span className="font-semibold text-green-700">{stats.safe_transactions}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Needs Review</span>
                            <span className="font-semibold text-yellow-700">{stats.needs_review}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">High Risk</span>
                            <span className="font-semibold text-red-700">{stats.high_risk}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Blocked</span>
                            <span className="font-semibold text-purple-700">{stats.blocked_transactions}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-medium">Export Options</h3>
                      <div className="space-x-2">
                        <button
                          onClick={handleDownloadReport}
                          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                        >
                          Download Full Report
                        </button>
                        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors">
                          Download Risk Summary 
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div> 
    </div>
  );
};
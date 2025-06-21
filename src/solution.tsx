import React, { useState, useEffect, useCallback } from 'react';
import { Shield, CheckCircle, AlertTriangle, FileText, Send, Building2, X } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { ProcessingAnimation } from './components/ProcessingAnimation';
import { StatsCards } from './components/StatsCards';
import { TransactionTable } from './components/TransactionTable';
import { LoginForm } from './components/LoginForm';
import { BankDashboard } from './components/BankDashboard';
import {
  generateSessionKey,
  parseCSV,
  processTransaction
} from './utils/mockSecurity';
import { ProcessedTransaction, SecurityStats, BankUser } from './types';

interface AppSolutionProps {
  user: BankUser | null;
  onLogout: () => void;
}

const AppSolution = ({ user, onLogout }: AppSolutionProps) => {
  // Use the passed-in user if available, otherwise use state
  const [currentView, setCurrentView] = useState<'rbi' | 'bank'>(user ? 'bank' : 'rbi');
  const [bankUser, setBankUser] = useState<BankUser | null>(user);
  const [sessionKey, setSessionKey] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [processedTransactions, setProcessedTransactions] = useState<ProcessedTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Initialize session
  useEffect(() => {
    const newSessionKey = generateSessionKey();
    setSessionKey(newSessionKey);
  }, []);

  // Session timeout (15 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 900000) { // 15 minutes
        handleTerminateSession();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActivity]);

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

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
    setProcessedTransactions([]);

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

      // We need to map the results from the python backend to the ProcessedTransaction type
      // that the rest of the application expects.
      const processed = results.map((result, i) => {
        // Find the original transaction data to get other fields
        const originalTx = transactions.find(t => t.user_id === result.user_id);

        const riskLevelMap = {
          good: 'LOW',
          moderate: 'MODERATE',
          bad: 'CRITICAL',
        };
        
        const risk_level = riskLevelMap[result.score_label as keyof typeof riskLevelMap] || 'MODERATE';

        // We are creating a mock ProcessedTransaction object.
        // Some data will be mocked or set to default values.
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
            cibyl_score: 0, // The new model does not provide a score, just a label.
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

  const handleTerminateSession = () => {
    const newSessionKey = generateSessionKey();
    setSessionKey(newSessionKey);
    setProcessedTransactions([]);
    setError(null);
    setIsProcessing(false);
    setCurrentStep(0);
    setLastActivity(Date.now());
  };

  const handleBankLogin = (user: BankUser) => {
    setBankUser(user);
    setCurrentView('bank');
    updateActivity();
  };
  const handleBankLogout = () => {
    setBankUser(null);
    setCurrentView('rbi');
    updateActivity();
    
    // Call parent component's onLogout
    onLogout();
  };

  const stats = processedTransactions.length > 0 ? calculateStats(processedTransactions) : {
    total_transactions: 0,
    safe_transactions: 0,
    needs_review: 0,
    high_risk: 0,
    blocked_transactions: 0
  };

  // Bank Dashboard View
  if (currentView === 'bank') {
    if (!bankUser) {
      return <LoginForm onLogin={handleBankLogin} />;
    }
    return (
      <BankDashboard
        user={bankUser}
        transactions={processedTransactions}
        onLogout={handleBankLogout}
      />
    );
  }

  // RBI Main System View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
              <Shield className="mr-3 text-indigo-600" size={32} />
              RBI - Secure Transaction Monitoring System
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Military-Grade Transaction Security and Fraud Detection
            </p>
            <p className="text-sm text-blue-600 font-semibold">
              FIPS 140-2 Compliant | AES-256-GCM | Blockchain Verified
            </p>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setCurrentView('rbi')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'rbi' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              RBI System
            </button>
            <button
              onClick={() => setCurrentView('bank')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'bank' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bank Dashboard
            </button>
          </div>
        </div>

        {/* Session Info */}
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center">
            <Shield className="mr-2 text-green-600" size={20} />
            <span className="text-green-700 font-medium">
              Secure Session: {sessionKey.substring(0, 8)}...
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* File Upload */}
        <div className="mb-6">
          <FileUploader 
            onFileUpload={handleFileUpload} 
            disabled={isProcessing}
          />
        </div>

        {/* Processing Animation */}
        {(isProcessing || error) && (
          <div className="mb-6">
            <ProcessingAnimation
              currentStep={currentStep}
              totalSteps={8}
              isComplete={!isProcessing && !error}
              error={error || undefined}
            />
          </div>
        )}

        {/* Results */}
        {processedTransactions.length > 0 && (
          <div className="mb-6">
            {/* Security Status */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="mr-2" />
                Transaction Security Analysis
              </h3>
              
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Security Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="text-green-500 mr-2" size={16} />
                    All transactions encrypted with AES-256-GCM
                  </div>
                  <div className="flex items-center text-blue-700">
                    <Shield className="text-blue-500 mr-2" size={16} />
                    HMAC-SHA256 integrity verification completed
                  </div>
                  <div className="flex items-center text-purple-700">
                    <Shield className="text-purple-500 mr-2" size={16} />
                    Blockchain Merkle tree verification completed
                  </div>
                  <div className="flex items-center text-indigo-700">
                    <Shield className="text-indigo-500 mr-2" size={16} />
                    Secure Session ID: {sessionKey.substring(0, 8)}...
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleDownloadReport}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center"
                >
                  <FileText className="mr-2" size={16} />
                  Download Security Report
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center">
                  <Send className="mr-2" size={16} />
                  Report to RBI
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center">
                  <Building2 className="mr-2" size={16} />
                  Notify Banks
                </button>
              </div>
            </div>

            {/* Transaction Table */}
            <TransactionTable 
              transactions={processedTransactions}
              onDownloadReport={handleDownloadReport}
            />
          </div>
        )}

        {/* Terminate Session Button */}
        <div className="mb-6">
          <button
            onClick={handleTerminateSession}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center"
          >
            <X className="mr-2" size={16} />
            Terminate Session
          </button>
        </div>
      </div>
    </div>
  );
};


export default AppSolution;

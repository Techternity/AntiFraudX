import { Transaction, RiskAnalysis, BlockchainTransaction, EncryptedData, ProcessedTransaction } from '../types';

// Generate random hex string
const generateHex = (length: number): string => {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Generate session key
export const generateSessionKey = (): string => {
  return generateHex(16);
};

// Validate transaction input
export const validateTransaction = (transaction: Transaction): boolean => {
  const requiredFields = ['user_id'];
  return requiredFields.every(field => transaction[field as keyof Transaction] !== undefined);
};

// Mock encryption
export const encryptTransaction = (transaction: Transaction): EncryptedData => {
  const data = JSON.stringify(transaction);
  const encrypted = btoa(data); // Simple base64 encoding for demo
  
  return {
    encrypted_data: encrypted,
    transaction_hash: generateHex(64),
    hmac: generateHex(64),
    encryption_method: 'AES-256-GCM',
    timestamp: Date.now(),
    nonce: generateHex(32)
  };
};

// Mock blockchain verification
export const simulateBlockchainVerification = (transaction: Transaction): BlockchainTransaction => {
  return {
    tx_hash: `0x${generateHex(64)}`,
    block_number: Math.floor(Math.random() * 1000000) + 18000000,
    from_address: `0x${generateHex(40)}`,
    to_address: `0x${generateHex(40)}`,
    gas_used: Math.floor(Math.random() * 64000) + 21000,
    gas_price: Math.floor(Math.random() * 80) + 20,
    status: 'confirmed',
    timestamp: Date.now(),
    data_hash: generateHex(64),
    merkle_leaf: generateHex(64),
    chain_id: 1,
    nonce: generateHex(16)
  };
};

// Calculate CIBYL risk score
export const calculateCibylScore = (transaction: Transaction): RiskAnalysis => {
  let score = 0;
  const riskFactors: string[] = [];
  const securityChecks: string[] = [];
  
  // High amount risk
  if (transaction.transaction_amount > 1000000) {
    score += 0.5;
    riskFactors.push('Critical Amount (>10L)');
    securityChecks.push('Large Transaction Verification Required');
  } else if (transaction.transaction_amount > 500000) {
    score += 0.4;
    riskFactors.push('Very High Amount (>5L)');
  } else if (transaction.transaction_amount > 100000) {
    score += 0.3;
    riskFactors.push('High Amount (>1L)');
  }
  
  // International transfer risk
  if (transaction.sender_country !== transaction.recipient_country) {
    score += 0.3;
    riskFactors.push('International Transfer');
    
    const highRiskCountries = ['KP', 'IR', 'SY'];
    if (highRiskCountries.includes(transaction.recipient_country.toUpperCase())) {
      score += 0.4;
      riskFactors.push('High Risk Country');
      securityChecks.push('Sanctions List Check Required');
    }
  }
  
  // Account age risk
  if (transaction.account_age_days < 15) {
    score += 0.5;
    riskFactors.push('Very New Account (<15 days)');
    securityChecks.push('Enhanced KYC Required');
  } else if (transaction.account_age_days < 30) {
    score += 0.4;
    riskFactors.push('New Account (<30 days)');
  } else if (transaction.account_age_days < 90) {
    score += 0.2;
    riskFactors.push('Recent Account (<90 days)');
  }
  
  // Failed transactions risk
  if (transaction.previous_failed_transactions > 10) {
    score += 0.6;
    riskFactors.push('Excessive Failed Transactions');
    securityChecks.push('Account Lock Recommended');
  } else if (transaction.previous_failed_transactions > 5) {
    score += 0.5;
    riskFactors.push('Multiple Failed Transactions');
  } else if (transaction.previous_failed_transactions > 2) {
    score += 0.3;
    riskFactors.push('Some Failed Transactions');
  }
  
  // Transaction type risk
  const highRiskTypes = ['crypto', 'investment', 'gambling', 'escrow'];
  if (highRiskTypes.includes(transaction.transaction_type.toLowerCase())) {
    score += 0.4;
    riskFactors.push('High Risk Transaction Type');
    securityChecks.push('Transaction Type Verification');
  }
  
  // Purpose risk
  const suspiciousPurposes = ['loan', 'urgent', 'emergency', 'investment', 'trading', 'charity'];
  if (suspiciousPurposes.some(word => transaction.purpose.toLowerCase().includes(word))) {
    score += 0.3;
    riskFactors.push('Suspicious Purpose');
    securityChecks.push('Purpose Verification Required');
  }
  
  // Unverified account risk
  if (!transaction.sender_account_verified) {
    score += 0.2;
    riskFactors.push('Unverified Sender Account');
    securityChecks.push('Account Verification Required');
  }
  
  const finalScore = Math.min(score, 1.0);
  
  let riskLevel: RiskAnalysis['risk_level'];
  let recommendation: RiskAnalysis['recommendation'];
  
  if (finalScore >= 0.8) {
    riskLevel = 'CRITICAL';
    recommendation = 'BLOCK';
    securityChecks.push('Immediate Action Required');
  } else if (finalScore >= 0.6) {
    riskLevel = 'HIGH';
    recommendation = 'QUARANTINE';
  } else if (finalScore >= 0.4) {
    riskLevel = 'MODERATE';
    recommendation = 'REVIEW';
  } else {
    riskLevel = 'LOW';
    recommendation = 'APPROVE';
  }
  
  return {
    cibyl_score: Math.round(finalScore * 1000) / 1000,
    risk_level: riskLevel,
    risk_factors: riskFactors,
    recommendation,
    confidence: Math.min(0.98, 0.8 + (finalScore * 0.2)),
    security_checks: securityChecks
  };
};

// Process transaction with all security steps
export const processTransaction = (
  transaction: Transaction, 
  sessionKey: string
): ProcessedTransaction => {
  const encryptedData = encryptTransaction(transaction);
  const blockchainTx = simulateBlockchainVerification(transaction);
  const riskAnalysis = calculateCibylScore(transaction);
  
  return {
    original_data: transaction,
    encrypted_data: encryptedData,
    blockchain_tx: blockchainTx,
    risk_analysis: riskAnalysis,
    processed_at: new Date().toISOString(),
    security_session: sessionKey
  };
};

// Parse CSV content
export const parseCSV = (content: string): Transaction[] => {
  const lines = content.trim().split('\n').filter(line => line);
  if (lines.length < 2) {
    throw new Error('CSV file must have a header and at least one data row.');
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  
  const requiredHeaders = [
    'user_id', 
    'num_savings_accounts', 
    'num_current_accounts',
    'transaction_amount', 
    'transaction_date', 
    'account_opening_reason'
  ];
  
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const csvData: any = {};
    headers.forEach((header, i) => {
      csvData[header] = values[i] || '';
    });

    const transaction: Transaction = {
      // Fields from the new CSV format
      user_id: csvData.user_id,
      transaction_amount: parseFloat(csvData.transaction_amount) || 0,
      
      // Mocked fields for compatibility with the rest of the application
      account_id: csvData.account_id || `ACC_${csvData.user_id}_${index}`,
      recipient_account: `RECIPIENT_${index}`,
      sender_country: 'IN',
      recipient_country: 'IN',
      account_age_days: 90, // default value
      previous_failed_transactions: 0, // default value
      transaction_type: 'transfer', // default value
      purpose: 'personal', // default value
      sender_account_verified: true, // default value
    };
    
    if (!validateTransaction(transaction)) {
      throw new Error(`Invalid transaction data at row ${index + 2}`);
    }
    
    return transaction;
  });
};
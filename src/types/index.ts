export interface Transaction {
  account_id: string;
  user_id: string;
  transaction_amount: number;
  recipient_account: string;
  sender_country: string;
  recipient_country: string;
  account_age_days: number;
  previous_failed_transactions: number;
  transaction_type: string;
  purpose: string;
  sender_account_verified: boolean;
  account_holder_name: string; // Made required for report generation
  bank_code?: string; // Optional, e.g., "SBIN" for State Bank of India
  branch_code?: string; // Optional, e.g., "000123"
  ifsc_code?: string; // Optional, e.g., "SBIN0000123"
}

export interface RawTransaction {
  [key: string]: string | number | boolean | undefined; // Flexible type for CSV parsing
}

export interface RiskAnalysis {
  cibyl_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  risk_factors: string[];
  recommendation: 'APPROVE' | 'REVIEW' | 'BLOCK' | 'QUARANTINE';
  confidence: number;
  security_checks: string[];
}

export interface BlockchainTransaction {
  tx_hash: string;
  block_number: number;
  from_address: string;
  to_address: string;
  gas_used: number;
  gas_price: number;
  status: string;
  timestamp: number;
  data_hash: string;
  merkle_leaf: string;
  chain_id: number;
  nonce: string;
}

export interface EncryptedData {
  encrypted_data: string;
  transaction_hash: string;
  hmac: string;
  encryption_method: string;
  timestamp: number;
  nonce: string;
}

export interface ProcessedTransaction {
  original_data: Transaction;
  encrypted_data: EncryptedData;
  blockchain_tx: BlockchainTransaction;
  risk_analysis: RiskAnalysis;
  processed_at: string;
  security_session: string;
}

export interface ProcessingStep {
  id: number;
  name: string;
  icon: string;
  completed: boolean;
  active: boolean;
}

export interface SecurityStats {
  total_transactions: number;
  safe_transactions: number; // risk_level: LOW
  needs_review: number; // risk_level: MODERATE
  high_risk: number; // risk_level: HIGH or CRITICAL
  blocked_transactions: number; // recommendation: BLOCK or QUARANTINE
}

export interface BankUser {
  id: string;
  name: string;
  email: string;
  bank_code: string;
  bank_name: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  permissions: string[];
  last_login: string;
}

export interface BankInfo {
  code: string;
  name: string;
  ifsc_prefix: string;
  headquarters: string;
  established: string;
  total_branches: number;
  logo_url?: string;
}

export interface DashboardFilters {
  dateRange: {
    start: string;
    end: string;
  };
  riskLevels: string[];
  transactionTypes: string[];
  amountRange: {
    min: number;
    max: number;
  };
  countries: string[];
}

export interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  notification_channels: string[];
}

export interface ServerResult {
  // Define the properties of ServerResult GG
  success: boolean;
  message: string;
  data?: any; // Adjust the type as necessary
}
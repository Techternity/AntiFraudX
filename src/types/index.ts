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
  account_holder_name?: string;
  bank_code?: string;
  branch_code?: string;
  ifsc_code?: string;
}

export interface RiskAnalysis {
  cibyl_score: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  risk_factors: string[];
  recommendation: 'BLOCK' | 'QUARANTINE' | 'REVIEW' | 'APPROVE';
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
  safe_transactions: number;
  needs_review: number;
  high_risk: number;
  blocked_transactions: number;
}

export type UserRole = 
  | 'Bank Employee' 
  | 'Individual' 
  | 'Business' 
  | 'Bank Manager' 
  | 'Security Expert';

export interface BankUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  logo?: string;
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
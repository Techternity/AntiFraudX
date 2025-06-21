// filepath: f:\H4B\AntiFraudX\src\types.ts

export interface BankUser {
  id: string;
  name: string;
  email: string;
  bankName: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  accessLevel: string;
  password?: string; // Optional because we don't always want to include it
}

export interface RawTransaction {
  account_id: string;
  user_id: string;
  account_holder_name?: string;  
  transaction_amount: number;
  recipient_account: string;
  sender_country: string;
  recipient_country: string;
  account_age_days: number;
  previous_failed_transactions: number;
  transaction_type: string;
  purpose: string;
  sender_account_verified: boolean;
}

export interface EncryptedData {
  encrypted_data: string;
  transaction_hash: string;
  hmac: string;
  encryption_method: string;
  timestamp: number;
  nonce: string;
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

export interface RiskAnalysis {
  cibyl_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  risk_factors: string[];
  recommendation: 'APPROVE' | 'REVIEW' | 'BLOCK';
  confidence: number;
  security_checks: string[];
}

export interface ProcessedTransaction {
  original_data: RawTransaction;
  encrypted_data: EncryptedData;
  blockchain_tx: BlockchainTransaction;
  risk_analysis: RiskAnalysis;
  processed_at: string;
  security_session: string;
}

export interface SecurityStats {
  total_transactions: number;
  safe_transactions: number;
  needs_review: number;
  high_risk: number;
  blocked_transactions: number;
}
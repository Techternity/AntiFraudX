export interface Transaction {
  accountNumber: string;
  numberOfAccounts: number;
  reasonOfOpeningAccount: string;
  transactionAmount: number;
  transactionDate: string;
}

export interface DisplayTransaction {
  id: string;
  accountNumber: string;
  numberOfAccounts: number;
  reasonOfOpeningAccount: string;
  transactionAmount: number;
  transactionDate: string;
  risk_analysis: {
    risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    score_label: string;
  };
}

export interface ProcessedTransaction {
  id: string;
  original_data: Transaction;
  risk_analysis: {
    risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    score_label: string;
  };
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
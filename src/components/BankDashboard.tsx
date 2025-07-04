import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Calendar,
  Filter,
  Download,
  Bell,
  Users,
  Building2,
  CreditCard,
  DollarSign,
  Activity,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ProcessedTransaction, BankUser, DashboardFilters } from '../types';
import { getBankByCode } from '../utils/bankData';

interface BankDashboardProps {
  user: BankUser;
  transactions: ProcessedTransaction[];
  onLogout: () => void;
}

export const BankDashboard: React.FC<BankDashboardProps> = ({ 
  user, 
  transactions, 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'alerts' | 'reports'>('overview');
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    riskLevels: [],
    transactionTypes: [],
    amountRange: { min: 0, max: 10000000 },
    countries: []
  });

  const bank = getBankByCode(user.bank_code);
  
  // Filter transactions based on bank and user permissions
  const bankTransactions = useMemo(() => {
    return transactions.filter(t => {
      const accountId = t.original_data.account_id;
      const bankCode = accountId.substring(0, 4).toUpperCase();
      
      if (user.role === 'ADMIN') {
        return true; // Admin can see all transactions in FraudShield
      }
      
      return bankCode === user.bank_code || 
             t.original_data.ifsc_code?.startsWith(bank?.ifsc_prefix || '');
    });
  }, [transactions, user.bank_code, user.role, bank]);

  const filteredTransactions = useMemo(() => {
    return bankTransactions.filter(t => {
      const txDate = new Date(t.processed_at).toISOString().split('T')[0];
      const amount = t.original_data.transaction_amount;
      
      // Date filter
      if (txDate < filters.dateRange.start || txDate > filters.dateRange.end) {
        return false;
      }
      
      // Risk level filter
      if (filters.riskLevels.length > 0 && !filters.riskLevels.includes(t.risk_analysis.risk_level)) {
        return false;
      }
      
      // Transaction type filter
      if (filters.transactionTypes.length > 0 && !filters.transactionTypes.includes(t.original_data.transaction_type)) {
        return false;
      }
      
      // Amount range filter
      if (amount < filters.amountRange.min || amount > filters.amountRange.max) {
        return false;
      }
      
      return true;
    });
  }, [bankTransactions, filters]);

  const dashboardStats = useMemo(() => {
    const stats = {
      total: filteredTransactions.length,
      safe: 0,
      moderate: 0,
      high: 0,
      critical: 0,
      blocked: 0,
      totalAmount: 0,
      avgAmount: 0
    };

    filteredTransactions.forEach(t => {
      const risk = t.risk_analysis.risk_level;
      const amount = t.original_data.transaction_amount;
      
      stats.totalAmount += amount;
      
      switch (risk) {
        case 'LOW': stats.safe++; break;
        case 'MODERATE': stats.moderate++; break;
        case 'HIGH': stats.high++; break;
        case 'CRITICAL': stats.critical++; break;
      }
      
      if (t.risk_analysis.recommendation === 'BLOCK') {
        stats.blocked++;
      }
    });

    stats.avgAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;
    
    return stats;
  }, [filteredTransactions]);

  const riskDistribution = useMemo(() => {
    const total = dashboardStats.total;
    return {
      safe: total > 0 ? (dashboardStats.safe / total) * 100 : 0,
      moderate: total > 0 ? (dashboardStats.moderate / total) * 100 : 0,
      high: total > 0 ? (dashboardStats.high / total) * 100 : 0,
      critical: total > 0 ? (dashboardStats.critical / total) * 100 : 0
    };
  }, [dashboardStats]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    change?: string;
  }> = ({ title, value, icon, color, bgColor, change }) => (
    <div className={`${bgColor} rounded-xl shadow-sm p-6 border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>
            {typeof value === 'number' && title.includes('Amount') 
              ? `₹${value.toLocaleString()}` 
              : value.toLocaleString()}
          </p>
          {change && (
            <p className="text-xs text-gray-500 mt-1">{change}</p>
          )}
        </div>
        <div className={`${color} opacity-80`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
  }> = ({ id, label, icon, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
        active 
          ? 'bg-indigo-600 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center mr-8">
                <Building2 className="text-indigo-600 mr-3" size={32} />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{bank?.name}</h1>
                  <p className="text-sm text-gray-500">Banking Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg">
                <Shield className="text-green-600 mr-2" size={16} />
                <span className="text-green-700 text-sm font-medium">Secure Session</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-medium">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6">
          <TabButton
            id="overview"
            label="Overview"
            icon={<BarChart3 size={18} />}
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            id="transactions"
            label="Transactions"
            icon={<CreditCard size={18} />}
            active={activeTab === 'transactions'}
            onClick={() => setActiveTab('transactions')}
          />
          <TabButton
            id="alerts"
            label="Risk Alerts"
            icon={<AlertTriangle size={18} />}
            active={activeTab === 'alerts'}
            onClick={() => setActiveTab('alerts')}
          />
          <TabButton
            id="reports"
            label="Reports"
            icon={<Download size={18} />}
            active={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
          />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Transactions"
                value={dashboardStats.total}
                icon={<Activity size={24} />}
                color="text-blue-600"
                bgColor="bg-white"
                change="+12% from last week"
              />
              <StatCard
                title="Total Amount"
                value={dashboardStats.totalAmount}
                icon={<DollarSign size={24} />}
                color="text-green-600"
                bgColor="bg-white"
                change="+8% from last week"
              />
              <StatCard
                title="High Risk"
                value={dashboardStats.high + dashboardStats.critical}
                icon={<AlertTriangle size={24} />}
                color="text-red-600"
                bgColor="bg-white"
                change="-5% from last week"
              />
              <StatCard
                title="Blocked"
                value={dashboardStats.blocked}
                icon={<XCircle size={24} />}
                color="text-purple-600"
                bgColor="bg-white"
                change="2 new today"
              />
            </div>

            {/* Risk Distribution Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">Safe Transactions</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">
                      {riskDistribution.safe.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500">({dashboardStats.safe})</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${riskDistribution.safe}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">Moderate Risk</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">
                      {riskDistribution.moderate.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500">({dashboardStats.moderate})</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${riskDistribution.moderate}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-600">High Risk</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">
                      {(riskDistribution.high + riskDistribution.critical).toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500">({dashboardStats.high + dashboardStats.critical})</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${riskDistribution.high + riskDistribution.critical}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recent High Risk Transactions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent High Risk Transactions</h3>
              <div className="space-y-3">
                {filteredTransactions
                  .filter(t => ['HIGH', 'CRITICAL'].includes(t.risk_analysis.risk_level))
                  .slice(0, 5)
                  .map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center">
                        <AlertTriangle className="text-red-500 mr-3" size={20} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.original_data.account_id}
                          </p>
                          <p className="text-xs text-gray-500">
                            ₹{transaction.original_data.transaction_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.risk_analysis.risk_level === 'CRITICAL' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {transaction.risk_analysis.risk_level}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(transaction.processed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="mr-2" size={20} />
                Transaction Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                  <select
                    multiple
                    value={filters.riskLevels}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      riskLevels: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                  <input
                    type="number"
                    value={filters.amountRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      amountRange: { ...prev.amountRange, min: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                  <input
                    type="number"
                    value={filters.amountRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      amountRange: { ...prev.amountRange, max: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="10000000"
                  />
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Bank Transactions ({filteredTransactions.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CIBYL Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recommendation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.slice(0, 20).map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.original_data.account_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{transaction.original_data.transaction_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.risk_analysis.risk_level === 'CRITICAL' ? 'bg-red-600 text-white' :
                            transaction.risk_analysis.risk_level === 'HIGH' ? 'bg-red-500 text-white' :
                            transaction.risk_analysis.risk_level === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {transaction.risk_analysis.risk_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {transaction.risk_analysis.cibyl_score.toFixed(3)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.risk_analysis.recommendation === 'BLOCK' ? 'bg-red-600 text-white' :
                            transaction.risk_analysis.recommendation === 'QUARANTINE' ? 'bg-orange-500 text-white' :
                            transaction.risk_analysis.recommendation === 'REVIEW' ? 'bg-yellow-500 text-white' :
                            'bg-green-500 text-white'
                          }`}>
                            {transaction.risk_analysis.recommendation}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.processed_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                            <Eye size={16} />
                          </button>
                          {user.permissions.includes('APPROVE_TRANSACTIONS') && (
                            <>
                              <button className="text-green-600 hover:text-green-900 mr-3">
                                <CheckCircle size={16} />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="mr-2" size={20} />
                Risk Alert Configuration
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">High Value Transaction Alert</h4>
                      <p className="text-sm text-red-700">Triggers when transaction amount exceeds ₹5,00,000</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-red-600 mr-3">Active</span>
                      <div className="w-10 h-6 bg-red-600 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-yellow-900">Multiple Failed Transactions</h4>
                      <p className="text-sm text-yellow-700">Triggers when account has more than 5 failed transactions</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-yellow-600 mr-3">Active</span>
                      <div className="w-10 h-6 bg-yellow-600 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">International Transfer Alert</h4>
                      <p className="text-sm text-gray-700">Triggers for cross-border transactions</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-3">Inactive</span>
                      <div className="w-10 h-6 bg-gray-300 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Download className="mr-2" size={20} />
                Generate Reports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Daily Transaction Summary</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Comprehensive report of all transactions processed today
                  </p>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Download PDF
                  </button>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Risk Analysis Report</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Detailed analysis of high-risk transactions and patterns
                  </p>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Download Excel
                  </button>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Compliance Report</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    RBI compliance report for regulatory submission
                  </p>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Generate Report
                  </button>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Custom Report</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Create custom reports with specific filters and date ranges
                  </p>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
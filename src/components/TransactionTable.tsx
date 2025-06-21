import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Download } from 'lucide-react';
import { ProcessedTransaction } from '../types';

interface TransactionTableProps {
  transactions: ProcessedTransaction[];
  onDownloadReport: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  onDownloadReport 
}) => {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(t => 
      t.original_data.account_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.original_data.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.risk_analysis.risk_level.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'account_id':
            aValue = a.original_data.account_id;
            bValue = b.original_data.account_id;
            break;
          case 'amount':
            aValue = a.original_data.transaction_amount;
            bValue = b.original_data.transaction_amount;
            break;
          case 'risk_level':
            aValue = a.risk_analysis.risk_level;
            bValue = b.risk_analysis.risk_level;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [transactions, sortField, sortDirection, searchTerm]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTransactions, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'HIGH':
        return 'bg-red-500 text-white';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BLOCK':
        return 'bg-red-600 text-white';
      case 'QUARANTINE':
        return 'bg-orange-500 text-white';
      case 'REVIEW':
        return 'bg-yellow-500 text-white';
      case 'APPROVE':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const SortableHeader: React.FC<{ field: string; children: React.ReactNode }> = ({ 
    field, 
    children 
  }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-600"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="ml-1" size={16} /> : 
            <ChevronDown className="ml-1" size={16} />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Detailed Transaction Analysis
        </h3>
        <button
          onClick={onDownloadReport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center"
        >
          <Download className="mr-2" size={16} />
          Download Report
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-700">
            <tr>
              <SortableHeader field="account_id">Account ID</SortableHeader>
              <SortableHeader field="user_id">User ID</SortableHeader>
              <SortableHeader field="amount">Amount</SortableHeader>
              <SortableHeader field="risk_level">Risk Level</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Recommendation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Blockchain TX
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Model Prediction
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((transaction, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.original_data.account_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.original_data.user_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{transaction.original_data.transaction_amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevelColor(transaction.risk_analysis.risk_level)}`}>
                    {transaction.risk_analysis.risk_level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRecommendationColor(transaction.risk_analysis.recommendation)}`}>
                    {transaction.risk_analysis.recommendation}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {transaction.blockchain_tx.tx_hash.substring(0, 16)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-xs truncate">
                    {transaction.risk_analysis.risk_factors[0]}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm rounded ${
                  page === currentPage 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
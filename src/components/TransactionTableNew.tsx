import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  Download, 
  Upload,
  Search, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { DisplayTransaction } from '../types';

interface TransactionTableProps {
  transactions: DisplayTransaction[];
  onDownloadReport: () => void;
}

const SortableHeader: React.FC<{
  field: string;
  currentSortField: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  children: React.ReactNode;
}> = ({ field, currentSortField, sortDirection, onSort, children }) => (
  <th 
    scope="col" 
    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center">
      {children}
      {currentSortField === field && (
        <ArrowUpDown size={14} className="ml-1" />
      )}
    </div>
  </th>
);

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  onDownloadReport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>('transactionDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{success: boolean; message: string} | null>(null);
  const itemsPerPage = 10;
  
  // Function to upload transaction data to the database
  const handleUploadToDatabase = async () => {
    try {
      setIsUploading(true);
      setUploadStatus(null);
      
      console.log('Starting transaction upload process...');
      
      // Prepare data for upload - converting transactions to the format needed by the backend
      const transactionsToUpload = transactions.map(tx => ({
        accountNumber: tx.accountNumber,
        numberOfAccounts: tx.numberOfAccounts,
        reasonOfOpeningAccount: tx.reasonOfOpeningAccount,
        transactionAmount: tx.transactionAmount,
        transactionDate: tx.transactionDate,
        risk_analysis: {
          risk_level: tx.risk_analysis.risk_level,
          score_label: tx.risk_analysis.score_label,
          trust_score: (tx.risk_analysis as any).trust_score || 100 // Default trust score if not available
        }
      }));
      
      console.log(`Prepared ${transactionsToUpload.length} transactions for upload`);
      
      // Try the main transaction upload endpoint
      try {
        console.log('Attempting upload to transaction endpoint...');
        const response = await fetch('/api/transactions/upload-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ transactions: transactionsToUpload }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Upload successful:', data);
          
          setUploadStatus({
            success: true,
            message: `${data.uploadedCount} transactions uploaded successfully! ${data.accountsUpdated} accounts updated.`
          });
          return;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('Transaction endpoint failed:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error uploading transactions:', error);
      setUploadStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during upload'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(tx => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tx.accountNumber.toLowerCase().includes(searchLower) ||
      tx.reasonOfOpeningAccount.toLowerCase().includes(searchLower) ||
      tx.transactionDate.toLowerCase().includes(searchLower) ||
      tx.risk_analysis.score_label.toLowerCase().includes(searchLower)
    );
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortField) return 0;

    let aVal: any, bVal: any;

    switch (sortField) {
      case 'accountNumber':
        aVal = a.accountNumber;
        bVal = b.accountNumber;
        break;
      case 'transactionDate':
        aVal = new Date(a.transactionDate).getTime();
        bVal = new Date(b.transactionDate).getTime();
        break;
      case 'transactionAmount':
        aVal = a.transactionAmount;
        bVal = b.transactionAmount;
        break;
      case 'riskLevel':
        aVal = a.risk_analysis.risk_level;
        bVal = b.risk_analysis.risk_level;
        break;
      case 'numberOfAccounts':
        aVal = a.numberOfAccounts;
        bVal = b.numberOfAccounts;
        break;
      case 'reasonOfOpeningAccount':
          aVal = a.reasonOfOpeningAccount;
          bVal = b.reasonOfOpeningAccount;
          break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const pageCount = Math.max(1, Math.ceil(sortedTransactions.length / itemsPerPage));
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Risk level badge
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'LOW':
        return (
          <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            <CheckCircle className="mr-1" size={12} />
            Low
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="mr-1" size={12} />
            Moderate
          </span>
        );
      case 'HIGH':
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            <AlertOctagon className="mr-1" size={12} />
            {level.charAt(0) + level.slice(1).toLowerCase()}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mt-6">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 items-start md:items-center">
          <h3 className="text-lg font-semibold mb-3 md:mb-0">Transaction Analysis</h3>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="text-gray-400" size={18} />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleUploadToDatabase}
                disabled={isUploading}
                className={`${
                  isUploading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                } text-white flex items-center justify-center px-4 py-2 rounded transition-colors`}
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <>
                    <Upload size={18} className="mr-2" />
                    Upload to Database
                  </>
                )}
              </button>
              <button
                onClick={onDownloadReport}
                className="bg-indigo-600 text-white flex items-center justify-center px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
              >
                <Download size={18} className="mr-2" />
                Download Report
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader field="accountNumber" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Account Number</SortableHeader>
                <SortableHeader field="transactionDate" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Date</SortableHeader>
                <SortableHeader field="transactionAmount" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Amount</SortableHeader>
                <SortableHeader field="numberOfAccounts" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>No. of Accounts</SortableHeader>
                <SortableHeader field="reasonOfOpeningAccount" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Reason</SortableHeader>
                <SortableHeader field="riskLevel" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Risk Level</SortableHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.accountNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.transactionAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {transaction.numberOfAccounts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.reasonOfOpeningAccount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getRiskBadge(transaction.risk_analysis.risk_level)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Upload status indicator */}
        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-lg ${uploadStatus.success ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
            {uploadStatus.success ? (
              <div className="flex items-center">
                <CheckCircle size={18} className="mr-2" />
                {uploadStatus.message}
              </div>
            ) : (
              <div className="flex items-center">
                <AlertTriangle size={18} className="mr-2" />
                {uploadStatus.message}
              </div>
            )}
          </div>
        )}
        
        {pageCount > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} className="inline mr-1" />
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
              disabled={currentPage === pageCount}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} className="inline ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
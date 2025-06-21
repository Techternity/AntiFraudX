import React from 'react';
import { CheckCircle, AlertTriangle, AlertOctagon, Ban } from 'lucide-react';
import { SecurityStats } from '../types';

interface StatsCardsProps {
  stats: SecurityStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
          <CheckCircle size={24} />
        </div>
        <div>
          <div className="text-sm text-gray-500">Safe Transactions</div>
          <div className="text-2xl font-bold text-gray-800">{stats.safe_transactions}</div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((stats.safe_transactions / stats.total_transactions) * 100 || 0)}% of total
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
          <AlertTriangle size={24} />
        </div>
        <div>
          <div className="text-sm text-gray-500">Needs Review</div>
          <div className="text-2xl font-bold text-gray-800">{stats.needs_review}</div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((stats.needs_review / stats.total_transactions) * 100 || 0)}% of total
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
        <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
          <AlertOctagon size={24} />
        </div>
        <div>
          <div className="text-sm text-gray-500">High Risk</div>
          <div className="text-2xl font-bold text-gray-800">{stats.high_risk}</div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((stats.high_risk / stats.total_transactions) * 100 || 0)}% of total
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 flex items-start">
        <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
          <Ban size={24} />
        </div>
        <div>
          <div className="text-sm text-gray-500">Blocked</div>
          <div className="text-2xl font-bold text-gray-800">{stats.blocked_transactions}</div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((stats.blocked_transactions / stats.total_transactions) * 100 || 0)}% of total
          </div>
        </div>
      </div>
    </div>
  );
};
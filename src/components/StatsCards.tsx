import React from 'react';
import { FileText, Shield, AlertTriangle, Ban, Lock } from 'lucide-react';
import { SecurityStats } from '../types';

interface StatsCardsProps {
  stats: SecurityStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Transactions',
      value: stats.total_transactions.toLocaleString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-white',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Safe Transactions',
      value: stats.safe_transactions.toLocaleString(),
      icon: Shield,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-l-4 border-green-500'
    },
    {
      title: 'Needs Review',
      value: stats.needs_review.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-l-4 border-yellow-500'
    },
    {
      title: 'High Risk',
      value: stats.high_risk.toLocaleString(),
      icon: Ban,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-l-4 border-red-500'
    },
    {
      title: 'Blocked Transactions',
      value: stats.blocked_transactions.toLocaleString(),
      icon: Lock,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-l-4 border-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} ${card.borderColor} rounded-lg shadow-md p-6`}
        >
          <div className="flex items-center">
            <card.icon className={`${card.color} text-2xl mr-4`} size={32} />
            <div>
              <h3 className={`text-2xl font-bold ${card.color.replace('text-', 'text-gray-').replace('-700', '-800').replace('-600', '-800')}`}>
                {card.value}
              </h3>
              <p className="text-sm text-gray-600">{card.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
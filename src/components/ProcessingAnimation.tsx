import React from 'react';
import { Shield, Lock, Link, Target, AlertTriangle, Search, FileText, Loader } from 'lucide-react';
import { ProcessingStep } from '../types';

interface ProcessingAnimationProps {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  error?: string;
}

export const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({
  currentStep,
  totalSteps,
  isComplete,
  error
}) => {
  const steps: ProcessingStep[] = [
    { id: 0, name: "Validating Input Data", icon: "search", completed: currentStep > 0, active: currentStep === 0 },
    { id: 1, name: "Sanitizing Transaction Data", icon: "shield", completed: currentStep > 1, active: currentStep === 1 },
    { id: 2, name: "AES-256-GCM Encryption", icon: "lock", completed: currentStep > 2, active: currentStep === 2 },
    { id: 3, name: "Blockchain Merkle Tree Verification", icon: "link", completed: currentStep > 3, active: currentStep === 3 },
    { id: 4, name: "CIBYL Score Analysis", icon: "target", completed: currentStep > 4, active: currentStep === 4 },
    { id: 5, name: "Risk Assessment", icon: "alert-triangle", completed: currentStep > 5, active: currentStep === 5 },
    { id: 6, name: "Additional Security Checks", icon: "search", completed: currentStep > 6, active: currentStep === 6 },
    { id: 7, name: "Generating Security Report", icon: "file-text", completed: currentStep > 7, active: currentStep === 7 },
  ];

  const getIcon = (iconName: string, isActive: boolean, isCompleted: boolean) => {
    const className = `mr-3 ${
      isCompleted ? 'text-green-500' : 
      isActive ? 'text-blue-500' : 
      'text-gray-400'
    }`;
    
    const size = 20;
    
    switch (iconName) {
      case 'search': return <Search className={className} size={size} />;
      case 'shield': return <Shield className={className} size={size} />;
      case 'lock': return <Lock className={className} size={size} />;
      case 'link': return <Link className={className} size={size} />;
      case 'target': return <Target className={className} size={size} />;
      case 'alert-triangle': return <AlertTriangle className={className} size={size} />;
      case 'file-text': return <FileText className={className} size={size} />;
      default: return <Search className={className} size={size} />;
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="text-red-500 text-2xl mb-2 mx-auto" size={32} />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Security Alert</h3>
        <p className="text-red-600 mb-2">{error}</p>
        <p className="text-red-500 text-sm">Please verify input data and try again</p>
      </div>
    );
  }

  if (isComplete) {
    return null;
  }

  const progress = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
        <Loader className="animate-spin mr-2" size={20} />
        Processing Secure Transactions
      </h3>
      
      <div className="space-y-3 mb-6">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            {step.completed ? (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            ) : step.active ? (
              <Loader className="animate-spin text-blue-500 mr-3" size={20} />
            ) : (
              <div className="w-5 h-5 bg-gray-300 rounded-full mr-3" />
            )}
            <span className={`${
              step.completed ? 'text-green-700' : 
              step.active ? 'text-blue-700 font-semibold' : 
              'text-gray-500'
            }`}>
              {step.name}
            </span>
          </div>
        ))}
      </div>

      {currentStep >= 2 && (
        <div className="flex items-center mt-4 p-3 bg-blue-100 rounded-lg">
          <Lock className="text-blue-600 mr-2 animate-pulse" size={24} />
          <span className="text-blue-600 font-medium">Encryption Process Active</span>
        </div>
      )}

      {currentStep >= 3 && (
        <div className="flex items-center mt-2 p-3 bg-purple-100 rounded-lg">
          <Link className="text-purple-600 mr-2 animate-pulse" size={24} />
          <span className="text-purple-600 font-medium">Blockchain Verification Active</span>
        </div>
      )}

      <div className="mt-4">
        <div className="bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Processing: {Math.round(progress)}% Complete
        </p>
      </div>
    </div>
  );
};
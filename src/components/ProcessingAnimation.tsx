import React from 'react';
import { CheckCircle, AlertCircle, Loader, FileText, ShieldCheck, BarChart, LineChart, Lock } from 'lucide-react';

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
  const steps = [
    { name: 'Reading file', icon: FileText },
    { name: 'Parsing transactions', icon: BarChart },
    { name: 'Processing data', icon: LineChart },
    { name: 'Security verification', icon: ShieldCheck },
    { name: 'Risk assessment', icon: Lock },
    { name: 'Generating report', icon: FileText },
    { name: 'Finalizing', icon: CheckCircle },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">
        {error ? 'Processing Error' : isComplete ? 'Processing Complete' : 'Processing Transaction Data'}
      </h3>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="text-red-500 mr-3 mt-0.5" size={20} />
          <div>
            <p className="text-red-700 font-medium">Processing failed</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500">
              {isComplete ? 'Complete' : `${currentStep} of ${totalSteps} steps`}
            </div>
          </div>

          <div className="space-y-2">
            {steps.map((step, index) => {
              // Limited to first 7 steps for simplicity
              if (index >= totalSteps - 1) return null;

              const StepIcon = step.icon;
              const isCurrent = index === currentStep;
              const isComplete = index < currentStep;

              return (
                <div
                  key={index}
                  className={`flex items-center p-2 rounded-lg ${
                    isCurrent ? 'bg-blue-50' : isComplete ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      isCurrent
                        ? 'bg-blue-100 text-blue-600'
                        : isComplete
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCurrent ? (
                      <Loader className="animate-spin" size={16} />
                    ) : isComplete ? (
                      <CheckCircle size={16} />
                    ) : (
                      <StepIcon size={16} />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div
                      className={`text-sm ${
                        isCurrent
                          ? 'text-blue-700 font-medium'
                          : isComplete
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </div>
                    {isCurrent && (
                      <div className="text-xs text-blue-600">Processing...</div>
                    )}
                  </div>
                  {isComplete && (
                    <CheckCircle className="text-green-500" size={16} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
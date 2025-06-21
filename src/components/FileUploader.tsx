import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file only');
      return;
    }

    if (file.size > 52428800) { // 50MB
      setError('File size must be less than 50MB');
      return;
    }

    onFileUpload(file);
  }, [onFileUpload, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file only');
      return;
    }

    if (file.size > 52428800) { // 50MB
      setError('File size must be less than 50MB');
      return;
    }

    onFileUpload(file);
  }, [onFileUpload]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Upload className="mr-2" size={20} />
        Secure Transaction Data Upload
      </h3>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragActive 
            ? 'border-indigo-400 bg-indigo-50' 
            : disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="text-center">
          <Upload className={`mx-auto text-4xl mb-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} size={48} />
          <h4 className={`text-lg font-medium mb-2 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
            {disabled ? 'Upload Disabled' : 'Secure File Upload'}
          </h4>
          <p className={`text-sm mb-2 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
            CSV files only (max 50MB) | AES-256 Encrypted Transmission
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Required columns: account_id, user_id, transaction_amount, recipient_account, 
            sender_country, recipient_country, account_age_days, previous_failed_transactions, 
            transaction_type, purpose, sender_account_verified
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="text-red-500 mr-2" size={16} />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};
// Simple test script for upload functionality
const testData = {
  transactions: [
    {
      accountNumber: "TEST001",
      numberOfAccounts: 1,
      reasonOfOpeningAccount: "Test Account",
      transactionAmount: 1000,
      transactionDate: "2024-01-15T00:00:00.000Z",
      risk_analysis: {
        risk_level: "LOW",
        score_label: "Test Score",
        trust_score: 95
      }
    },
    {
      accountNumber: "TEST001", // Same account to test aggregation
      numberOfAccounts: 1,
      reasonOfOpeningAccount: "Test Account",
      transactionAmount: 500,
      transactionDate: "2024-01-16T00:00:00.000Z",
      risk_analysis: {
        risk_level: "MODERATE",
        score_label: "Test Score",
        trust_score: 85
      }
    }
  ]
};

async function testUpload() {
  try {
    console.log('Testing upload endpoint...');
    
    const response = await fetch('http://localhost:5000/api/transactions/upload-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('Response:', data);
    } else {
      console.log('❌ Upload failed:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUpload(); 
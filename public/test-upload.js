// Function to test the transaction upload API
async function testUpload() {
  try {
    const sampleTransactions = [
      {
        accountNumber: "TEST123456",
        numberOfAccounts: 2,
        reasonOfOpeningAccount: "Testing",
        transactionAmount: 1000,
        transactionDate: new Date().toISOString(),
        risk_analysis: {
          risk_level: "LOW",
          score_label: "Test Score",
          trust_score: 95
        }
      },
      {
        accountNumber: "TEST789012",
        numberOfAccounts: 1,
        reasonOfOpeningAccount: "API Testing",
        transactionAmount: 500,
        transactionDate: new Date().toISOString(),
        risk_analysis: {
          risk_level: "MODERATE",
          score_label: "Test Score",
          trust_score: 75
        }
      }
    ];

    console.log('Sample transactions prepared:', sampleTransactions);

    const response = await fetch('/api/transactions/upload-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transactions: sampleTransactions })
    });

    console.log('API response status:', response.status);
    
    const data = await response.json();
    console.log('API response data:', data);
    
    document.getElementById('result').textContent = JSON.stringify(data, null, 2);
    document.getElementById('status').textContent = 'Success!';
    document.getElementById('status').classList.add('success');
    document.getElementById('status').classList.remove('error');
  } catch (error) {
    console.error('Error testing upload:', error);
    document.getElementById('result').textContent = error.message;
    document.getElementById('status').textContent = 'Error!';
    document.getElementById('status').classList.add('error');
    document.getElementById('status').classList.remove('success');
  }
}
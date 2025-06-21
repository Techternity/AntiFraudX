import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

# Load model and preprocessors
model = joblib.load("xgboost_model.pkl")
le_reason = joblib.load("le_reason.pkl")
le_label = joblib.load("le_cybil.pkl")
scaler = joblib.load("scaler.pkl")

print(f"Model label encoder classes: {le_label.classes_}")
print(f"Model reason encoder classes: {le_reason.classes_}")

# Load test data
df = pd.read_csv("test_data.csv", dtype={'Account Number': str})
print(f"Test data shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

# Preprocess data (same as in app.py)
df_model = df.copy()
df_model.rename(columns={
    'Account Number': 'user_id',
    'transaction amount': 'transaction_amount',
    'transaction date': 'transaction_date'
}, inplace=True)

try:
    df_model['reason of opening account'] = le_reason.transform(df_model['reason of opening account'])
except ValueError as e:
    print(f"Error with reason encoding: {e}")
    exit(1)

df_model['avg_transaction_amount'] = df_model.groupby('user_id')['transaction_amount'].transform('mean')
df_model['transaction_frequency'] = df_model.groupby('user_id')['transaction_amount'].transform('count')
df_model['transaction_variance'] = df_model.groupby('user_id')['transaction_amount'].transform('var')

df_model.fillna(0, inplace=True)

features = ['number of accounts', 'reason of opening account', 'avg_transaction_amount',
            'transaction_frequency', 'transaction_variance']
X = df_model[features].copy()

numerical_cols = ['number of accounts', 'avg_transaction_amount',
                  'transaction_frequency', 'transaction_variance']
X[numerical_cols] = X[numerical_cols].astype(np.float64)

X.loc[:, numerical_cols] = scaler.transform(X[numerical_cols])

# Make predictions
predictions = model.predict(X)
score_labels = le_label.inverse_transform(predictions)

print(f"\nPrediction results:")
print(f"All predictions: {score_labels}")
print(f"Prediction counts:")
print(f"  good: {list(score_labels).count('good')}")
print(f"  moderate: {list(score_labels).count('moderate')}")
print(f"  bad: {list(score_labels).count('bad')}")

# Show some examples
print(f"\nSample predictions with data:")
for i in range(min(10, len(df))):
    print(f"Row {i+1}: Account {df.iloc[i]['Account Number']}, Amount {df.iloc[i]['transaction amount']}, Prediction: {score_labels[i]}")

# Check if any are 'bad'
bad_indices = [i for i, label in enumerate(score_labels) if label == 'bad']
if bad_indices:
    print(f"\nBad predictions found at indices: {bad_indices}")
    for idx in bad_indices[:5]:  # Show first 5 bad predictions
        row = df.iloc[idx]
        print(f"Bad prediction - Account: {row['Account Number']}, Amount: {row['transaction amount']}, Reason: {row['reason of opening account']}")
else:
    print(f"\nNo 'bad' predictions found in the test data!") 
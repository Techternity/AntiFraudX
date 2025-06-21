from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

app = FastAPI()

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
        "https://antifraudx-frontend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define base directory (directory of app.py)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Debug: Print environment details
print(f"Current working directory: {os.getcwd()}")
print(f"Base directory: {BASE_DIR}")
print(f"Files in backend directory: {os.listdir(BASE_DIR)}")

# Load model and preprocessors
try:
    model = joblib.load(os.path.join(BASE_DIR, "xgboost_model.pkl"))
    le_reason = joblib.load(os.path.join(BASE_DIR, "le_reason.pkl"))
    le_label = joblib.load(os.path.join(BASE_DIR, "le_cybil.pkl"))
    scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
    print("Models loaded successfully")
except FileNotFoundError as e:
    # This is a fallback for when the model files are not found.
    # In a real application, you would handle this more gracefully.
    print(f"Warning: Model or preprocessor file missing: {str(e)}. Using dummy model.")
    model = None
    le_reason = None
    le_label = None
    scaler = None

# Preprocess uploaded CSV
def preprocess_data(df):
    required_columns = ['Account Number', 'number of accounts', 'reason of opening account', 
                        'transaction amount', 'transaction date']

    if not all(col in df.columns for col in required_columns):
        missing = [col for col in required_columns if col not in df.columns]
        return None, f"Missing required columns in CSV: {', '.join(missing)}"
    
    # Make a copy for model input
    df_model = df.copy()
    df_model.rename(columns={
        'Account Number': 'user_id',
        'transaction amount': 'transaction_amount',
        'transaction date': 'transaction_date'
    }, inplace=True)

    try:
        df_model['reason of opening account'] = le_reason.transform(df_model['reason of opening account'])
    except ValueError:
        return None, "Unknown values in 'reason of opening account'. Please check the values in the file."

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

    return X, None

@app.post("/")
async def predict_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Please upload a valid CSV file")

    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded. Please add model files to the 'backend' directory.")

    try:
        contents = await file.read()
        # Ensure Account Number is read as a string to prevent type mismatches with the frontend.
        df = pd.read_csv(pd.io.common.BytesIO(contents), dtype={'Account Number': str})
        print(f"CSV loaded successfully. Shape: {df.shape}, Columns: {list(df.columns)}")
    except Exception as e:
        print(f"Error reading CSV: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error reading CSV: {str(e)}")

    try:
        X, error = preprocess_data(df)
        if error:
            print(f"Preprocessing error: {error}")
            raise HTTPException(status_code=400, detail=error)
        print(f"Preprocessing successful. Features shape: {X.shape}")
    except Exception as e:
        print(f"Preprocessing exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Preprocessing failed: {str(e)}")

    try:
        predictions = model.predict(X)
        score_labels = le_label.inverse_transform(predictions)
        print(f"Predictions successful. Sample predictions: {score_labels[:5]}")
        print(f"All predictions: {score_labels}")
        print(f"Prediction counts: good={list(score_labels).count('good')}, moderate={list(score_labels).count('moderate')}, bad={list(score_labels).count('bad')}")
    except Exception as e:
        print(f"Prediction exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    try:
        # Use the original DataFrame for results
        results = []
        for i, (_, row) in enumerate(df.iterrows()):
            result = {
                'user_id': row['Account Number'],
                'account_number': row['Account Number'],
                'number_of_accounts': row['number of accounts'],
                'reason_of_opening_account': row['reason of opening account'],
                'transaction_amount': float(row['transaction amount']),
                'transaction_date': row['transaction date'],
                'score_label': score_labels[i]
            }
            results.append(result)
        
        print(f"Results created successfully. Shape: {len(results)}")
        return results
    except Exception as e:
        print(f"Results creation exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Results creation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # The server will look for model files in the 'backend' directory.
    # Make sure to run this script from the root directory of the project.
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True) 
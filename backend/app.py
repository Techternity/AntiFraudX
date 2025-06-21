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
        "https://antifraudx-frontend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and preprocessors
try:
    model = joblib.load(os.path.join(BASE_DIR, "fraud_model.pkl"))
    le_reason = joblib.load(os.path.join(BASE_DIR, "le_reason.pkl"))
    le_label = joblib.load(os.path.join(BASE_DIR, "le_label.pkl"))
    scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
    #print("Models loaded successfully")
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
    # The user provided an image with columns. Based on the app.py provided,
    # these are the expected columns.
    required_columns = ['user_id', 'num_savings_accounts', 'num_current_accounts',
                        'transaction_amount', 'transaction_date', 'account_opening_reason']

    if not all(col in df.columns for col in required_columns):
        missing = [col for col in required_columns if col not in df.columns]
        return None, f"Missing required columns in CSV: {', '.join(missing)}"

    try:
        df['account_opening_reason'] = le_reason.transform(df['account_opening_reason'])
    except ValueError:
        return None, "Unknown values in 'account_opening_reason'. Please check the values in the file."

    df['avg_transaction_amount'] = df.groupby('user_id')['transaction_amount'].transform('mean')
    df['transaction_frequency'] = df.groupby('user_id')['transaction_amount'].transform('count')
    df['transaction_variance'] = df.groupby('user_id')['transaction_amount'].transform('var')

    df.fillna(0, inplace=True)

    features = ['num_savings_accounts', 'num_current_accounts', 'avg_transaction_amount',
                'transaction_frequency', 'transaction_variance', 'account_opening_reason']
    X = df[features].copy()

    numerical_cols = ['num_savings_accounts', 'num_current_accounts', 'avg_transaction_amount',
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
        # Ensure user_id is read as a string to prevent type mismatches with the frontend.
        df = pd.read_csv(pd.io.common.BytesIO(contents), dtype={'user_id': str})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV: {str(e)}")

    X, error = preprocess_data(df)
    if error:
        raise HTTPException(status_code=400, detail=error)

    predictions = model.predict(X)
    score_labels = le_label.inverse_transform(predictions)

    results = pd.DataFrame({
        'user_id': df['user_id'],
        'score_label': score_labels
    })

    return results.to_dict(orient='records')

if __name__ == "__main__":
    import uvicorn
    # The server will look for model files in the 'backend' directory.
    # Make sure to run this script from the root directory of the project.
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.app:app", host="0.0.0.0", port=port, reload=True) 
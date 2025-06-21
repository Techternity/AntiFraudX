# AntiFraudX

## Running the Application

This application consists of:
1. A frontend React application running on Vite
2. A backend Node.js/Express API server

### Installation

To install dependencies:

```bash
npm install
```

### Running in Development Mode

To run the frontend only (Vite server on port 5173):

```bash
npm run dev
```

To run the backend only (Node.js server on port 5000):

```bash
npm run dev:server
# or
node server.js
```

To run both frontend and backend concurrently:

```bash
npm run dev:all
```

### Accessing the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## API Endpoints

- User Authentication: `/api/auth`
- User Management: `/api/users`
- Data Analysis: `/api/analysis`

## Environment Variables

Make sure you have a `.env` file in the root directory with the following variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Troubleshooting

If you experience authentication issues, try the following:

1. Add a test user:
```bash
npm run test:user
```
This will create a user with the following credentials:
- Email: riyaz@gmail.com
- Password: riyaz@gmail.com
- Role: Bank Manager

2. Check if the backend API is working:
```bash
curl http://localhost:5000/api/debug
```
You should see a JSON response indicating the API is working.

3. Verify the user route:
```bash
curl http://localhost:5000/api/users/test
```
You should see a JSON response confirming the user routes are working.

4. Make sure both servers are running:
```bash
npm run dev:all
```
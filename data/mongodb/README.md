# MongoDB Data Directory

This directory is used for storing MongoDB data files if you run MongoDB locally. 

If you're using MongoDB Atlas (cloud), this directory is not needed.

## Running MongoDB locally

If you want to run MongoDB locally instead of using Atlas, you can start the MongoDB server with:

```bash
mongod --dbpath ./data/mongodb
```

Remember to update your .env file to point to your local MongoDB instance:

```
MONGO_URI=mongodb://localhost:27017/antifraudx
```
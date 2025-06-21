# Installation Instructions

Run the following commands to install the required dependencies:

```bash
# Install the concurrently package for running multiple commands
npm install concurrently --save-dev

# Install Vite and React plugin if not already installed
npm install vite @vitejs/plugin-react --save-dev

# Install other dependencies if missing
npm install
```

Then you can run the application using the commands described in the README.md file:

- Frontend only: `npm run dev`
- Backend only: `npm run dev:server` or `node server.js`
- Both together: `npm run dev:all`
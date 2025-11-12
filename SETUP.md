# Quick Setup Guide

Follow these steps to get your AI assistant up and running.

## Prerequisites

- Node.js (v14 or higher)
- npm
- OpenAI API key (get one at https://platform.openai.com/api-keys)

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file and add your OpenAI API key
# OPENAI_API_KEY=sk-your-actual-key-here

# Start the backend server
npm start
```

You should see: `Server is running on port 3001`

### 2. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm start
```

Your browser should automatically open http://localhost:3000

## Verification

1. You should see a chat interface in your browser
2. Type a message like "Hello, who are you?"
3. Click "Send"
4. You should receive an AI-generated response from OpenAI

## Troubleshooting

### "Error communicating with AI"

- Check that your OpenAI API key is correctly set in `backend/.env`
- Verify your API key is valid at https://platform.openai.com/api-keys
- Make sure you have credits in your OpenAI account

### "Failed to fetch" or CORS errors

- Ensure the backend server is running on port 3001
- Check that there are no firewall issues blocking the ports

### Backend won't start

- Run `npm install` again in the backend directory
- Check that port 3001 is not already in use
- Verify your `.env` file exists in the backend directory

## File Structure After Setup

```
gmail2/
├── backend/
│   ├── node_modules/
│   ├── .env                  (your API key - DO NOT COMMIT)
│   ├── .env.example         (template)
│   ├── .gitignore
│   ├── server.js
│   ├── departments.json
│   └── package.json
├── frontend/
│   ├── node_modules/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── ChatInterface.js
│   │   └── ChatInterface.css
│   └── package.json
└── README.md
```

## What's Happening Under the Hood

1. **Frontend (ChatInterface.js:21-35)** sends your message to the backend via POST request
2. **Backend (server.js:30-33)** receives the message and forwards it to OpenAI
3. **OpenAI** generates a response using GPT-3.5 Turbo
4. **Backend (server.js:35-36)** sends the AI response back to frontend
5. **Frontend** displays the AI's response in the chat interface

## Next Steps

Once everything is working, check out the README.md for information about:
- The departments endpoint
- Adding more features
- Deployment options

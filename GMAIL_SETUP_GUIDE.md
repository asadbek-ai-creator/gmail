# Gmail API Setup Guide

## Overview

This guide will walk you through setting up Gmail API integration for sending emails on behalf of the boss. This is a **one-time setup** process.

## Prerequisites

- Google Account (Gmail)
- Google Cloud Console access
- Node.js and npm installed

## Part A: Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "AI Assistant Email" (or your preferred name)
4. Click "Create"

### Step 2: Enable Gmail API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on "Gmail API"
4. Click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Click "Create"
4. Fill in required fields:
   - **App name**: AI Assistant
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. **Scopes**: Click "Add or Remove Scopes"
   - Search for "Gmail API"
   - Check: `https://www.googleapis.com/auth/gmail.send`
   - Click "Update"
   - Click "Save and Continue"
7. **Test users**: Click "Add Users"
   - Add the Gmail account you'll use to send emails
   - Click "Save and Continue"
8. Click "Back to Dashboard"

### Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "AI Assistant Web Client"
5. **Authorized redirect URIs**:
   - Add: `http://localhost:3001/api/auth/google/callback`
6. Click "Create"
7. **Download the credentials:**
   - A popup will show your Client ID and Client Secret
   - Copy these values (you'll need them next)

## Part B: Configure Backend

### Step 1: Update .env File

Open `backend/.env` and add your Google credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

Replace `your_actual_client_id_here` and `your_actual_client_secret_here` with the values from Google Cloud Console.

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

This will install the `googleapis` package needed for Gmail integration.

### Step 3: Start the Backend Server

```bash
npm start
```

You should see: `Server is running on port 3001`

## Part C: Authorize the Application (One-Time)

This is the **critical one-time setup** that gives your application permission to send emails.

### Step 1: Get the Authorization URL

Open your browser or use curl:

**Option A: Browser**
```
http://localhost:3001/api/auth/google
```

**Option B: Terminal**
```bash
curl http://localhost:3001/api/auth/google
```

This will return:
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### Step 2: Visit the Authorization URL

1. Copy the `authUrl` from the response
2. Paste it in your browser
3. You'll see Google's consent screen

### Step 3: Grant Permission

1. **Sign in** with the Gmail account you want to use
2. You may see a warning "Google hasn't verified this app"
   - Click "Advanced"
   - Click "Go to AI Assistant (unsafe)"
   - This is safe because it's your own application
3. Review the permissions:
   - "Send email on your behalf"
4. Click "Allow"

### Step 4: Success!

After clicking "Allow":
- Google will redirect you to `http://localhost:3001/api/auth/google/callback`
- You'll see a success page: **"Authorization Successful!"**
- A file `user_token.json` has been created in your backend directory
- **This token is permanent** - you won't need to do this again

### Step 5: Verify Token Storage

Check that the token file was created:

```bash
ls backend/user_token.json
```

**IMPORTANT:** This file contains your refresh token. Never commit it to git! It's already in `.gitignore`.

## Part D: Test Email Sending

### Test 1: Direct API Call

```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "test@example.com",
    "subject": "Test Email from AI Assistant",
    "body": "This is a test email sent via Gmail API."
  }'
```

**Expected Response:**
```json
{
  "message": "Task sent successfully!",
  "emailId": "18c..."
}
```

### Test 2: Using the UI

1. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

2. Open http://localhost:3000

3. Create a task:
   - Type: "Tell marketing to create a new ad plan"
   - Click: **"Create Task"** (green button)

4. Confirm in modal:
   - Review the task details
   - Click: **"Confirm & Send"**

5. Check your Gmail "Sent" folder - the email should be there!

## Troubleshooting

### Error: "Not authenticated"

**Cause:** The `user_token.json` file is missing or invalid.

**Solution:** Repeat Part C (Authorization process).

### Error: "Authentication expired"

**Cause:** The refresh token is invalid or revoked.

**Solution:**
1. Delete `backend/user_token.json`
2. Repeat Part C (Authorization process)

### Error: "Failed to generate authentication URL"

**Cause:** Missing or incorrect Google credentials in `.env`

**Solution:**
1. Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly in `backend/.env`
2. Verify the values match those from Google Cloud Console

### Gmail Not Receiving Emails

**Cause:** Incorrect recipient email or Gmail API not enabled.

**Solution:**
1. Verify the recipient email address is correct
2. Check Gmail API is enabled in Google Cloud Console
3. Check spam folder
4. Verify the test user is added in OAuth consent screen

## Security Best Practices

### ✅ DO:
- Keep `user_token.json` and `.env` in `.gitignore`
- Use environment variables for all secrets
- Regularly review authorized apps in Google Account settings
- Use test users during development

### ❌ DON'T:
- Never commit `user_token.json` or `.env` to git
- Never share your client secret publicly
- Never hard-code credentials in source files

## Token Lifecycle

### How Tokens Work:

1. **Authorization Code** (one-time use)
   - Generated when user grants permission
   - Exchanged for tokens

2. **Access Token** (short-lived, ~1 hour)
   - Used to make API calls
   - Automatically refreshed by the application

3. **Refresh Token** (permanent)
   - Stored in `user_token.json`
   - Used to get new access tokens
   - Never expires (unless revoked)

### Automatic Token Refresh

The application automatically handles token refresh:
- Checks if access token is expired before each email
- Uses refresh token to get new access token
- Saves updated tokens to `user_token.json`
- No user action required!

## Revoking Access

If you need to revoke access:

1. Go to [Google Account](https://myaccount.google.com/)
2. Navigate to "Security" → "Third-party apps with account access"
3. Find "AI Assistant"
4. Click "Remove Access"
5. Delete `backend/user_token.json`

## File Structure After Setup

```
backend/
├── .env                    # Contains Google credentials (secret)
├── .env.example           # Template for .env
├── .gitignore            # Includes user_token.json
├── user_token.json       # OAuth tokens (created after auth, secret)
├── server.js             # Contains auth and send-email endpoints
├── package.json          # Includes googleapis dependency
└── departments.json      # Department data
```

## API Endpoints Summary

### GET /api/auth/google
- Generates OAuth consent URL
- Returns: `{ "authUrl": "https://..." }`

### GET /api/auth/google/callback
- Handles OAuth callback from Google
- Saves tokens to `user_token.json`
- Shows success/error page

### POST /api/send-email
- Sends email via Gmail API
- Required fields: `recipientEmail`, `subject`, `body`
- Returns: `{ "message": "Task sent successfully!" }`

## Next Steps

After completing this setup:

1. ✅ Backend is configured with Google credentials
2. ✅ User has authorized the application
3. ✅ Refresh token is saved in `user_token.json`
4. ✅ Application can now send emails automatically

**You're ready to send tasks via email!** 🚀

The boss can now:
1. Type a task in natural language
2. Click "Create Task"
3. Review the task in the modal
4. Click "Confirm & Send"
5. Email is sent automatically via Gmail! ✉️

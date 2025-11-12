const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Gmail API scopes
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// Part A: OAuth 2.0 Authentication Endpoints
// ============================================

// GET /api/auth/google - Generate Google OAuth consent URL
app.get('/api/auth/google', (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request refresh token
      scope: SCOPES,
      prompt: 'consent' // Force consent screen to ensure refresh token
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// GET /api/auth/google/callback - Handle OAuth callback
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // For Vercel, we need to store tokens differently (e.g., in a database)
    // For now, we'll return them to the client
    console.log('Tokens received successfully');

    // Send success page to user
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f0f0f0;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              text-align: center;
            }
            .success {
              color: #28a745;
              font-size: 48px;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓</div>
            <h1>Authorization Successful!</h1>
            <p>You have successfully connected your Gmail account.</p>
            <p>You can now close this window and return to the application.</p>
            <p style="font-size: 12px; margin-top: 20px;">Note: For production use, implement proper token storage.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Failed</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f0f0f0;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              text-align: center;
            }
            .error {
              color: #dc3545;
              font-size: 48px;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">✗</div>
            <h1>Authorization Failed</h1>
            <p>There was an error connecting your Gmail account.</p>
            <p>Please try again or contact support.</p>
          </div>
        </body>
      </html>
    `);
  }
});

// POST /api/chat - OpenAI integration endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Call OpenAI API with multilingual support
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful multilingual assistant. You can respond in English, Russian (Русский), and Uzbek (O\'zbek). Automatically detect the language of the user\'s question and respond in the SAME language. Provide concise, brief, and direct answers. Keep responses short unless more detail is specifically requested. If the user writes in English, respond in English. If in Russian, respond in Russian. If in Uzbek, respond in Uzbek.'
        },
        { role: 'user', content: message }
      ],
      model: 'gpt-3.5-turbo',
      max_tokens: 200,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    res.json({ message: aiResponse });

  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    res.status(500).json({ error: 'Error communicating with AI' });
  }
});

// POST /api/create-task - AI Agent for task parsing
app.post('/api/create-task', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    // Strict system prompt - forces JSON-only responses, no conversation
    const systemPrompt = `You are a highly specialized AI agent. Your ONLY purpose is to analyze the user's text and extract structured data from it. You MUST NOT provide explanations, advice, or any conversational text. You MUST ONLY respond with a JSON object.

The JSON object must have one of two formats:

1. If you successfully identify the department and the task, respond with:
{
  "department_keyword": "a_single_lowercase_keyword_for_the_department",
  "task_description": "the_clear_and_concise_task"
}

2. If you CANNOT clearly identify the department or the task from the text, respond with:
{
  "error": "Could not determine the department or task."
}

Here is the user's text:
"${text}"`;

    // Call OpenAI API with JSON mode
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      model: 'gpt-3.5-turbo-1106',
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const aiResponse = completion.choices[0].message.content;
    const parsedData = JSON.parse(aiResponse);

    // Validate response - check for error from AI
    if (parsedData.error) {
      return res.status(400).json({
        error: parsedData.error
      });
    }

    // Validate that we have the required fields
    if (!parsedData.department_keyword || !parsedData.task_description) {
      return res.status(400).json({
        error: 'Could not extract task information from the text.'
      });
    }

    // Step 5: Identify the Department - Load departments and find match
    const departmentsPath = path.join(process.cwd(), 'backend', 'departments.json');
    let departmentsData;

    try {
      const fileData = fs.readFileSync(departmentsPath, 'utf8');
      departmentsData = JSON.parse(fileData);
    } catch (fileError) {
      console.error('Error reading departments file:', fileError);
      return res.status(500).json({ error: 'Failed to load department data' });
    }

    // Find the matching department by keyword
    const department = departmentsData.find(dept =>
      dept.name.toLowerCase().includes(parsedData.department_keyword.toLowerCase()) ||
      parsedData.department_keyword.toLowerCase().includes(dept.name.toLowerCase().split(' ')[0])
    );

    if (!department) {
      return res.status(400).json({
        error: `Department "${parsedData.department_keyword}" not found. Please specify a valid department (marketing, finance, hr, it, sales).`
      });
    }

    // Step 6: Assemble Confirmation Data
    // Auto-generate a subject line from the task description
    const subject = `New Task: ${parsedData.task_description.charAt(0).toUpperCase() + parsedData.task_description.slice(0, 50)}${parsedData.task_description.length > 50 ? '...' : ''}`;

    const confirmationData = {
      recipientEmail: department.email,
      recipientName: department.name,
      subject: subject,
      body: parsedData.task_description
    };

    // Step 7: Return the Result
    res.status(200).json(confirmationData);

  } catch (error) {
    console.error('Error parsing task:', error);
    res.status(500).json({ error: 'Error parsing task with AI' });
  }
});

// ============================================
// Part B: Email Sending Endpoint
// ============================================

// POST /api/send-email - Send email via Gmail API
app.post('/api/send-email', async (req, res) => {
  const { recipientEmail, subject, body, tokens } = req.body;

  // Validate input
  if (!recipientEmail || !subject || !body) {
    return res.status(400).json({
      error: 'Missing required fields: recipientEmail, subject, and body are required'
    });
  }

  if (!tokens) {
    return res.status(401).json({
      error: 'Not authenticated. Please authorize the application first.',
      authRequired: true
    });
  }

  try {
    // Step 2: Set credentials and refresh token if needed
    oauth2Client.setCredentials(tokens);

    // Check if token needs refresh
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      console.log('Token expired, refreshing...');
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
    }

    // Step 3: Construct the email in RFC 2822 format
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const emailLines = [
      `To: ${recipientEmail}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      body
    ];

    const email = emailLines.join('\r\n');

    // Step 4: Encode email in base64url format
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Step 5: Send the email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });

    console.log('Email sent successfully:', response.data);

    // Step 6: Return success response
    res.status(200).json({
      message: 'Task sent successfully!',
      emailId: response.data.id
    });

  } catch (error) {
    console.error('Error sending email:', error);

    // Handle specific error cases
    if (error.code === 401 || error.message.includes('invalid_grant')) {
      return res.status(401).json({
        error: 'Authentication expired. Please re-authorize the application.',
        authRequired: true
      });
    }

    res.status(500).json({
      error: 'Failed to send email. Please try again.',
      details: error.message
    });
  }
});

// GET /api/departments - Return departments data
app.get('/api/departments', (req, res) => {
  const departmentsPath = path.join(process.cwd(), 'backend', 'departments.json');

  fs.readFile(departmentsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading departments file:', err);
      return res.status(500).json({ error: 'Failed to read departments data' });
    }

    try {
      const departments = JSON.parse(data);
      res.json(departments);
    } catch (parseError) {
      console.error('Error parsing departments file:', parseError);
      res.status(500).json({ error: 'Failed to parse departments data' });
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export the Express app for Vercel
module.exports = app;

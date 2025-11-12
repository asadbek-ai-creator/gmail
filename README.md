# AI Assistant - Basic Foundation

A simple AI assistant application with a React frontend and Node.js/Express backend.

## Project Structure

```
gmail2/
├── backend/
│   ├── server.js
│   ├── departments.json
│   └── package.json
└── frontend/
    └── (React app files)
```

## Backend Setup

The backend provides six endpoints:

1. **POST /api/chat** - Sends messages to OpenAI and returns AI responses
2. **POST /api/create-task** - AI Agent that parses natural language to extract department and task info
3. **POST /api/send-email** - Sends email via Gmail API
4. **GET /api/auth/google** - Generates OAuth consent URL for Gmail authorization
5. **GET /api/auth/google/callback** - Handles OAuth callback and stores tokens
6. **GET /api/departments** - Returns department data from departments.json

### Environment Configuration

Before running the backend, you need to configure API keys:

1. Copy the `.env.example` file to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **OpenAI API Key**:
   - Get from: https://platform.openai.com/api-keys
   - Add to `.env`: `OPENAI_API_KEY=sk-your-actual-key-here`

3. **Google OAuth Credentials** (for email sending):
   - Follow **GMAIL_SETUP_GUIDE.md** for complete Google Cloud Console setup
   - Get Client ID and Client Secret from Google Cloud Console
   - Add to `.env`:
     ```
     GOOGLE_CLIENT_ID=your_google_client_id_here
     GOOGLE_CLIENT_SECRET=your_google_client_secret_here
     GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
     ```

4. **One-Time Gmail Authorization**:
   - After configuring credentials, visit `http://localhost:3001/api/auth/google`
   - Follow the OAuth flow to authorize Gmail access
   - See **GMAIL_SETUP_GUIDE.md** for detailed instructions

### Running the Backend

```bash
cd backend
npm install
npm start
```

The backend will run on http://localhost:3001

## Frontend Setup

The frontend provides a dual-function interface with:
- Input box for typing messages or describing tasks
- **"Ask" button** - For general chat/questions
- **"Create Task" button** - For creating department tasks
- Display area showing the conversation
- Task confirmation modal
- Loading indicator while waiting for responses

### Running the Frontend

```bash
cd frontend
npm start
```

The frontend will run on http://localhost:3000

## Testing the Application

### Quick Start

1. Make sure you've configured your OpenAI API key in the backend `.env` file
2. Start the backend server first (on port 3001)
3. Start the frontend development server (on port 3000)
4. Open http://localhost:3000 in your browser

### Testing Chat Function

1. Type a question: "What is artificial intelligence?"
2. Click the **"Ask"** button (blue)
3. You should receive an AI-generated response from OpenAI

### Testing Task Creation

1. Type a task: "Tell marketing to create a new ad plan"
2. Click the **"Create Task"** button (green)
3. A modal will appear showing:
   - **To:** Marketing (marketing@company.com)
   - **Subject:** New Task: Create a new ad plan
   - **Message:** create a new ad plan
4. Click **"Confirm & Send"** to confirm, or **"Cancel"** to abort
5. A confirmation message will appear in the chat

## Testing the AI Agent Endpoint

The `/api/create-task` endpoint uses AI to parse natural language, lookup departments, and create email-ready task data:

```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell marketing to create a new ad plan"}'
```

**Response:**
```json
{
  "recipientEmail": "marketing@company.com",
  "recipientName": "Marketing",
  "subject": "New Task: Create a new ad plan",
  "body": "create a new ad plan"
}
```

**Complete 7-Step Pipeline:**
1. Validate input
2. Engineer AI prompt (strict JSON-only)
3. Call OpenAI API
4. Validate AI response
5. Lookup department in departments.json
6. Assemble complete email-ready data
7. Return result

For detailed documentation, see `backend/API_ENDPOINT_GUIDE.md`
For test examples, see `backend/TEST_AGENT.md`

## Testing the Departments Endpoint

You can test the departments endpoint using curl or a browser:

```bash
curl http://localhost:3001/api/departments
```

Or visit http://localhost:3001/api/departments in your browser.

## Sample Departments

The application includes these sample departments:
- Marketing (marketing@company.com)
- Finance (finance@company.com)
- Human Resources (hr@company.com)
- IT Support (it@company.com)
- Sales (sales@company.com)

## Features Implemented

- ✅ OpenAI GPT-3.5 Turbo integration for intelligent responses
- ✅ **Complete 7-step task creation pipeline:**
  - Input validation
  - AI prompt engineering (strict JSON-only)
  - OpenAI API integration
  - Response validation
  - Department lookup from departments.json
  - Email-ready data assembly
  - Structured response delivery
- ✅ **Gmail API Integration (OAuth 2.0):**
  - One-time authorization flow
  - Permanent refresh token storage
  - Automatic token refresh
  - RFC 2822 email construction
  - Real email sending via Gmail
- ✅ Auto-generated email subjects from task descriptions
- ✅ Smart department matching (fuzzy logic)
- ✅ Dual-function UI with separate "Ask" and "Create Task" buttons
- ✅ Enhanced task confirmation modal showing:
  - Recipient name and email
  - Auto-generated subject
  - Task message body
- ✅ Real-time chat interface with message history
- ✅ Departments API endpoint with sample data
- ✅ Environment-based configuration for security
- ✅ Comprehensive error handling (never crashes)
- ✅ Professional, intuitive user experience
- ✅ **Actually sends emails!** ✉️

## Next Steps

**Future Enhancements:**
- Add task history and database storage
- Implement user authentication and authorization
- Add conversation history/context to chat
- Email templates and formatting options
- Attachment support
- Deploy to production environment
- Multiple user support
- Task scheduling and reminders

## Documentation

### Setup Guides
- **SETUP.md** - Quick setup guide for getting started
- **GMAIL_SETUP_GUIDE.md** - Complete Gmail API and OAuth 2.0 setup instructions

### API Documentation
- **API_ENDPOINT_GUIDE.md** - Complete documentation of the /api/create-task endpoint
- **GMAIL_INTEGRATION_COMPLETE.md** - Gmail integration implementation details
- **TEST_AGENT.md** - Testing examples for the create-task endpoint

### Implementation Details
- **COMPLETE_TASK_ENDPOINT.md** - Task creation endpoint implementation summary
- **SPRINT_REFACTOR.md** - Agent Tuning & UI Clarification sprint documentation
- **UI_GUIDE.md** - Visual guide with interface diagrams
- **QUICK_REFERENCE.md** - Quick reference card for endpoints

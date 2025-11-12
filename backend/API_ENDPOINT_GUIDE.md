# API Endpoint Guide: POST /api/create-task

## Overview

The `/api/create-task` endpoint is an intelligent task creation system that uses AI to parse natural language input and generate structured task data ready for email delivery.

## Endpoint Details

- **Method:** POST
- **Path:** `/api/create-task`
- **Content-Type:** `application/json`

## Complete Flow

```
User Input → AI Analysis → Department Lookup → Data Assembly → Response
```

## Step-by-Step Logic

### Step 1: Accept Input

**Request Format:**
```json
{
  "text": "Tell marketing to create a new ad plan"
}
```

**Validation:**
- Text field is required
- If empty or missing, returns 400 error

### Step 2: Engineer the AI Prompt

The endpoint creates a strict system prompt that:
- Commands AI to **only return JSON** (no conversation)
- Specifies two possible response formats
- Forbids explanations or advice

**System Prompt:**
```
You are a highly specialized AI agent. Your ONLY purpose is to analyze
the user's text and extract structured data from it. You MUST NOT provide
explanations, advice, or any conversational text. You MUST ONLY respond
with a JSON object.

The JSON object must have one of two formats:

1. If you successfully identify the department and the task, respond with:
{
  "department_keyword": "a_single_lowercase_keyword_for_the_department",
  "task_description": "the_clear_and_concise_task"
}

2. If you CANNOT clearly identify the department or the task from the text,
respond with:
{
  "error": "Could not determine the department or task."
}
```

### Step 3: Call the AI and Get Response

**OpenAI Configuration:**
```javascript
{
  model: 'gpt-3.5-turbo-1106',
  response_format: { type: 'json_object' },  // Enforces JSON
  temperature: 0.2,  // Low for accuracy
  messages: [{ role: 'system', content: systemPrompt }]
}
```

**AI Response Examples:**

Success:
```json
{
  "department_keyword": "marketing",
  "task_description": "create a new ad plan"
}
```

Error:
```json
{
  "error": "Could not determine the department or task."
}
```

### Step 4: Validate the Response

**Validation Checks:**

1. **Check for AI-returned error:**
   ```javascript
   if (parsedData.error) {
     return res.status(400).json({ error: parsedData.error });
   }
   ```

2. **Check for required fields:**
   ```javascript
   if (!parsedData.department_keyword || !parsedData.task_description) {
     return res.status(400).json({
       error: 'Could not extract task information from the text.'
     });
   }
   ```

### Step 5: Identify the Department

**Process:**
1. Load `departments.json` file
2. Search for matching department using keyword
3. Match by name or keyword substring

**Matching Logic:**
```javascript
const department = departmentsData.find(dept =>
  dept.name.toLowerCase().includes(parsedData.department_keyword.toLowerCase()) ||
  parsedData.department_keyword.toLowerCase().includes(dept.name.toLowerCase().split(' ')[0])
);
```

**Example Matches:**
- "marketing" → Marketing
- "finance" → Finance
- "hr" → Human Resources
- "it" → IT Support
- "sales" → Sales

**If not found:**
```json
{
  "error": "Department \"xyz\" not found. Please specify a valid department (marketing, finance, hr, it, sales)."
}
```

### Step 6: Assemble Confirmation Data

**Subject Generation:**
- Takes first 50 characters of task description
- Capitalizes first letter
- Adds "New Task: " prefix
- Adds "..." if truncated

```javascript
const subject = `New Task: ${taskDescription.charAt(0).toUpperCase() + taskDescription.slice(0, 50)}${taskDescription.length > 50 ? '...' : ''}`;
```

**Final Object:**
```javascript
{
  recipientEmail: department.email,     // From departments.json
  recipientName: department.name,       // From departments.json
  subject: subject,                     // Auto-generated
  body: parsedData.task_description    // From AI
}
```

### Step 7: Return the Result

**Success Response (200 OK):**
```json
{
  "recipientEmail": "marketing@company.com",
  "recipientName": "Marketing",
  "subject": "New Task: Create a new ad plan",
  "body": "create a new ad plan"
}
```

## Error Handling

### 400 Bad Request Errors

| Error | Cause | Response |
|-------|-------|----------|
| Text required | Missing/empty text field | `{"error": "Text is required"}` |
| AI couldn't parse | Unclear input | `{"error": "Could not determine the department or task."}` |
| Missing fields | Incomplete AI response | `{"error": "Could not extract task information from the text."}` |
| Department not found | Invalid department keyword | `{"error": "Department \"xyz\" not found..."}` |

### 500 Internal Server Errors

| Error | Cause | Response |
|-------|-------|----------|
| File read error | departments.json not found/corrupted | `{"error": "Failed to load department data"}` |
| AI error | OpenAI API failure | `{"error": "Error parsing task with AI"}` |

## Testing Examples

### Test 1: Successful Task Creation

**Request:**
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

### Test 2: Different Department

**Request:**
```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "Ask finance to review the Q4 budget report by Friday"}'
```

**Response:**
```json
{
  "recipientEmail": "finance@company.com",
  "recipientName": "Finance",
  "subject": "New Task: Review the Q4 budget report by Friday",
  "body": "review the Q4 budget report by Friday"
}
```

### Test 3: HR with Abbreviation

**Request:**
```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "HR needs to schedule interviews for the senior developer position"}'
```

**Response:**
```json
{
  "recipientEmail": "hr@company.com",
  "recipientName": "Human Resources",
  "subject": "New Task: Schedule interviews for the senior develop...",
  "body": "schedule interviews for the senior developer position"
}
```

### Test 4: Unclear Input (Error)

**Request:**
```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello there!"}'
```

**Response (400):**
```json
{
  "error": "Could not determine the department or task."
}
```

### Test 5: Invalid Department (Error)

**Request:**
```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell engineering to fix the bug"}'
```

**Response (400):**
```json
{
  "error": "Department \"engineering\" not found. Please specify a valid department (marketing, finance, hr, it, sales)."
}
```

## Frontend Integration

The response from this endpoint is designed to be directly used in the confirmation modal:

```javascript
// Frontend receives:
{
  recipientEmail: "marketing@company.com",
  recipientName: "Marketing",
  subject: "New Task: Create a new ad plan",
  body: "create a new ad plan"
}

// Modal displays:
To: Marketing
    marketing@company.com

Subject: New Task: Create a new ad plan

Message: create a new ad plan

[Cancel] [Confirm & Send]
```

## Code Location

**Backend Implementation:** `backend/server.js` (lines 52-149)

**Key Components:**
- Input validation (line 56-58)
- AI prompt engineering (line 62-78)
- OpenAI API call (line 81-88)
- Response validation (line 94-105)
- Department lookup (line 107-129)
- Data assembly (line 131-140)
- Response return (line 143)

## Dependencies

- `openai` - OpenAI SDK for AI calls
- `fs` - File system for reading departments.json
- `path` - Path resolution for file location
- `express` - Web framework

## Notes

- The endpoint never crashes; it always returns a clear error message
- Department matching is case-insensitive and fuzzy
- Subject lines are auto-truncated at 50 characters
- Temperature is set low (0.2) for consistent, accurate parsing
- JSON mode is enforced to prevent conversational responses

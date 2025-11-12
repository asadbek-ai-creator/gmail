# Testing the AI Agent Endpoint

## POST /api/create-task

This endpoint uses AI to analyze natural language and extract the department and task information.

## How It Works

1. **Input**: A natural language text string
2. **AI Processing**: OpenAI analyzes the text using a system prompt
3. **Output**: JSON with `department_keyword` and `task_description`

## Test Examples

### Example 1: Marketing Task

**Request:**
```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell marketing to create a new ad plan"}'
```

**Expected Response:**
```json
{
  "recipientEmail": "marketing@company.com",
  "recipientName": "Marketing",
  "subject": "New Task: Create a new ad plan",
  "body": "create a new ad plan"
}
```

### Example 2: Finance Task

**Request:**
```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "Ask finance to review the Q4 budget report"}'
```

**Expected Response:**
```json
{
  "recipientEmail": "finance@company.com",
  "recipientName": "Finance",
  "subject": "New Task: Review the Q4 budget report",
  "body": "review the Q4 budget report"
}
```

### Example 3: HR Task

**Request:**
```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "HR needs to schedule interviews for the senior developer position"}'
```

**Expected Response:**
```json
{
  "recipientEmail": "hr@company.com",
  "recipientName": "Human Resources",
  "subject": "New Task: Schedule interviews for the senior develop...",
  "body": "schedule interviews for the senior developer position"
}
```

### Example 4: IT Support Task

**Request:**
```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "IT should fix the printer on the 3rd floor"}'
```

**Expected Response:**
```json
{
  "recipientEmail": "it@company.com",
  "recipientName": "IT Support",
  "subject": "New Task: Fix the printer on the 3rd floor",
  "body": "fix the printer on the 3rd floor"
}
```

### Example 5: Sales Task

**Request:**
```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "Have sales follow up with the new leads from the conference"}'
```

**Expected Response:**
```json
{
  "recipientEmail": "sales@company.com",
  "recipientName": "Sales",
  "subject": "New Task: Follow up with the new leads from the confe...",
  "body": "follow up with the new leads from the conference"
}
```

## Using PowerShell (Windows)

If you're on Windows and prefer PowerShell:

```powershell
$body = @{
    text = "Tell marketing to create a new ad plan"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/create-task" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

## Using JavaScript/Fetch

```javascript
fetch('http://localhost:3001/api/create-task', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Tell marketing to create a new ad plan'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## How the System Prompt Works

The endpoint uses this system prompt (see server.js:62-67):

```
You are an expert assistant. Analyze the user's text and return a JSON object
with two keys: "department_keyword" and "task_description".

The department_keyword should be a single word identifying the department
(e.g., "marketing", "finance", "hr", "it", "sales").
The task_description should be a clear, concise description of what needs to be done.

Return ONLY valid JSON, nothing else.
```

## Technical Details

- **Model**: gpt-3.5-turbo-1106
- **Response Format**: JSON mode (enforced)
- **Temperature**: 0.2 (more deterministic, less creative)
- **Endpoint**: POST /api/create-task
- **Input Field**: `text`
- **Output Fields**: `recipientEmail`, `recipientName`, `subject`, `body`

## Complete Processing Pipeline

1. **AI Analysis**: User text → department_keyword + task_description
2. **Department Lookup**: department_keyword → Match in departments.json
3. **Data Assembly**: Create final response object with:
   - `recipientEmail`: From departments.json
   - `recipientName`: From departments.json
   - `subject`: Auto-generated from task (max 50 chars)
   - `body`: Task description from AI

## Response Format Explanation

The endpoint returns a fully assembled task object ready for email sending:

```json
{
  "recipientEmail": "department@company.com",  // Email address
  "recipientName": "Department Name",          // Full department name
  "subject": "New Task: [Task summary]",       // Auto-generated subject
  "body": "task description"                   // Full task description
}
```

This object is designed to be directly used in:
- Frontend confirmation modal display
- Email sending (future implementation)

## Error Handling

### Text is missing:
```json
{
  "error": "Text is required"
}
```

### AI cannot determine task:
```json
{
  "error": "Could not determine the department or task."
}
```

### Department not found:
```json
{
  "error": "Department \"xyz\" not found. Please specify a valid department (marketing, finance, hr, it, sales)."
}
```

### Server error:
```json
{
  "error": "Error parsing task with AI"
}
```

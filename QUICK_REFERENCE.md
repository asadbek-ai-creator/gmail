# Quick Reference Card

## POST /api/create-task - Complete Implementation

### Input
```json
{
  "text": "Tell marketing to create a new ad plan"
}
```

### Output
```json
{
  "recipientEmail": "marketing@company.com",
  "recipientName": "Marketing",
  "subject": "New Task: Create a new ad plan",
  "body": "create a new ad plan"
}
```

### 7-Step Pipeline

| Step | Action | Location |
|------|--------|----------|
| 1 | Validate input | Line 56-58 |
| 2 | Engineer AI prompt | Line 62-78 |
| 3 | Call OpenAI | Line 81-88 |
| 4 | Validate response | Line 94-105 |
| 5 | Lookup department | Line 107-129 |
| 6 | Assemble data | Line 131-140 |
| 7 | Return result | Line 143 |

### Error Responses

| Error | Status | Response |
|-------|--------|----------|
| Empty text | 400 | `{"error": "Text is required"}` |
| AI can't parse | 400 | `{"error": "Could not determine..."}` |
| No department | 400 | `{"error": "Department \"xyz\" not found..."}` |
| Missing fields | 400 | `{"error": "Could not extract..."}` |
| File error | 500 | `{"error": "Failed to load..."}` |
| AI error | 500 | `{"error": "Error parsing..."}` |

### Test Commands

**Success:**
```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell marketing to create a new ad plan"}'
```

**Error:**
```bash
curl -X POST http://localhost:3001/api/create-task \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello there!"}'
```

### Valid Departments
- marketing → Marketing (marketing@company.com)
- finance → Finance (finance@company.com)
- hr → Human Resources (hr@company.com)
- it → IT Support (it@company.com)
- sales → Sales (sales@company.com)

### Subject Generation
- Prefix: "New Task: "
- Max length: 50 characters
- Auto-truncate with "..."
- First letter capitalized

### Frontend Modal Display
```
┌─────────────────────────────────┐
│        Confirm Task             │
├─────────────────────────────────┤
│ To: Marketing                   │
│     marketing@company.com       │
│                                 │
│ Subject: New Task: Create a new │
│          ad plan                │
│                                 │
│ Message: create a new ad plan   │
├─────────────────────────────────┤
│          [Cancel] [Confirm]     │
└─────────────────────────────────┘
```

### Files Modified
- `backend/server.js` (lines 52-149)
- `frontend/src/ChatInterface.js` (lines 97-109, 186-203)

### Documentation
- **API_ENDPOINT_GUIDE.md** - Full documentation
- **COMPLETE_TASK_ENDPOINT.md** - Implementation summary
- **TEST_AGENT.md** - Test examples

### Key Features
✅ Strict JSON-only AI responses
✅ Smart department matching
✅ Auto-generated subjects
✅ Complete error handling
✅ Email-ready output
✅ Never crashes

### AI Configuration
- Model: gpt-3.5-turbo-1106
- Temperature: 0.2
- Response Format: JSON enforced
- Mode: Specialist (no conversation)

### Ready For
✅ Frontend confirmation modal
✅ Email sending (next sprint)
✅ Database storage
✅ Task history

# UI Guide - AI Assistant Interface

## Main Interface Layout

```
┌─────────────────────────────────────────────────┐
│           AI Assistant (Header)                 │
│            [Blue Background]                     │
└─────────────────────────────────────────────────┘
│                                                 │
│  Chat Messages Area                             │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │  User: What is AI?          [User Msg]   │ │
│  │                                           │ │
│  │  [Bot Msg]  AI is artificial intelligence│ │
│  │                                           │ │
│  │  User: Tell marketing to make ad         │ │
│  │                                           │ │
│  │  [Bot Msg]  Task created for marketing   │ │
│  │             department: make ad          │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
│  Input Area                                     │
│  ┌───────────────────────────────────────────┐ │
│  │ Ask a question, or describe a task...    │ │
│  └───────────────────────────────────────────┘ │
│  [Ask (Blue)]  [Create Task (Green)]           │
└─────────────────────────────────────────────────┘
```

## Color Scheme

### Buttons

**Ask Button:**
- Color: Blue (#007bff)
- Hover: Darker Blue (#0056b3)
- Purpose: General chat/questions

**Create Task Button:**
- Color: Green (#28a745)
- Hover: Darker Green (#218838)
- Purpose: Task creation

### Messages

**User Messages:**
- Background: Blue (#007bff)
- Text: White
- Position: Right-aligned
- Border Radius: Rounded (18px) with sharp bottom-right corner

**Bot Messages:**
- Background: Light Gray (#e9ecef)
- Text: Dark (#333)
- Position: Left-aligned
- Border Radius: Rounded (18px) with sharp bottom-left corner

## Task Confirmation Modal

```
                     ╔═════════════════════════════════╗
                     ║                                 ║
                     ║       Confirm Task              ║
                     ║                                 ║
                     ║  ┌──────────────────────────┐  ║
                     ║  │ TO:                      │  ║
                     ║  │ Marketing Department     │  ║
                     ║  └──────────────────────────┘  ║
                     ║                                 ║
                     ║  ┌──────────────────────────┐  ║
                     ║  │ TASK:                    │  ║
                     ║  │ create a new ad plan     │  ║
                     ║  └──────────────────────────┘  ║
                     ║                                 ║
                     ║                                 ║
                     ║   [Cancel]  [Confirm & Send]   ║
                     ║                                 ║
                     ╚═════════════════════════════════╝
```

### Modal Styling:

**Overlay:**
- Background: Semi-transparent black (rgba(0,0,0,0.5))
- Full screen coverage
- Centered modal

**Modal Card:**
- Background: White
- Border Radius: 12px
- Shadow: 0 4px 20px rgba(0,0,0,0.3)
- Max Width: 500px
- Padding: 30px

**Field Containers:**
- Background: Light gray (#f8f9fa)
- Border-left: 4px solid blue (#007bff)
- Padding: 15px
- Rounded corners: 8px

**Buttons:**
- Cancel: Gray (#6c757d)
- Confirm & Send: Green (#28a745)
- Both have hover effects

## User Interaction Flows

### Flow 1: Asking a Question

```
1. User types: "What is AI?"
2. User clicks: [Ask (Blue)]
3. Message appears: "What is AI?" (right-aligned, blue)
4. Loading dots appear
5. Bot response appears: "AI is..." (left-aligned, gray)
```

### Flow 2: Creating a Task

```
1. User types: "Tell marketing to create a new ad plan"
2. User clicks: [Create Task (Green)]
3. Loading indicator appears
4. Modal pops up showing:
   - To: Marketing Department
   - Task: create a new ad plan
5. User has two options:

   Option A: Click [Cancel]
   → Modal closes
   → Input field remains empty
   → No message added to chat

   Option B: Click [Confirm & Send]
   → Modal closes
   → Confirmation message appears in chat
   → "Task created for marketing department: create a new ad plan"
```

### Flow 3: Error Handling

```
1. User types: "Hello there!"
2. User clicks: [Create Task (Green)]
3. Loading indicator appears
4. Error message appears in chat (left-aligned, gray):
   "Could not determine the department or task."
5. No modal appears
```

## Responsive Design Notes

- Input box takes full width with flex
- Buttons are fixed width (Ask: 80px, Create Task: 120px)
- Modal is responsive (90% width on mobile, max 500px on desktop)
- Messages have max-width of 70% for readability
- Chat area scrolls when content exceeds viewport

## Accessibility Features

1. **Clear Visual Separation:**
   - Blue for chat (Ask)
   - Green for tasks (Create Task)

2. **Descriptive Placeholder:**
   - "Ask a question, or describe a task for a department..."
   - Guides user on proper usage

3. **Modal Confirmation:**
   - Prevents accidental actions
   - Shows exactly what will happen

4. **Loading States:**
   - Animated dots while waiting
   - Disabled buttons during processing

5. **Error Feedback:**
   - Clear error messages in chat
   - Helpful guidance when AI cannot parse input

## Animation Effects

**Message Entry:**
- Fade in + slide up (0.3s)
- Smooth appearance

**Modal:**
- Overlay fade in (0.2s)
- Modal slide up (0.3s)
- Professional entrance

**Buttons:**
- Hover color transitions (0.3s)
- Smooth color changes

**Loading Dots:**
- Sequential blinking (1.4s cycle)
- Staggered delays (0.2s between dots)

## Mobile Considerations

- Touch-friendly button sizes (min 44x44px)
- Modal adapts to screen size
- Input field expands to full width
- Messages stack vertically with adequate spacing
- Easy thumb access to both buttons

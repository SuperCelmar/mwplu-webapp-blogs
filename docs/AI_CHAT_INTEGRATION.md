# AI Chat Integration

## Overview

The AI Chat Overlay provides users with an intelligent assistant to answer questions about PLU documents directly from the synthesis page.

## Component Location

`/src/components/plu/AIChatOverlay.vue`

## Integration

The chatbot is integrated into the PLU Synthesis view:
- Location: `/src/views/PluSynthesisView.vue`
- Appears as a floating button in the bottom-right corner
- Overlays the page content when opened

## Features

### User Interface
- **Floating Action Button**: Fixed position chat toggle button
- **Overlay Chat Window**: Slides up from bottom-right
- **Responsive Design**: Full-screen on mobile, windowed on desktop
- **Message History**: Displays conversation between user and assistant
- **Typing Indicator**: Shows when the AI is processing a response

### Functionality
- **Document Context**: Automatically sends the current document ID with each message
- **Real-time Communication**: Sends messages to n8n webhook endpoint
- **Keyboard Shortcuts**:
  - `Enter`: Send message
  - `Shift + Enter`: New line in message
- **Error Handling**: Graceful error messages for failed requests

## Webhook Integration

### Endpoint
```
POST https://n8n.automationdfy.com/webhook/mwplu/chat
```

### Request Body
```json
{
  "message": "user's question here",
  "document_id": "current PLU document ID"
}
```

### Expected Response
```json
{
  "response": "AI assistant's answer"
}
```

Or alternatively:
```json
{
  "message": "AI assistant's answer"
}
```

## Styling

The component uses the project's existing design system:
- CSS variables from `/src/styles/variables.css`
- Black and white color scheme
- Consistent spacing and typography
- Smooth animations and transitions

## Mobile Responsiveness

- **Desktop**: 420px × 600px window in bottom-right corner
- **Mobile**: Full-screen overlay for better usability
- Touch-friendly button sizes (min 44px)

## Future Enhancements

Potential improvements:
- Chat history persistence (using Supabase)
- Message reactions or feedback
- Document text extraction for better context
- Multi-language support
- Voice input capability

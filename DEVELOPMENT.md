# Development Guide

This guide covers how to extend and customize the T3 Chat application.

## 🏗 Architecture Overview

### Frontend (SolidJS)
- **App.tsx**: Main application with routing and chat interface
- **Reactive State**: Uses SolidJS signals for real-time updates
- **Zero Integration**: Real-time database queries with automatic sync

### Backend (Hono)
- **RESTful API**: Clean endpoints for all features
- **OpenRouter Integration**: Multi-LLM support
- **File Uploads**: Handles attachments and media
- **Web Search**: Multiple search provider support

### Database (Zero/PostgreSQL)
- **Schema**: Defined in `shared/schema.ts`
- **Mutations**: Custom operations in `shared/mutators.ts`
- **Real-time Sync**: Automatic synchronization across clients

## 🔧 Adding New Features

### Adding a New LLM Provider

1. **Update OpenRouter models** in `server/openrouter.ts`:
```typescript
export const AVAILABLE_MODELS = [
  // ... existing models
  { id: "new-provider/model-name", name: "New Model", provider: "Provider" },
];
```

2. **Update the UI** to display the new model in the selector.

### Adding New File Types

1. **Update upload configuration** in `server/upload.ts`:
```typescript
fileUploader: f({
  // ... existing types
  "application/new-type": { maxFileSize: "16MB", maxFileCount: 1 },
})
```

2. **Update UI** to handle the new file type display.

### Adding Chat Themes

1. **Extend TailwindCSS** in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      // Add new theme colors
      'theme-dark': { /* ... */ },
      'theme-light': { /* ... */ },
    }
  }
}
```

2. **Update CSS** in `app/index.css` with new theme classes.

### Adding Message Types

1. **Extend the schema** in `shared/schema.ts`:
```typescript
const message = table("message")
  .columns({
    // ... existing columns
    messageType: string(), // "text", "image", "file", "system"
    metadata: string(),    // JSON metadata for special message types
  })
```

2. **Update mutations** and UI components to handle new types.

## 🎨 Customizing the UI

### Styling

The application uses a custom TailwindCSS design system:
- **Primary colors**: Blue tones for main actions
- **Secondary colors**: Gray tones for text and backgrounds
- **Accent colors**: Purple tones for highlights

### Components

Key UI components are defined in `app/App.tsx`:
- `ChatApp`: Main chat interface
- `MessageComponent`: Individual message display
- `ShareView`: Shared chat viewer

### Responsive Design

The layout uses CSS Grid with responsive breakpoints:
- **Desktop**: Sidebar + main chat area
- **Mobile**: Collapsible sidebar with mobile-first design

## 🔌 API Extensions

### Adding New Endpoints

1. **Define the endpoint** in `server/index.ts`:
```typescript
app.post("/api/new-feature", async (c) => {
  // Implementation
  return c.json({ result: "success" });
});
```

2. **Add client-side integration** in the frontend.

### Authentication Integration

To integrate with Clerk or other auth providers:

1. **Update auth schema** in `shared/auth.ts`
2. **Add middleware** in `server/index.ts`
3. **Update frontend** to handle auth states

## 📊 Database Schema Extensions

### Adding New Tables

1. **Define the table** in `shared/schema.ts`:
```typescript
const newTable = table("newTable")
  .columns({
    id: string(),
    // ... other columns
  })
  .primaryKey("id");
```

2. **Add relationships** if needed:
```typescript
const newTableRelationships = relationships(newTable, ({ one, many }) => ({
  // ... relationships
}));
```

3. **Update the schema export**:
```typescript
export const schema = createSchema({
  tables: [/* ... existing tables */, newTable],
  relationships: [/* ... existing relationships */, newTableRelationships],
});
```

### Adding Custom Mutations

1. **Extend mutators** in `shared/mutators.ts`:
```typescript
export function createMutators(authData: AuthData | undefined) {
  return {
    // ... existing mutators
    newFeature: {
      async customOperation(tx, data) {
        // Custom logic
        await tx.mutate.newTable.insert(data);
      },
    },
  };
}
```

## 🚀 Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Use dynamic imports for routes
2. **Lazy Loading**: Load components on demand
3. **Memoization**: Use `createMemo` for expensive computations

### Backend Optimization

1. **Caching**: Implement Redis caching for API responses
2. **Rate Limiting**: Add rate limiting to protect APIs
3. **Connection Pooling**: Optimize database connections

### Database Optimization

1. **Indexing**: Add indexes for frequently queried columns
2. **Query Optimization**: Optimize Zero queries with proper relations
3. **Data Cleanup**: Implement cleanup for old messages/files

## 🧪 Testing

### Frontend Testing

```bash
# Add testing dependencies
npm install --save-dev vitest @solidjs/testing-library

# Create test files
touch app/App.test.tsx
```

### Backend Testing

```bash
# Add testing dependencies
npm install --save-dev vitest supertest

# Create test files
touch server/index.test.ts
```

### Integration Testing

1. **Database Testing**: Use test database for integration tests
2. **API Testing**: Test all endpoints with real data
3. **E2E Testing**: Use Playwright for full user flows

## 🔍 Debugging

### Frontend Debugging

1. **Zero Inspector**: Access `window._zero` in browser console
2. **React DevTools**: Use SolidJS devtools extension
3. **Network Tab**: Monitor API calls and WebSocket connections

### Backend Debugging

1. **Logging**: Add structured logging with Winston or similar
2. **Error Tracking**: Integrate Sentry for error monitoring
3. **Performance**: Use profiling tools for performance analysis

## 📦 Deployment Extensions

### Environment Configurations

1. **Staging Environment**: Set up staging with test data
2. **Production Optimizations**: Enable compression, CDN, etc.
3. **Monitoring**: Add health checks and metrics

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

## 🎯 Feature Ideas

### Advanced Features

1. **Voice Messages**: Add audio recording and playback
2. **Video Calls**: Integrate WebRTC for video chat
3. **Screen Sharing**: Allow screen sharing in conversations
4. **Message Reactions**: Add emoji reactions to messages
5. **Thread Conversations**: Create threaded replies
6. **Message Scheduling**: Schedule messages for later
7. **AI Personas**: Create custom AI personalities
8. **Message Translation**: Auto-translate messages
9. **Smart Summaries**: Generate conversation summaries
10. **Plugin System**: Allow third-party integrations

### Integration Ideas

1. **Calendar Integration**: Schedule meetings from chat
2. **Task Management**: Create tasks from conversations
3. **Note Taking**: Save important messages as notes
4. **Analytics Dashboard**: Conversation analytics
5. **API Webhooks**: External system integrations

## 📚 Resources

- [SolidJS Documentation](https://solidjs.com/)
- [Zero (Rocicorp) Docs](https://zero.rocicorp.dev/)
- [Hono Documentation](https://hono.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [OpenRouter API](https://openrouter.ai/docs)

## 🤝 Contributing Guidelines

1. **Code Style**: Follow the existing patterns
2. **Testing**: Add tests for new features
3. **Documentation**: Update docs for changes
4. **Performance**: Consider performance impact
5. **Security**: Follow security best practices

---

Happy coding! 🚀
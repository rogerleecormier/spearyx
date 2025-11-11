# Iteration 8: Quick Reference

**AI Integration & Prompts - Quick Guide**

---

## 🚀 Quick Start

### Using AI in Components

```typescript
import { aiService } from "@/lib/raci/ai";

// Extract roles
const result = await aiService.extractRoles("Describe your project here...");
console.log(result.roles); // ["Role1", "Role2", ...]

// Generate tasks
const tasks = await aiService.generateTasks(description, "Mobile App", [
  "Dev",
  "PM",
  "QA",
]);
console.log(tasks.tasks); // [{name, description}, ...]

// Cancel request
aiService.cancelRequest(requestId);
```

---

## 📊 Key Files

| File                                       | Purpose           | Lines |
| ------------------------------------------ | ----------------- | ----- |
| `src/lib/raci/ai.ts`                       | AI service client | 510   |
| `src/config/prompts.json`                  | Prompt templates  | 50    |
| `src/components/raci/DescriptionPanel.tsx` | UI component      | 200+  |
| `src/config/workers.ts`                    | Worker config     | 30    |

---

## 🔧 Configuration

### Environment Variables

```bash
# Development
VITE_WORKER_DEV_URL=http://localhost:8787
VITE_WORKER_API_KEY=dev-key

# Production
VITE_WORKER_PROD_URL=https://raci-worker.example.com
VITE_WORKER_API_KEY=your-prod-key
```

### Rate Limiting

```typescript
// Current settings
const AI_CONFIG = {
  timeoutMs: 30000, // 30 seconds
  rateLimit: {
    maxRequests: 10, // per minute
    windowMs: 60000, // 60 seconds
  },
};
```

---

## 📝 Prompt Customization

Edit `src/config/prompts.json`:

```json
{
  "roleExtraction": {
    "prompt": "Your custom prompt here with {{projectDescription}}",
    "variables": ["projectDescription"],
    "maxTokens": 200
  }
}
```

**Available variables**:

- `{{projectDescription}}` - User's project description
- `{{projectType}}` - Classified project type
- `{{roles}}` - Comma-separated roles
- `{{task}}` - Current task name

---

## 🎯 Error Codes

| Code               | Meaning                  | User Action              |
| ------------------ | ------------------------ | ------------------------ |
| `RATE_LIMITED`     | 10 req/min exceeded      | Wait and retry           |
| `TIMEOUT`          | 30s timeout exceeded     | Retry or manual entry    |
| `NETWORK_ERROR`    | Connection failed        | Check internet, retry    |
| `API_ERROR`        | Worker returned error    | Retry or contact support |
| `INVALID_RESPONSE` | JSON parse failed        | Retry request            |
| `CONFIG_ERROR`     | Missing API key/endpoint | Contact admin            |

---

## 🧪 Testing

### Test AI Extraction

```typescript
const roles = await aiService.extractRoles(
  "Building a mobile app with React Native..."
);
expect(roles.roles.length).toBeGreaterThan(0);
```

### Test Rate Limiting

```typescript
// Make 11 requests
for (let i = 0; i < 11; i++) {
  try {
    await aiService.extractRoles(description);
  } catch (err) {
    if (err.code === "RATE_LIMITED") {
      console.log("Rate limit working!");
    }
  }
}
```

### Test Timeout

```typescript
// Simulate slow endpoint (>30s)
// Should throw TIMEOUT error
try {
  await aiService.extractRoles(description);
} catch (err) {
  expect(err.code).toBe("TIMEOUT");
}
```

### Test Cancellation

```typescript
const requestId = "test-123";
const promise = aiService.extractRoles(description, requestId);

// Cancel after 100ms
setTimeout(() => aiService.cancelRequest(requestId), 100);

try {
  await promise;
} catch (err) {
  expect(err.code).toBe("TIMEOUT"); // AbortError → TIMEOUT
}
```

---

## 🎨 Styling Guide

### UI States in DescriptionPanel

```tsx
// Loading state
<Loader2 className="w-4 h-4 animate-spin" />

// Error state
<AlertCircle className="w-4 h-4 text-red-600" />
<div className="bg-red-50 border border-red-200">

// Success state
<CheckCircle className="w-4 h-4 text-green-600" />
<div className="bg-green-50 border border-green-200">
```

---

## 📚 API Reference

### aiService.extractRoles()

```typescript
async extractRoles(
  projectDescription: string,
  requestId?: string
): Promise<AIRoleSuggestion>
```

**Returns**:

```typescript
{
  roles: string[],           // Role names
  confidence: number         // 0-1 confidence score
}
```

### aiService.generateTasks()

```typescript
async generateTasks(
  _projectDescription: string,
  projectType: string,
  roles: string[],
  requestId?: string
): Promise<AITaskSuggestion>
```

**Returns**:

```typescript
{
  tasks: Array<{
    name: string,
    description?: string
  }>,
  confidence: number
}
```

### aiService.getRACIAdvice()

```typescript
async getRACIAdvice(
  task: string,
  projectType: string,
  roles: string[],
  requestId?: string
): Promise<AIRACISuggestion>
```

**Returns**:

```typescript
{
  matrix: Record<string, RaciValue>,  // Role → RACI value
  confidence: number
}
```

### aiService.classifyProjectType()

```typescript
async classifyProjectType(
  projectDescription: string,
  requestId?: string
): Promise<AIProjectType>
```

**Returns**:

```typescript
{
  type: string,              // "Mobile App", "Web Redesign", etc.
  confidence: number
}
```

### aiService.isAvailable()

```typescript
async isAvailable(): Promise<boolean>
```

**Returns**: `true` if AI service is reachable

### aiService.cancelRequest()

```typescript
cancelRequest(requestId: string): void
```

**Cancels in-flight request immediately**

### aiService.getRateLimitStatus()

```typescript
getRateLimitStatus(): {
  remaining: number,     // Requests left this minute
  limit: number,         // Total limit (10)
  resetAfterMs: number   // Milliseconds until window resets
}
```

---

## 🔄 Fallback Data

### Supported Project Types

1. **Mobile App** - Frontend Dev, Backend Engineer, QA Lead, DevOps
2. **Web Redesign** - Frontend, Backend, Designer, Product Manager
3. **CRM Migration** - CRM Admin, Data Analyst, IT Manager, Change Manager
4. **Marketing Campaign** - Marketing Manager, Designer, Analytics Lead
5. **Data Analytics** - Data Engineer, Data Scientist, Analytics Engineer
6. **Other** - Generic fallback

---

## 🐛 Debugging

### Enable Logs

```typescript
// In callAI method, add:
console.log("AI Request:", { promptType, variables });
console.log("Rate limit status:", this.getRateLimitStatus());
console.log("Response:", data);
```

### Check Rate Limit

```typescript
const status = aiService.getRateLimitStatus();
console.log(`${status.remaining}/${status.limit} requests remaining`);
```

### Check Request Status

```typescript
// In browser console
localStorage.getItem("raci:aiRequests"); // (if stored)
```

---

## 📈 Monitoring

### Track Usage

```typescript
// Log each AI request
aiService.extractRoles(description).then(
  (result) => {
    console.log("Success", { roles: result.roles });
    // Track in analytics
  },
  (error) => {
    console.error("Failed", { code: error.code });
    // Track error
  }
);
```

### Performance

- **Response time**: Should be < 2-5 seconds in production
- **Error rate**: Should be < 1%
- **Rate limit hits**: Monitor to understand usage patterns

---

## 🚨 Common Issues

### "Rate limit exceeded"

- **Cause**: Made >10 requests in 60 seconds
- **Fix**: Wait 60 seconds, requests made outside window will pass

### "Request timed out"

- **Cause**: Worker not responding within 30 seconds
- **Fix**: Check Worker health, network latency, AI model performance

### "Network error"

- **Cause**: Browser can't reach Worker
- **Fix**: Check internet connection, Worker URL config

### "AI returned empty result"

- **Cause**: AI model returned empty response
- **Fix**: Retry, or use fallback manually

### Fallback always used

- **Cause**: AI is timing out or AI is disabled
- **Fix**: Check Worker is deployed, API key is correct, network connectivity

---

## ✅ Checklist: Using AI in New Components

- [ ] Import `{ aiService, AIError }` from `@/lib/raci/ai`
- [ ] Create request ID for tracking: `const requestId = \`req-\${Date.now()}\``
- [ ] Call `aiService.extractRoles(description, requestId)`
- [ ] Handle `AIError` specifically for error codes
- [ ] Show loading spinner during request
- [ ] Show success/error feedback to user
- [ ] Provide cancel button if request is long
- [ ] Display rate limit status if relevant
- [ ] Transform results into component data format
- [ ] Test with AI disabled (fallback)

---

## 📞 Support

### Issues

Check: `src/lib/raci/ai.ts` error types and messages

### Worker Deployment

Check: `src/config/workers.ts` endpoint and API key

### Prompts

Edit: `src/config/prompts.json` for custom prompts

### UI Component

Edit: `src/components/raci/DescriptionPanel.tsx` for customization

---

**Last Updated**: 2025-11-11  
**Status**: ✅ COMPLETE

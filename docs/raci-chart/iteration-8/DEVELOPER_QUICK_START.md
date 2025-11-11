# Iteration 8: AI Integration & Prompts – Developer Quick Start

**Status**: ✅ IMPLEMENTATION COMPLETE  
**Documentation Location**: `docs/raci-chart/iteration-8/`

---

## What Was Implemented

✅ **AI Service Client** (`src/lib/raci/ai.ts`)

- Cloudflare Workers AI integration
- Rate limiting (10 req/min)
- 30-second timeout handling
- Request cancellation
- Comprehensive error handling

✅ **Prompt Configuration** (`src/config/prompts.json`)

- 4 prompt templates for AI operations
- Dynamic variable substitution
- Token limits per prompt type

✅ **DescriptionPanel Component** (`src/components/raci/DescriptionPanel.tsx`)

- Project description input textarea
- "Generate from Description" button
- Loading states and spinners
- Error handling with user messages
- Rate limit feedback
- Request cancellation support

✅ **Integration** (`src/components/raci/RaciEditor.tsx`)

- DescriptionPanel integrated into editor
- AI-generated roles passed to state
- AI-generated tasks passed to state
- Seamless callback flow

---

## Quick API Reference

### Using the AI Service

```typescript
import { aiService, AIError } from "@/lib/raci/ai";

// Extract roles from description
try {
  const result = await aiService.extractRoles("Build a mobile e-commerce app");
  console.log(result.roles); // ['Product Manager', 'Backend Engineer', ...]
  console.log(result.confidence); // 0.85
} catch (error) {
  if (error instanceof AIError) {
    switch (error.code) {
      case "RATE_LIMITED":
        console.log(`Wait ${error.context?.retryAfter}ms`);
        break;
      case "TIMEOUT":
        console.log("Request timed out");
        break;
      case "NETWORK_ERROR":
        console.log("Network issue");
        break;
    }
  }
}

// Generate tasks for project type and roles
const tasks = await aiService.generateTasks("Web Redesign", [
  "Product Manager",
  "Designer",
  "Developer",
]);
// Returns: [{ name: 'Discovery & Analysis', description: '...' }, ...]

// Get RACI advice for a task
const raci = await aiService.getRACIAdvice(
  "Database Migration",
  "CRM Migration",
  ["Database Admin", "IT Manager", "Developer"]
);
// Returns: { 'Database Admin': 'R', 'IT Manager': 'A', 'Developer': 'C' }

// Classify project type
const projectType = await aiService.classifyProjectType(description);
// Returns: 'Mobile App' | 'Web Redesign' | 'CRM Migration' | ...

// Check AI service health
const isAvailable = await aiService.isAvailable();

// Get rate limit status
const status = aiService.getRateLimitStatus();
console.log(status);
// { remaining: 8, limit: 10, resetAfterMs: 45000 }

// Cancel an in-flight request
aiService.cancelRequest(requestId);
```

### Using DescriptionPanel

```typescript
import DescriptionPanel from '@/components/raci/DescriptionPanel'
import { RaciRole, RaciTask } from '@/types/raci'

<DescriptionPanel
  description={projectDescription}
  onChange={(desc) => setProjectDescription(desc)}
  onGenerateRoles={(roles: RaciRole[]) => {
    // roles is array of: { id: string, name: string, order: number }
    setRoles(roles)
  }}
  onGenerateTasks={(tasks: RaciTask[]) => {
    // tasks is array of: { id: string, name: string, description?: string, order: number }
    setTasks(tasks)
  }}
  disabled={isLoading}
/>
```

### Using Fallback Data

```typescript
import { AI_FALLBACKS } from "@/lib/raci/ai";

// Get fallback roles for project type
const roles = AI_FALLBACKS.getRoles("Mobile App");
// Returns: ['Product Manager', 'Backend Engineer', 'Frontend Engineer', 'QA Lead', 'DevOps Engineer']

// Get fallback tasks for project type
const tasks = AI_FALLBACKS.getTasks("Web Redesign");
// Returns: [
//   { name: 'Discovery & Analysis', description: '...' },
//   { name: 'Design System', description: '...' },
//   ...
// ]

// Get fallback RACI matrix
const matrix = AI_FALLBACKS.getRACIMatrix(roleIds, taskIds);
// Returns: RACI matrix with rotating accountability pattern
```

---

## Configuration

### Environment Variables

Create `.env.local`:

```bash
# Development
VITE_WORKER_DEV_URL=http://localhost:8787
VITE_WORKER_API_KEY=dev-key

# Production
VITE_WORKER_PROD_URL=https://raci-worker.example.com
VITE_WORKER_API_KEY=your-production-key
```

### Prompt Customization

Edit `src/config/prompts.json`:

```json
{
  "roleExtraction": {
    "prompt": "Extract 5-8 key roles from this project description: {{projectDescription}}\n\nRespond with only a JSON array of role names (strings), no additional text.",
    "variables": ["projectDescription"],
    "maxTokens": 200
  }
}
```

**Available variables** (auto-substituted):

- `{{projectDescription}}` - User's project description
- `{{projectType}}` - Classified project type
- `{{roles}}` - Comma-separated list of role names
- `{{task}}` - Individual task name

### Rate Limiting

Edit `src/config/workers.ts`:

```typescript
export const AI_CONFIG = {
  maxRetries: 3,
  timeoutMs: 30000, // 30 seconds
  rateLimit: {
    maxRequests: 10, // Per window
    windowMs: 60000, // 60 seconds (1 minute)
  },
};
```

---

## Error Handling

### AIError Class

```typescript
try {
  await aiService.extractRoles(description);
} catch (error) {
  if (error instanceof AIError) {
    console.log(error.code); // 'RATE_LIMITED' | 'TIMEOUT' | 'NETWORK_ERROR' | ...
    console.log(error.message); // User-friendly message
    console.log(error.context); // Additional details
  }
}
```

### Error Codes

| Code               | Meaning                  | Resolution                   |
| ------------------ | ------------------------ | ---------------------------- |
| `RATE_LIMITED`     | 10 requests/min exceeded | Wait `context.retryAfter` ms |
| `TIMEOUT`          | Request took >30s        | Retry or use fallback        |
| `NETWORK_ERROR`    | Connection failed        | Check internet, retry        |
| `INVALID_RESPONSE` | AI returned invalid JSON | Retry, check prompt template |
| `WORKER_ERROR`     | Cloudflare Worker error  | Check worker status, retry   |
| `CONFIG_ERROR`     | Missing endpoint/API key | Check environment variables  |
| `ABORT`            | Request was cancelled    | User clicked Cancel          |

---

## Usage Examples

### Example 1: Basic AI Generation

```typescript
const handleGenerateFromDescription = async () => {
  try {
    // 1. Classify project
    const projectType = await aiService.classifyProjectType(description);

    // 2. Extract roles
    const { roles } = await aiService.extractRoles(description);

    // 3. Generate tasks
    const { tasks } = await aiService.generateTasks(projectType, roles);

    // 4. Update state
    setRoles(roles.map((name, i) => ({ id: `r${i}`, name, order: i })));
    setTasks(
      tasks.map((task, i) => ({
        id: `t${i}`,
        name: task.name,
        description: task.description || "",
        order: i,
      }))
    );
  } catch (error) {
    if (error instanceof AIError && error.code === "RATE_LIMITED") {
      setError(`Please wait ${Math.ceil(error.context?.retryAfter / 1000)}s`);
    } else {
      setError("Generation failed. Using templates instead.");
      // Use fallback data
    }
  }
};
```

### Example 2: With Request Cancellation

```typescript
const requestIdRef = useRef<string | null>(null);

const handleGenerate = async () => {
  const requestId = `gen-${Date.now()}`;
  requestIdRef.current = requestId;

  try {
    const roles = await aiService.extractRoles(description, requestId);
    setRoles(roles);
  } finally {
    requestIdRef.current = null;
  }
};

const handleCancel = () => {
  if (requestIdRef.current) {
    aiService.cancelRequest(requestIdRef.current);
  }
};
```

### Example 3: With Progress Tracking

```typescript
const [progress, setProgress] = useState<{
  stage: "classifying" | "extracting" | "generating" | "complete";
  percentage: number;
}>({ stage: "classifying", percentage: 0 });

const handleGenerateWithProgress = async () => {
  try {
    setProgress({ stage: "classifying", percentage: 25 });
    const projectType = await aiService.classifyProjectType(description);

    setProgress({ stage: "extracting", percentage: 50 });
    const { roles } = await aiService.extractRoles(description);

    setProgress({ stage: "generating", percentage: 75 });
    const { tasks } = await aiService.generateTasks(projectType, roles);

    setProgress({ stage: "complete", percentage: 100 });
    // Update state...
  } catch (error) {
    // Handle error...
  }
};
```

---

## Testing

### Unit Tests for AIService

```typescript
// Test rate limiting
describe("AIService - Rate Limiting", () => {
  it("should allow 10 requests in 60 seconds", async () => {
    const service = new AIService();
    for (let i = 0; i < 10; i++) {
      expect(service.getRateLimitStatus().remaining).toBe(10 - i);
      await service.extractRoles("test");
    }
  });

  it("should reject 11th request", async () => {
    const service = new AIService();
    for (let i = 0; i < 10; i++) {
      await service.extractRoles("test");
    }

    expect(() => service.extractRoles("test")).toThrow(AIError);
  });
});

// Test timeout
describe("AIService - Timeout", () => {
  it("should timeout after 30 seconds", async () => {
    jest.useFakeTimers();
    const promise = aiService.extractRoles("test");
    jest.advanceTimersByTime(31000);

    await expect(promise).rejects.toThrow("timed out");
  });
});
```

### Component Tests for DescriptionPanel

```typescript
describe('DescriptionPanel', () => {
  it('should disable generate button when description is empty', () => {
    render(<DescriptionPanel description="" onChange={jest.fn()} />)
    expect(screen.getByText('Generate from Description')).toBeDisabled()
  })

  it('should show loading state during generation', async () => {
    render(<DescriptionPanel description="Test" onChange={jest.fn()} />)
    fireEvent.click(screen.getByText('Generate from Description'))
    expect(screen.getByText('Generating...')).toBeInTheDocument()
  })

  it('should show error message on AI failure', async () => {
    jest.spyOn(aiService, 'extractRoles').mockRejectedValue(
      new AIError('TIMEOUT', 'Request timed out')
    )
    render(<DescriptionPanel description="Test" onChange={jest.fn()} />)
    fireEvent.click(screen.getByText('Generate from Description'))
    await screen.findByText(/timed out/)
    expect(screen.getByText(/timed out/)).toBeInTheDocument()
  })
})
```

---

## Troubleshooting

### "Rate limited" error on first request

**Cause**: Leftover state from previous session  
**Fix**: Hard refresh (Ctrl+Shift+R) or clear IndexedDB

```javascript
// In browser console
await indexedDB.deleteDatabase("spearyx-raci");
location.reload();
```

### AI returns wrong suggestions

**Cause**: Description is too vague  
**Fix**: Add more specific details to project description

**Example (Before)**:

> "Web app project"

**Example (After)**:

> "Build a web-based project management tool for teams. Frontend: React with TypeScript. Backend: Node.js. Database: PostgreSQL. Real-time collaboration features. User authentication required."

### Timeout errors consistently

**Cause**:

1. Network speed too slow
2. Cloudflare Worker is slow
3. Timeout value too low

**Fix**:

```typescript
// In src/config/workers.ts
export const AI_CONFIG = {
  timeoutMs: 45000, // Increase from 30000 to 45000
  // ...
};
```

### Worker returns 401 Unauthorized

**Cause**: Invalid API key  
**Fix**: Verify in `.env.local`:

```bash
# Verify the key is set
echo $VITE_WORKER_API_KEY

# Check it matches what's in Cloudflare Workers
```

---

## Best Practices

### 1. Always Handle AIError

```typescript
// ❌ Bad - Unhandled promise
aiService.extractRoles(description);

// ✅ Good - Proper error handling
try {
  const roles = await aiService.extractRoles(description);
  setRoles(roles);
} catch (error) {
  if (error instanceof AIError) {
    showError(error.message);
  }
}
```

### 2. Provide Visual Feedback

```typescript
// ✅ Good - User knows what's happening
<Button disabled={isLoading} onClick={handleGenerate}>
  {isLoading ? (
    <>
      <Loader2 className="animate-spin" />
      Generating...
    </>
  ) : (
    'Generate from Description'
  )}
</Button>
```

### 3. Use Fallback Data When Needed

```typescript
// ✅ Good - Graceful degradation
if (!isAvailable) {
  const fallbackRoles = AI_FALLBACKS.getRoles("Mobile App");
  // Use fallback data
}
```

### 4. Respect Rate Limits

```typescript
// ✅ Good - Check before requesting
const status = aiService.getRateLimitStatus();
if (status.remaining > 0) {
  // Make request
}
```

### 5. Cancel Requests on Unmount

```typescript
// ✅ Good - Clean up on unmount
useEffect(() => {
  return () => {
    if (requestIdRef.current) {
      aiService.cancelRequest(requestIdRef.current);
    }
  };
}, []);
```

---

## Documentation Files

| File                      | Purpose                              |
| ------------------------- | ------------------------------------ |
| `ITERATION_8_COMPLETE.md` | Comprehensive implementation details |
| `QUICK_REFERENCE.md`      | API reference and code examples      |
| `ARCHITECTURE.md`         | System design and data flow          |
| `README.md`               | Overview and getting started         |
| `INDEX.md`                | Quick navigation guide               |

---

## Next Steps

1. **Test with different project descriptions** to validate quality
2. **Monitor rate limiting** in production
3. **Gather user feedback** on AI suggestion quality
4. **Plan Iteration 9** - Error handling & UX polish

---

**Status**: ✅ Ready for production  
**Last Updated**: November 11, 2025

# Iteration 8: AI Integration Architecture

**Purpose**: Document the AI integration architecture, data flows, and integration points for Iteration 8.

---

## System Architecture

### High-Level Flow

```
User inputs description
        ↓
DescriptionPanel.handleGenerate()
        ↓
[AI Service Client]
├─ Step 1: classifyProjectType() → "Mobile App"
├─ Step 2: extractRoles() → ["Dev", "PM", "QA"]
└─ Step 3: generateTasks() → [{name, description}...]
        ↓
Create role/task objects with IDs
        ↓
Call onGenerateRoles() / onGenerateTasks()
        ↓
RaciEditor updates chart state
        ↓
UI reflects changes (roles, tasks visible)
```

---

## AI Service Architecture

### Component Hierarchy

```
AIService (Singleton)
├── RateLimiter
│   ├── requestTimestamps[] (sliding window)
│   ├── canMakeRequest()
│   └── getRemainingRequests()
│
├── Methods
│   ├── extractRoles()
│   ├── generateTasks()
│   ├── getRACIAdvice()
│   ├── classifyProjectType()
│   ├── isAvailable()
│   └── cancelRequest()
│
├── Private callAI<T>()
│   ├── Rate limit check
│   ├── Prompt substitution
│   ├── AbortController setup
│   ├── 30s timeout
│   ├── Fetch request
│   └── Response parsing
│
└── Fallback System (AI_FALLBACKS)
    ├── getRoles() → Role names by type
    ├── getTasks() → Task objects by type
    └── getRACIMatrix() → Matrix by roles/tasks
```

---

## Data Flow: Request to Response

### Successful Request

```
AIService.extractRoles(description)
  ↓
RateLimiter.canMakeRequest()? ✓
  ↓
getQuickPresetInfo("roleExtraction")
  ↓
Substitute {{projectDescription}} in prompt
  ↓
POST /api/generate with:
  {
    prompt: "Extract 5-8 key roles from: {{...}}",
    maxTokens: 200,
    temperature: 0.7
  }
  ↓
Response: { result: "[\"Role1\", \"Role2\"]", confidence: 0.85 }
  ↓
Parse JSON, add confidence
  ↓
Return AIRoleSuggestion { roles: [...], confidence: 0.85 }
  ↓
DescriptionPanel receives roles
  ↓
Create RaciRole[] with IDs
  ↓
Call onGenerateRoles(roles)
  ↓
RaciEditor updates chart.roles
```

### Failed Request (Rate Limited)

```
AIService.extractRoles(description)
  ↓
RateLimiter.canMakeRequest()? ✗ (11th request)
  ↓
Throw AIError("RATE_LIMITED", "Rate limit exceeded. Retry after 42s")
  ↓
DescriptionPanel.catch(AIError)
  ↓
setError("Rate limited. Please wait 42 seconds before trying again.")
  ↓
User sees error message
  ↓
User waits, can click "Generate" again after 60s window expires
```

### Failed Request (Timeout)

```
AIService.extractRoles(description)
  ↓
RateLimiter.canMakeRequest()? ✓
  ↓
Create AbortController
  ↓
setTimeout(controller.abort(), 30000)
  ↓
fetch(...) with signal: controller.signal
  ↓
[Worker slow to respond]
  ↓
30s elapses → controller.abort()
  ↓
fetch throws AbortError
  ↓
Catch AbortError, throw AIError("TIMEOUT", "Request timed out after 30000ms")
  ↓
DescriptionPanel.catch(AIError)
  ↓
setError("AI request timed out. Try again or use manual entry.")
  ↓
User can retry or enter manually
```

---

## Configuration

### Workers Config (`src/config/workers.ts`)

```typescript
export const WORKER_CONFIG = {
  dev: {
    endpoint: "http://localhost:8787",
    apiKey: "dev-key",
  },
  prod: {
    endpoint: "https://raci-worker.example.com",
    apiKey: process.env.VITE_WORKER_API_KEY,
  },
};

export const AI_CONFIG = {
  maxRetries: 3,
  timeoutMs: 30000,
  rateLimit: {
    maxRequests: 10,
    windowMs: 60000,
  },
};
```

### Prompts Config (`src/config/prompts.json`)

```json
{
  "roleExtraction": {
    "prompt": "Extract 5-8 key roles from this project description: {{projectDescription}}\n\nRespond with only a JSON array of role names (strings), no additional text.",
    "variables": ["projectDescription"],
    "maxTokens": 200
  }
  // ... other prompts
}
```

---

## Error Handling

### Error Type Hierarchy

```
Error
└── AIError
    ├── code: string
    │   ├── "RATE_LIMITED"
    │   ├── "TIMEOUT"
    │   ├── "NETWORK_ERROR"
    │   ├── "API_ERROR"
    │   ├── "INVALID_RESPONSE"
    │   ├── "CONFIG_ERROR"
    │   └── "INVALID_PROMPT"
    │
    └── context?: {
        retryAfter?: number (for RATE_LIMITED)
      }
```

### User-Facing Error Messages

| AIError Code     | User Message                                          | Recommended Action       |
| ---------------- | ----------------------------------------------------- | ------------------------ |
| RATE_LIMITED     | "Rate limit exceeded. Retry after Xs"                 | Wait, then retry         |
| TIMEOUT          | "AI request timed out. Try again or use manual entry" | Retry or enter manually  |
| NETWORK_ERROR    | "Network error. Check connection and try again"       | Fix network, retry       |
| API_ERROR        | "AI API error: [details]"                             | Retry or contact support |
| INVALID_RESPONSE | "AI returned unexpected format"                       | Retry request            |
| CONFIG_ERROR     | "AI endpoint not configured"                          | Contact support          |

---

## Rate Limiting

### Implementation

```typescript
class RateLimiter {
  requestTimestamps: number[] = [];
  maxRequests = 10;
  windowMs = 60000;

  canMakeRequest(): boolean {
    const now = Date.now();

    // Remove old timestamps outside window
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < this.windowMs
    );

    // Check capacity
    if (this.requestTimestamps.length < this.maxRequests) {
      this.requestTimestamps.push(now);
      return true;
    }
    return false;
  }

  getRetryAfterMs(): number {
    if (this.requestTimestamps.length === 0) return 0;
    const oldestTimestamp = this.requestTimestamps[0];
    return oldestTimestamp + this.windowMs - Date.now();
  }
}
```

### Behavior

```
Minute 0-60:
  Req 1-10: ✓ Allowed
  Req 11: ✗ Blocked ("Rate limit exceeded")
  Req 12: ✗ Blocked
  ...

Minute 60 (T+60s):
  Req 1's timestamp expires from window
  Req 11 (retry): ✓ Allowed
  Req 12: ✓ Allowed
  ...
```

---

## Timeout Handling

### AbortController Pattern

```typescript
private async callAI<T>(promptType, variables, requestId) {
  const controller = new AbortController();
  this.abortControllers.set(requestId, controller);

  const timeoutId = setTimeout(() => {
    controller.abort(); // Triggers AbortError in fetch
  }, 30000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      // ... other options
    });
    clearTimeout(timeoutId);
    return parseResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new AIError("TIMEOUT", "Request timed out after 30000ms");
    }
    throw error;
  } finally {
    this.abortControllers.delete(requestId);
  }
}
```

### Cancellation Support

```typescript
// In DescriptionPanel
const requestIdRef = useRef<string | null>(null);

const handleGenerate = async () => {
  const requestId = `gen-${Date.now()}`;
  requestIdRef.current = requestId;

  try {
    await aiService.extractRoles(description, requestId);
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

---

## Fallback System

### Activation Logic

```
Try AI request
  ↓
[Success] → Return AI results
  ↓
[Failure: timeout, network, api error]
  ↓
Use AI_FALLBACKS[projectType]
  ↓
  ├─ For roles: Pre-configured role names
  ├─ For tasks: Pre-configured task templates
  └─ For matrix: Rotation-based RACI assignment
  ↓
User gets results (doesn't see error)
```

### Fallback Data Structure

```typescript
export const AI_FALLBACKS = {
  getRoles(projectType): string[] {
    // Returns 5-6 common roles for project type
    // e.g., "Mobile App" → ["PM", "Backend Dev", "Frontend Dev", ...]
  },

  getTasks(projectType): Array<{ name; description? }> {
    // Returns 6-8 standard tasks for project type
    // e.g., "Mobile App" → [
    //   {name: "Requirements & Planning", ...},
    //   {name: "System Architecture", ...},
    //   ...
    // ]
  },

  getRACIMatrix(roles, tasks): Record<string, Record<string, RaciValue>> {
    // Generates matrix using rotation pattern:
    // Task i: Role (i % len) = A, Role 0 = R, Others = C
    return matrix;
  },
};
```

### When Fallback is Used

1. ✓ AI timeout (30s exceeded)
2. ✓ Network error (fetch fails)
3. ✓ API error (500, 502, etc.)
4. ✓ Invalid response (unparseable JSON)
5. ✗ Rate limited (error shown instead)
6. ✗ Config error (missing API key - error shown)

---

## Integration Points

### 1. DescriptionPanel Component

```typescript
interface DescriptionPanelProps {
  description: string;
  onChange: (description: string) => void;
  onGenerateRoles?: (roles: RaciRole[]) => void;
  onGenerateTasks?: (tasks: RaciTask[]) => void;
  disabled?: boolean;
}
```

**Responsibilities**:

- Display description textarea
- Manage AI UI state (loading, error, success)
- Call aiService methods
- Transform results into role/task objects
- Call parent callbacks

### 2. RaciEditor Integration

```typescript
<DescriptionPanel
  description={state.chart.description}
  onChange={(desc) => { /* update state */ }}
  onGenerateRoles={(roles) => { /* update state */ }}
  onGenerateTasks={(tasks) => { /* update state */ }}
/>
```

**Responsibilities**:

- Pass current description
- Handle state updates from AI
- Preserve chart immutability

### 3. RaciGeneratorPage (Future)

Could add:

- AI suggestions in modal
- RACI advice for specific tasks
- Project type classification
- Smart matrix population

---

## Testing Strategy

### Unit Tests

```typescript
// ai.ts
describe("RateLimiter", () => {
  test("canMakeRequest allows 10 requests", () => { ... });
  test("canMakeRequest blocks 11th request", () => { ... });
  test("getRetryAfterMs returns correct time", () => { ... });
});

describe("AIService", () => {
  test("extractRoles calls correct endpoint", () => { ... });
  test("timeout after 30s", () => { ... });
  test("cancellation cleans up resources", () => { ... });
});
```

### Integration Tests

```typescript
// DescriptionPanel
describe("DescriptionPanel", () => {
  test("button disabled when no description", () => { ... });
  test("calls onGenerateRoles on success", () => { ... });
  test("shows error on timeout", () => { ... });
  test("shows rate limit message", () => { ... });
});
```

### E2E Tests

```gherkin
Feature: Generate roles and tasks from description
  Scenario: User generates roles and tasks successfully
    Given user enters project description
    When user clicks "Generate from Description"
    Then roles appear in RolesEditor
    And tasks appear in TasksEditor
    And success message shown

  Scenario: User encounters rate limit
    Given user made 10 requests this minute
    When user clicks "Generate"
    Then error message shows retry time
    And button is disabled until retry time passes

  Scenario: Fallback when AI unavailable
    Given AI service is unreachable
    When user clicks "Generate"
    Then roles and tasks generated from fallback
    And no error message shown
```

---

## Performance Considerations

### Memory

- AbortController per request: minimal overhead
- requestTimestamps array: max 10 timestamps (negligible)
- abortControllers Map: cleaned up immediately after request
- No memory leaks

### Network

- Parallel requests: 1 at a time (by design)
- Payload size: ~500 bytes request, ~200 bytes response
- Network usage: minimal

### CPU

- Rate limiter: O(n) where n ≤ 10 (fast filter)
- Prompt substitution: O(m) where m = prompt length
- JSON parsing: standard engine optimization

---

## Security Considerations

### Input Validation

```typescript
// Prompt text is user-controlled but goes to AI only
// No injection risk (template substitution not eval)
// AI provider responsible for safe processing
```

### Rate Limiting

```typescript
// Per-session, not per-user
// Could be bypassed with scripts, but:
//   - Not sensitive operation
//   - Low cost to bypass
//   - More cost to implement user-based limiting
```

### API Keys

```typescript
// Stored in environment variables
// Never logged or exposed
// Sent only in Authorization header to Worker
```

---

## Future Enhancements

### Phase 2: Advanced AI Features

- [ ] RACI advice for specific tasks
- [ ] Batch processing multiple tasks
- [ ] Result caching
- [ ] Confidence scoring UI
- [ ] User feedback loop

### Phase 3: Analytics

- [ ] Track AI suggestion quality
- [ ] Monitor rate limiting effectiveness
- [ ] Measure fallback usage
- [ ] User satisfaction metrics

### Phase 4: Customization

- [ ] Custom fallback data per team
- [ ] Project type templates
- [ ] Prompt customization (admin UI)
- [ ] Multi-language support

---

**Last Updated**: 2025-11-11  
**Status**: ✅ COMPLETE

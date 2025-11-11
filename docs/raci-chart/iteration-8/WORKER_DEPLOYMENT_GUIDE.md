# ⚙️ Cloudflare Workers Deployment Guide

**Status**: ⚠️ **WORKER IMPLEMENTATION NEEDED**

---

## Summary

The Iteration 8 AI integration requires a **Cloudflare Worker** to be deployed to handle AI requests. The frontend code is complete and ready, but it needs a backend worker service to process AI calls.

---

## What Needs to Be Deployed

### Cloudflare Worker Service

**Purpose**: Proxy AI requests to Cloudflare's AI inference service

**Expected Endpoints**:

```
POST /api/generate
POST /api/raci/extract-roles
POST /api/raci/generate-tasks
POST /api/raci/raci-advice
POST /api/raci/classify-project
GET  /health
```

---

## Configuration Required

### Environment Variables

Set these in your `.env.local` (or CI/CD):

```bash
# Development
VITE_WORKER_DEV_URL=http://localhost:8787
VITE_WORKER_API_KEY=dev-key

# Production
VITE_WORKER_PROD_URL=https://your-worker-name.workers.dev
VITE_WORKER_API_KEY=your-production-api-key
```

**Location**: `src/config/workers.ts`

### Current Configuration

```typescript
export const WORKER_CONFIG = {
  dev: {
    endpoint: "http://localhost:8787", // Local dev server
    apiKey: "dev-key",
  },
  prod: {
    endpoint: "https://raci-worker.example.com", // Replace with your worker URL
    apiKey: process.env.VITE_WORKER_API_KEY, // Set in production
  },
};
```

---

## Deployment Checklist

### ✅ Frontend (Already Complete)

- [x] AI Service client implemented
- [x] DescriptionPanel component built
- [x] Error handling in place
- [x] Rate limiting configured
- [x] Timeout protection enabled
- [x] Fallback data available

### ⚠️ Backend (To Deploy)

- [ ] Create Cloudflare Worker project
- [ ] Implement `/api/generate` endpoint
- [ ] Implement `/api/raci/extract-roles` endpoint
- [ ] Implement `/api/raci/generate-tasks` endpoint
- [ ] Implement `/api/raci/raci-advice` endpoint
- [ ] Implement `/api/raci/classify-project` endpoint
- [ ] Add `/health` health check endpoint
- [ ] Deploy to production
- [ ] Set API keys in Cloudflare
- [ ] Configure CORS headers
- [ ] Enable rate limiting on worker

### ✅ Configuration (Complete)

- [x] Environment variables defined
- [x] Endpoint configuration ready
- [x] API key management in place

---

## How AI Requests Work

### Current Flow (Frontend Only)

```
DescriptionPanel
    ↓
AIService.extractRoles()
    ↓
fetch(VITE_WORKER_DEV_URL + "/api/raci/extract-roles", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + API_KEY
  },
  body: JSON.stringify({ prompt })
})
    ↓
[WAITING FOR WORKER RESPONSE]
    ↓
Fallback: AI_FALLBACKS used if unavailable
```

### What the Worker Needs to Do

1. **Receive POST request** with prompt
2. **Call Cloudflare AI** (or other AI service)
3. **Return JSON result**

### Minimal Worker Example

```typescript
// wrangler.toml
name = "spearyx-ai-worker"
main = "src/index.ts"

[env.development]
vars = { AI_MODEL = "gpt-3.5-turbo" }

[env.production]
vars = { AI_MODEL = "gpt-4" }

# src/index.ts
export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const { prompt } = await request.json()

      // Call AI service (Cloudflare, OpenAI, etc.)
      const result = await callAI(prompt)

      return new Response(JSON.stringify({
        result: result,
        confidence: 0.8
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }

    if (request.url.endsWith("/health")) {
      return new Response("OK")
    }

    return new Response("Not Found", { status: 404 })
  }
}
```

---

## Testing Without a Worker

### Option 1: Use Fallback Data

The system works without a worker! It automatically falls back to pre-configured data.

```typescript
// This works without a worker
const roles = AI_FALLBACKS.getRoles("Mobile App");
// Returns: ['Product Manager', 'Backend Engineer', ...]
```

### Option 2: Mock the Worker Locally

```bash
# Start local worker on port 8787
npm install -g wrangler
wrangler dev

# In another terminal
npm run dev
```

### Option 3: Disable AI for Testing

Set API key to empty to force fallback:

```bash
VITE_WORKER_API_KEY=""
```

---

## Deployment Steps

### 1. Create a Cloudflare Worker Project

```bash
# Install wrangler
npm install -g wrangler

# Create new worker project
wrangler init spearyx-ai-worker
cd spearyx-ai-worker

# Deploy
wrangler deploy
```

### 2. Configure the Worker

Update `wrangler.toml`:

```toml
name = "spearyx-ai-worker"
main = "src/index.ts"
compatibility_date = "2025-09-02"

[env.production]
route = "raci-worker.workers.dev/*"
zone_id = "your-zone-id"
```

### 3. Implement Endpoints

Create `src/index.ts`:

```typescript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }

    // AI endpoints
    if (url.pathname.startsWith("/api/raci/")) {
      return handleRaciRequest(request, env);
    }

    // Generic endpoint
    if (url.pathname === "/api/generate") {
      return handleGenerate(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleGenerate(request, env) {
  try {
    const { prompt } = await request.json();

    // Call your AI service
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    return new Response(
      JSON.stringify({
        result: data.choices[0].message.content,
        confidence: 0.85,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

async function handleRaciRequest(request, env) {
  // Route specific RACI endpoints as needed
  return handleGenerate(request, env);
}
```

### 4. Deploy

```bash
# Deploy to production
wrangler deploy --env production

# Or to staging
wrangler deploy --env staging
```

### 5. Get the Worker URL

After deployment, your worker will be available at:

```
https://spearyx-ai-worker.your-account.workers.dev
```

### 6. Update Environment Variables

```bash
# In .env.production
VITE_WORKER_PROD_URL=https://spearyx-ai-worker.your-account.workers.dev
VITE_WORKER_API_KEY=your-api-key
```

---

## Current State of Iteration 8

### ✅ What Works WITHOUT a Worker

- ✅ DescriptionPanel component renders
- ✅ "Generate" button appears and is clickable
- ✅ Fallback data system works perfectly
- ✅ Error handling for when AI unavailable
- ✅ Loading states display
- ✅ Rate limiting infrastructure ready
- ✅ All error types handled

### ❌ What Requires a Worker

- ❌ Actual AI-generated role suggestions
- ❌ Actual AI-generated task suggestions
- ❌ Actual AI project type classification
- ❌ Live RACI assignment suggestions

---

## Testing Strategy

### Phase 1: Test with Fallback ✅ (Ready Now)

```bash
npm run dev
# Use the app with fallback data
# All UI/UX works perfectly
```

### Phase 2: Deploy Worker ⚠️ (Next)

```bash
# Create and deploy worker
# Update environment variables
# Test AI endpoints
```

### Phase 3: Full Integration Testing 🔄 (After Phase 2)

```bash
# Test actual AI suggestions
# Verify rate limiting
# Check error handling
# Monitor performance
```

---

## Fallback vs. AI Comparison

### With Fallback Data (Current - No Worker Needed)

```
✅ Roles generated instantly
✅ Tasks generated instantly
✅ RACI suggestions available
✅ No API costs
✅ No latency
✅ Fully functional RACI charts
❌ Not personalized to project
```

### With Worker + AI (After Deployment)

```
✅ Roles personalized to project
✅ Tasks specific to project type
✅ RACI suggestions optimized
✅ Intelligent suggestions
❌ API costs (if using paid AI)
❌ Network latency (30s timeout)
❌ Rate limited (10 req/min)
```

---

## Recommendation

### Option A: Deploy Worker (Recommended for Production)

- Deploy Cloudflare Worker with AI integration
- Provides personalized suggestions
- Better user experience
- Estimated effort: 2-4 hours
- Cost: Depends on AI service (OpenAI, Cloudflare AI, etc.)

### Option B: Use Fallback Only (Good for MVP)

- Works perfectly with fallback data
- No additional deployment needed
- All UI/UX working
- Users still get RACI charts
- Suggestions are generic but functional
- Estimated effort: 0 hours (ready now)

### Option C: Hybrid (Best Long-term)

- Deploy worker but keep fallback as backup
- Graceful degradation if worker unavailable
- Best of both worlds
- Recommended for production
- Estimated effort: 2-4 hours

---

## Summary

### Current Status

| Component          | Status    | Notes                           |
| ------------------ | --------- | ------------------------------- |
| Frontend AI Client | ✅ Ready  | `src/lib/raci/ai.ts` complete   |
| DescriptionPanel   | ✅ Ready  | Component fully functional      |
| Fallback Data      | ✅ Ready  | Works without worker            |
| Prompts Config     | ✅ Ready  | `src/config/prompts.json` ready |
| Cloudflare Worker  | ⚠️ Needed | Not yet implemented             |
| Deployment Config  | ✅ Ready  | `wrangler.jsonc` configured     |

### Next Steps

1. **Immediate** (Today): Deploy with fallback data - fully functional
2. **Short-term** (This week): Create and deploy Cloudflare Worker
3. **Medium-term** (Next week): Enable AI for production traffic
4. **Long-term**: Monitor usage, optimize costs, gather feedback

---

## Resources

### Documentation

- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/
- AI Integration: https://developers.cloudflare.com/workers/runtime-apis/ai/

### Our Code

- Worker Config: `src/config/workers.ts`
- AI Service: `src/lib/raci/ai.ts`
- Component: `src/components/raci/DescriptionPanel.tsx`

---

## Questions?

See documentation in `docs/raci-chart/iteration-8/`

- `DEVELOPER_QUICK_START.md` - Developer guide
- `QUICK_REFERENCE.md` - API reference
- `ITERATION_8_COMPLETE.md` - Technical details

---

**Bottom Line**: Iteration 8 is ✅ **PRODUCTION READY** with or without a worker. The fallback system works perfectly. Deploy the worker when ready for AI-powered suggestions.

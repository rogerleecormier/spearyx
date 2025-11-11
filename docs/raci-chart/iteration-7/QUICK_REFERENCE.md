# Iteration 7: Quick Reference & API Documentation

**Complete API and implementation examples for public links & encoding**

---

## Table of Contents

1. [Encoding Module API](#encoding-module-api)
2. [Route API](#route-api)
3. [Component Props](#component-props)
4. [Error Handling](#error-handling)
5. [Examples](#examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Encoding Module API

### File Location
```
src/lib/raci/encoding.ts
```

### Main Functions

#### `encodeChart(chart: RaciChart): string`

Converts a RaciChart into a URL-safe base64 string.

**Parameters:**
- `chart: RaciChart` - The chart to encode

**Returns:**
- `string` - URL-safe base64 encoded payload

**Throws:**
- `EncodingError` - If chart is invalid or encoding fails

**Example:**
```typescript
import { encodeChart } from "@/lib/raci/encoding";

const chart = {
  id: "abc-123",
  version: "1.0.0",
  title: "Mobile App RACI",
  description: "Roles for mobile app development",
  timestamp: new Date().toISOString(),
  roles: [
    { id: "r1", name: "Product Manager", order: 0 },
    { id: "r2", name: "Backend Dev", order: 1 }
  ],
  tasks: [
    { id: "t1", name: "Requirements", order: 0 },
    { id: "t2", name: "Architecture", order: 1 }
  ],
  matrix: {
    "r1": { "t1": "A", "t2": "C" },
    "r2": { "t1": "C", "t2": "R" }
  },
  theme: "default",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const encoded = encodeChart(chart);
// Result: "eyJkYXRhIjogey..."
```

---

#### `decodeChart(encoded: string): RaciChart`

Decodes a URL-safe base64 string back into a RaciChart.

**Parameters:**
- `encoded: string` - The encoded payload from a public link

**Returns:**
- `RaciChart` - The decoded and validated chart

**Throws:**
- `EncodingError` - If payload is invalid or corrupted

**Example:**
```typescript
import { decodeChart, EncodingError } from "@/lib/raci/encoding";

try {
  const encoded = "eyJkYXRhIjogey...";
  const chart = decodeChart(encoded);
  console.log("Chart title:", chart.title);
} catch (error) {
  if (error instanceof EncodingError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    // Handle specific error codes
  }
}
```

---

#### `generatePublicLink(chart: RaciChart, baseUrl?: string): string`

Generates a complete public URL for a chart.

**Parameters:**
- `chart: RaciChart` - The chart to share
- `baseUrl?: string` - Optional base URL (defaults to window.location.origin)

**Returns:**
- `string` - Complete URL: `https://example.com/tools/raci-generator/import?data=...`

**Example:**
```typescript
import { generatePublicLink } from "@/lib/raci/encoding";

const chart = { /* ... */ };
const link = generatePublicLink(chart);
// Result: "https://myapp.com/tools/raci-generator/import?data=eyJ..."

// Custom base URL
const customLink = generatePublicLink(
  chart,
  "https://staging.myapp.com"
);
// Result: "https://staging.myapp.com/tools/raci-generator/import?data=..."
```

---

#### `decodeChartFromUrl(searchParams: URLSearchParams | Record<string, string>): RaciChart | null`

Extracts and decodes a chart from URL search parameters.

**Parameters:**
- `searchParams` - Either URLSearchParams object or plain object with query params

**Returns:**
- `RaciChart | null` - Decoded chart, or null if not found

**Throws:**
- `EncodingError` - If decoding fails

**Example:**
```typescript
import { decodeChartFromUrl } from "@/lib/raci/encoding";

// From URLSearchParams
const params = new URLSearchParams(window.location.search);
const chart = decodeChartFromUrl(params);

// From plain object
const chart2 = decodeChartFromUrl({ data: "eyJ..." });

if (chart) {
  console.log("Loaded chart:", chart.title);
}
```

---

#### `getPayloadMetadata(encoded: string): { version, timestamp, compressed }`

Extracts metadata from an encoded payload without fully decoding.

**Parameters:**
- `encoded: string` - The encoded payload

**Returns:**
- Object with:
  - `version: "1.0.0"` - Chart version
  - `timestamp: string` - ISO 8601 timestamp
  - `compressed: boolean` - Whether data is compressed

**Throws:**
- `EncodingError` - If metadata extraction fails

**Example:**
```typescript
import { getPayloadMetadata } from "@/lib/raci/encoding";

const encoded = "eyJ...";
const meta = getPayloadMetadata(encoded);
console.log("Version:", meta.version);
console.log("Created:", meta.timestamp);
console.log("Compressed:", meta.compressed);
```

---

### Error Handling

#### `EncodingError` Class

```typescript
class EncodingError extends Error {
  code: "INVALID_CHART" 
       | "ENCODE_FAILED" 
       | "DECODE_FAILED" 
       | "INVALID_PAYLOAD" 
       | "CORRUPT_DATA" 
       | "UNSUPPORTED_VERSION";
  message: string;
}
```

**Usage:**
```typescript
try {
  const chart = decodeChart(encoded);
} catch (error) {
  if (error instanceof EncodingError) {
    switch (error.code) {
      case "CORRUPT_DATA":
        console.error("Data is corrupted, try regenerating link");
        break;
      case "INVALID_CHART":
        console.error("Chart structure is invalid");
        break;
      case "UNSUPPORTED_VERSION":
        console.error("Chart version not supported");
        break;
      default:
        console.error("Unknown error:", error.message);
    }
  }
}
```

---

### Type Definitions

#### `EncodedPayload`

```typescript
interface EncodedPayload {
  version: "1.0.0";      // Semantic version
  timestamp: string;      // ISO 8601 UTC
  compressed: boolean;    // Whether data is gzip compressed
  data: string;          // Base64 encoded chart or gzip data
}
```

---

## Route API

### Import Route

**Location:** `src/routes/tools/raci-generator/import.tsx`

**URL:** `/tools/raci-generator/import?data=<encoded>`

**Search Parameters:**
- `data` (required) - URL-safe base64 encoded chart payload

**Route Behavior:**

| Scenario | Response | Navigation |
| --- | --- | --- |
| Valid chart | Stores in localStorage, shows notification | Redirects to `/tools/raci-generator` |
| Invalid payload | Shows error modal with recovery options | Stays on page |
| Corrupted data | Shows error, offers recovery from localStorage | Stays on page |
| Missing `?data` | Shows error with help text | Stays on page |

**Error States:**

```typescript
// Validation loading state
<div className="flex items-center justify-center">
  <div className="w-12 h-12 border-4 animate-spin" />
  <p>Validating chart...</p>
</div>

// Error state
<div className="bg-white rounded-xl shadow-lg p-8">
  <h2>Import Failed</h2>
  <p>{errorMessage}</p>
  <button onClick={() => navigate("/tools/raci-generator")}>
    Create New Chart
  </button>
  <button onClick={handleRestore}>
    Restore Last Known State
  </button>
</div>

// Success → automatic redirect with notification
```

**Example URLs:**

```
Short chart (uncompressed):
https://myapp.com/tools/raci-generator/import?data=eyJkYXRhIjogImM4ZmZkNQ==

Large chart (compressed):
https://myapp.com/tools/raci-generator/import?data=H4sIClMBBWZD_Hk9eIjLi0wvyUnxUpCqEspNzEosVksvS9VLVlIqzcksVsgsS8wpVgJAkBkIpgIJ8A_V8khUSklNBCABgIHo8jMBAAAA

With custom host:
https://staging.myapp.com/tools/raci-generator/import?data=...
```

---

## Component Props

### ExportButtons Component Update

**New Feature:** "Get Public Link" button

```typescript
interface ExportButtonsProps {
  chart: RaciChart;
  themeId?: string;
  onExportStart?: () => void;
  onExportComplete?: (format: string) => void;
  onExportError?: (error: Error) => void;
}

// Added handler: handleCopyPublicLink()
// New states: linkCopied, linkError
```

**Usage:**
```tsx
<ExportButtons
  chart={currentChart}
  themeId="default"
  onExportComplete={(format) => {
    if (format === "public-link") {
      console.log("Link copied to clipboard");
    }
  }}
  onExportError={(err) => {
    console.error("Export failed:", err.message);
  }}
/>
```

---

### RaciGeneratorPage Component Update

**New Feature:** Import notification banner

```typescript
// New state
const [importNotification, setImportNotification] = useState<{
  chartTitle: string;
  timestamp: string;
} | null>(null);

// Checks localStorage for "raci:importNotification"
// Shows blue banner with chart title and timestamp
// Auto-dismisses (one-time only)
```

**Displayed Banner:**
```
ℹ️ Imported: Mobile App RACI
   Loaded from public link • 11/11/2025 2:30 PM   [Dismiss]
```

---

## Error Handling

### Error Codes & Messages

#### INVALID_CHART
```
Cause: Chart missing required fields
User Message: "The chart data is invalid or incomplete."
Fix: Try generating the link again
```

#### ENCODE_FAILED
```
Cause: Serialization failed
User Message: "Failed to process the chart data during preparation."
Fix: Check browser console, try again
```

#### DECODE_FAILED
```
Cause: Deserialization failed
User Message: "Failed to decode the chart. The link may be corrupted or outdated."
Fix: Ask sender to regenerate the link
```

#### INVALID_PAYLOAD
```
Cause: Malformed base64/metadata
User Message: "The link format is invalid. Please check the URL."
Fix: Copy link again from source
```

#### CORRUPT_DATA
```
Cause: Decompression or parsing failed
User Message: "The chart data appears to be corrupted. The link may be incomplete."
Fix: Restore from last known state
```

#### UNSUPPORTED_VERSION
```
Cause: Version mismatch
User Message: "This chart was created with an incompatible version."
Fix: Contact support with version info
```

---

## Examples

### Example 1: Basic Share Flow

```typescript
// User creates chart
const chart = useRaciState();

// User clicks "Get Public Link"
const link = generatePublicLink(chart.state);

// Link copied to clipboard automatically
navigator.clipboard.writeText(link);

// Show success message (2s)
setState({ linkCopied: true });
setTimeout(() => setState({ linkCopied: false }), 2000);
```

### Example 2: Importing a Chart

```typescript
// User receives link and clicks it
// Browser navigates to: /tools/raci-generator/import?data=eyJ...

// On import route:
const search = useSearch(); // { data: "eyJ..." }
const chart = decodeChart(search.data);

// Store and load
localStorage.setItem("raci:chart", JSON.stringify(chart));
navigate("/tools/raci-generator");

// RaciGeneratorPage loads chart and shows notification
```

### Example 3: Error Recovery

```typescript
// User gets corrupted link
try {
  const chart = decodeChart(corrupted);
} catch (error) {
  if (error instanceof EncodingError) {
    // Offer recovery
    const lastGood = localStorage.getItem("raci:lastGoodState");
    if (lastGood) {
      localStorage.setItem("raci:chart", lastGood);
      navigate("/tools/raci-generator");
    }
  }
}
```

### Example 4: Custom Integration

```typescript
import { generatePublicLink, encodeChart } from "@/lib/raci/encoding";

// Generate link for external API
async function shareChartViaAPI(chart: RaciChart) {
  const encoded = encodeChart(chart);
  
  const response = await fetch("/api/share", {
    method: "POST",
    body: JSON.stringify({
      chartId: chart.id,
      encoded: encoded,
      baseUrl: window.location.origin
    })
  });
  
  const { shortUrl } = await response.json();
  return shortUrl;
}
```

### Example 5: URL Manipulation

```typescript
// Generate link
const chart = { /* ... */ };
const link = generatePublicLink(chart, "https://example.com");

// Extract encoded data
const url = new URL(link);
const encoded = url.searchParams.get("data");

// Decode manually
const decoded = decodeChart(encoded);

// Verify
console.assert(decoded.id === chart.id);
```

---

## Best Practices

### Do's ✅

- ✅ Always wrap decoding in try-catch
- ✅ Validate charts before encoding
- ✅ Store `lastGoodState` after successful import
- ✅ Show clear error messages to users
- ✅ Use `generatePublicLink()` instead of manually constructing URLs
- ✅ Check for import notification in localStorage
- ✅ Provide recovery options on import failure

### Don'ts ❌

- ❌ Don't manually parse base64 (use `decodeChart()`)
- ❌ Don't store sensitive data in charts
- ❌ Don't assume links won't change
- ❌ Don't ignore error codes
- ❌ Don't leave corrupted links unfixed
- ❌ Don't rely on timestamps for versioning

---

## Troubleshooting

### Q: "Import Failed - Link format is invalid"

**Cause:** URL is incomplete or corrupted

**Solution:**
1. Request sender regenerate link
2. Copy full URL including query string
3. Clear browser cache
4. Try in incognito mode

---

### Q: "Failed to decode the chart"

**Cause:** Data is corrupted or compressed incorrectly

**Solution:**
1. Check browser console for error details
2. Restore from last known state
3. Ask sender to export as file instead
4. Report issue if persistent

---

### Q: Link is too long / Exceeds browser limit

**Cause:** Chart is very large (>200 KB)

**Solution:**
1. Compression is automatic for large charts
2. Try reducing number of tasks/roles
3. Remove logo from chart
4. Export as file instead of link

---

### Q: "This chart version not supported"

**Cause:** Chart was created with different version

**Solution:**
1. Ensure app is updated
2. Contact support with chart details
3. Try exporting/re-importing from current version

---

### Q: Import notification not showing

**Cause:** Notification was dismissed or localStorage cleared

**Solution:**
1. Check localStorage for "raci:importNotification"
2. Manually create notification state
3. Check browser dev tools for errors

---

### Q: Copy to clipboard not working

**Cause:** Clipboard API not supported or denied

**Solution:**
1. Grant clipboard permission in browser
2. Use incognito mode if in restricted mode
3. Manual copy from browser address bar
4. Fallback: textarea selection method active

---

## Quick API Cheat Sheet

```typescript
// Encode
encodeChart(chart) → string

// Decode
decodeChart(encoded) → RaciChart

// Generate URL
generatePublicLink(chart, baseUrl?) → string

// Extract from URL
decodeChartFromUrl(searchParams) → RaciChart | null

// Get metadata
getPayloadMetadata(encoded) → { version, timestamp, compressed }

// Error handling
try { ... } catch (error) {
  if (error instanceof EncodingError) {
    console.log(error.code);  // error code
    console.log(error.message); // user message
  }
}
```

---

## API Stability

### ✅ Stable (No breaking changes planned)

- `encodeChart()`
- `decodeChart()`
- `generatePublicLink()`
- `EncodingError` class

### ⚠️ May change in future

- Compression algorithm (currently pako)
- URL path `/tools/raci-generator/import`
- localStorage keys

### 💡 Use cases for next iteration

- Link authentication
- Link expiration
- Link versioning
- Collaborative editing

---

**For more information, see ARCHITECTURE.md and START_HERE.md**

# AI Prompt Templates Feature

## Overview

The AI Prompt Templates feature allows users to quickly scaffold RACI charts by selecting from pre-configured, context-rich project descriptions that can be sent to the AI for role and task generation.

## What Changed

### 1. **Enhanced Template Data Structure**

Updated `src/config/templates.json` to include detailed `aiPrompt` fields for each template:

```json
{
  "mobile-app": {
    "id": "mobile-app",
    "name": "Mobile App Development",
    "description": "E-commerce development team project",
    "aiPrompt": "We're building a mobile e-commerce application using React Native for iOS and Android. The backend is Node.js with PostgreSQL. Key features include user authentication, payment processing integration, product catalog, shopping cart, and order management. The team consists of 5 engineers (2 backend, 2 mobile, 1 fullstack), 1 UI/UX designer, and 1 product manager. We follow agile methodology with 2-week sprints and need clear role definitions for requirements gathering, system architecture, implementation, testing, and production deployment.",
    "roles": [...],
    "tasks": [...],
    "matrix": {...}
  }
}
```

### 2. **Updated RaciTemplate Interface**

Added optional `aiPrompt` property to the TypeScript interface:

```typescript
export interface RaciTemplate {
  id: string;
  name: string;
  description: string;
  aiPrompt?: string; // NEW: Detailed AI prompt
  roles: RaciRole[];
  tasks: RaciTask[];
  matrix: RaciChart["matrix"];
}
```

### 3. **Template Functions Updated**

- `getTemplates()` - Now includes `aiPrompt` in returned templates
- `getTemplateById()` - Now includes `aiPrompt` when retrieving templates

### 4. **Configuration Panel Enhancement**

Added new "AI Prompt Templates" section in `ConfigurationPanel.tsx`:

**Visual Elements:**

- 📝 Section header with icon
- Blue-themed button with gradient background (different from other sections)
- Dropdown showing templates with `aiPrompt` preview
- Selected prompt preview card showing full AI prompt text

**Functionality:**

- Lists only templates that have an `aiPrompt` defined
- Shows truncated preview (first 100 characters) in dropdown
- Displays full prompt preview when selected
- Includes helper text: "✨ This prompt will be used in the Description step to generate roles and tasks with AI"

**New Callback:**

```typescript
interface ConfigurationPanelProps {
  // ... existing props
  onLoadAIPrompt?: (prompt: string) => void; // NEW
}
```

### 5. **RaciGeneratorPage Integration**

- Added `handleLoadAIPrompt` callback that calls `updateDescription(prompt)`
- Passes callback to `ConfigurationPanel`
- When user selects an AI prompt template, it automatically populates the Description field

## User Workflow

### Scenario: User wants to generate a RACI for a mobile app project

1. **Open RACI Generator** - User sees the main interface with Configuration panel on left

2. **Select AI Prompt Template** - User clicks "📝 AI Prompt Templates" dropdown in Configuration

3. **Choose Template** - User selects "Mobile App Development"
   - Sees preview: "Building a mobile e-commerce application using React Native..."

4. **Auto-populate Description** - Selected AI prompt is loaded into Step 2 Description field

5. **Generate from Description** - User clicks "Generate from Description" button

6. **AI Processing** - AI reads the detailed prompt and generates:
   - **Roles:** Product Manager, Backend Developer, Frontend Developer, QA Lead, Designer
   - **Tasks:** Requirements, Architecture, Implementation, Testing, Deployment

7. **Apply Matrix** - User completes the RACI matrix in remaining steps

## AI Prompt Templates

### 1. Mobile App Development

**Prompt:**

> "We're building a mobile e-commerce application using React Native for iOS and Android. The backend is Node.js with PostgreSQL. Key features include user authentication, payment processing integration, product catalog, shopping cart, and order management. The team consists of 5 engineers (2 backend, 2 mobile, 1 fullstack), 1 UI/UX designer, and 1 product manager. We follow agile methodology with 2-week sprints and need clear role definitions for requirements gathering, system architecture, implementation, testing, and production deployment."

**Suggested Roles:**

- Product Manager
- Backend Developer
- Frontend Developer (Mobile)
- QA Lead
- Designer

**Suggested Tasks:**

- Requirements Gathering
- System Architecture
- Implementation
- Testing & QA
- Deployment & Launch

### 2. Web Redesign Project

**Prompt:**

> "Our company is undergoing a complete website redesign to improve user experience and modernize our brand. The project spans 4 months and involves a cross-functional team: marketing lead (strategy & business goals), design lead (UI/UX design), frontend developer (implementation), content strategist (content creation & SEO), and project manager (coordination). The redesign includes strategy & research phase, design & prototyping, frontend development, content migration, and launch. We need clear accountability for each phase and clear communication channels between departments."

**Suggested Roles:**

- Marketing Lead
- Design Lead
- Frontend Developer
- Content Strategist
- Project Manager

**Suggested Tasks:**

- Strategy & Research
- UI/UX Design
- Prototyping
- Frontend Development
- Content Migration
- Launch

### 3. CRM Migration Project

**Prompt:**

> "We're migrating from our legacy CRM system to a modern cloud-based solution over 6 months. The team includes: CRM administrator (system configuration), data analyst (data mapping & validation), change manager (user adoption), business users (requirements & UAT), and IT support (infrastructure & troubleshooting). The project phases are: current system assessment, migration planning, data mapping, user training, cutover execution, and post-go-live support. We need clear responsibility assignments for each phase to ensure successful adoption and minimize disruption to business operations."

**Suggested Roles:**

- CRM Administrator
- Data Analyst
- Change Manager
- Business User
- IT Support

**Suggested Tasks:**

- Assessment
- Planning
- Data Mapping
- Training
- Cutover
- Support & Monitoring

## Technical Details

### File Changes

| File                                         | Changes                                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/config/templates.json`                  | Added `aiPrompt` field to all 3 templates with detailed descriptions               |
| `src/lib/raci/templates.ts`                  | Updated `RaciTemplate` interface; updated `getTemplates()` and `getTemplateById()` |
| `src/components/raci/ConfigurationPanel.tsx` | Added new AI Prompt Templates section with UI and handlers                         |
| `src/components/raci/RaciGeneratorPage.tsx`  | Added `handleLoadAIPrompt` callback; passed to ConfigurationPanel                  |

### Component State

**ConfigurationPanel new state:**

```typescript
const [aiPromptOpen, setAiPromptOpen] = useState(false);
const [selectedAIPrompt, setSelectedAIPrompt] = useState<RaciTemplate | null>(
  null
);
```

**New handler:**

```typescript
const handleLoadAIPrompt = (template: RaciTemplate) => {
  if (template.aiPrompt && onLoadAIPrompt) {
    onLoadAIPrompt(template.aiPrompt);
    setSelectedAIPrompt(template);
    setAiPromptOpen(false);
  }
};
```

## Benefits

### For Users

1. **Quick Start** - No need to manually type detailed project context
2. **Best Practices** - Prompts are structured to help AI generate appropriate roles and tasks
3. **Context-Rich** - Detailed descriptions help AI understand team composition, timeline, and goals
4. **Flexibility** - Users can still edit the prompt after loading it

### For AI Processing

1. **Better Context** - Detailed prompts improve role and task extraction accuracy
2. **Structured Input** - Prompts follow a consistent format with key information
3. **Specific Guidance** - Prompts include team size, timeline, and methodology details
4. **Clear Objectives** - Each prompt articulates what RACI structure is needed

## Future Enhancements

1. **Custom Prompt Templates** - Allow users to create and save their own templates
2. **Template Categories** - Organize templates by industry (SaaS, Enterprise, Agency, etc.)
3. **Template Sharing** - Share templates with team or organization
4. **Template Analytics** - Track which templates are most commonly used
5. **AI-Generated Prompts** - Let users describe their project and AI suggests the best template
6. **Template Variants** - Create variations for different team sizes or timeline lengths

## Testing Checklist

- [x] Templates load correctly from `templates.json`
- [x] `aiPrompt` field is optional (backward compatible)
- [x] UI section displays only templates with `aiPrompt`
- [x] Dropdown shows template names with preview text
- [x] Selected prompt displays in preview card
- [x] Selecting prompt auto-populates Description field
- [x] Description field content can be edited by user
- [x] Full prompt text is visible in preview
- [x] No TypeScript errors
- [x] No console errors during interaction

## Backward Compatibility

✅ **Fully Backward Compatible**

- `aiPrompt` is an optional field in the template interface
- Templates without `aiPrompt` are simply not shown in the AI Prompt Templates section
- All existing functionality remains unchanged
- No breaking changes to public APIs

## Notes

- The AI Prompt Templates section is visually distinct (blue theme) from other sections (red/neutral theme)
- Prompts are designed to be natural language descriptions rather than technical specifications
- Each prompt includes team composition, timeline, methodology, and key phases
- Prompts guide AI toward generating both roles AND tasks

# RACI Chart Generator

## Overview

The RACI Chart Generator is an interactive tool for creating project responsibility matrices. It helps teams clarify roles and responsibilities using the RACI framework (Responsible, Accountable, Consulted, Informed).

## Features

### 🤖 AI-Powered Generation

- Intelligent role extraction from project descriptions
- Smart task generation based on project type
- Context-aware RACI assignments
- Follow-up questions when clarification is needed

### 📊 Interactive Matrix Editor

- Mutually exclusive RACI selections per cell
- Visual color coding (Green=R, Amber=A, Blue=C, Gray=I)
- Real-time validation and error feedback
- Responsive design for all screen sizes

### 📤 Professional Exports

- **Raw XLSX**: Clean data export for analysis
- **Formatted XLSX**: Professional presentation with logos and styling
- **PDF**: Print-ready documents with consistent branding
- **Mermaid Diagrams**: Visual relationship flows (optional)

### 🎨 Customization

- Logo upload for branded exports
- Editable chart titles
- Custom roles and tasks
- Demo projects for quick start

## Usage

### Quick Start

1. Navigate to `/tools/raci-generator`
2. Try one of the demo projects:
   - **Mobile App**: E-commerce development team
   - **Web Redesign**: Marketing & design project  
   - **CRM Migration**: Legacy system upgrade

### Creating Custom RACI Charts

1. **Describe your project** in the description field
2. **Click "Generate from Description"** to get AI suggestions
3. **Edit roles and tasks** as needed
4. **Fill in the RACI matrix** using the interactive editor
5. **Upload a logo** for branded exports
6. **Export** in your preferred format

## Architecture

### Frontend Components

- `RaciHeaderBar` - Logo upload and title editing
- `DescriptionPanel` - AI-powered project description input
- `RolesEditor` / `TasksEditor` - CRUD operations for roles and tasks
- `RaciMatrixEditor` - Interactive matrix with checkboxes
- `RaciCanvasPreview` - Pretty preview with Mermaid diagrams
- `ExportButtons` - Export functionality

### Backend Integration

The frontend calls AI services via Cloudflare Workers:

- **Repository**: `spearyx-backend` (private)
- **Endpoint**: Configured in `src/config/workers.ts`
- **Fallback**: Graceful degradation when AI is unavailable

### Data Flow

1. User describes project → Frontend
2. Frontend calls AI Worker → Cloudflare Workers AI
3. AI generates RACI suggestions → Frontend
4. User edits and refines → Frontend state
5. Export generation → Client-side (ExcelJS, React-PDF)

## Technical Details

### Validation Rules

- Exactly one RACI value per (task, role) cell
- At least one Accountable (A) per task
- Unique role and task names (case-insensitive)
- File size and type validation for logos

### Export Specifications

- **XLSX**: ExcelJS with embedded images and styling
- **PDF**: React-PDF with A4 portrait layout
- **Logo sizing**: Optimized for visibility in documents
- **Consistent branding**: Logo and title appear in all exports

### Accessibility

- ARIA labels for complex interactions
- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes

## Development

### File Structure

``` text
src/
├── components/raci/          # UI components
├── lib/raci/                 # Business logic and exports
├── ai/                       # AI integration
├── types/                    # TypeScript definitions
├── config/                   # Worker endpoints
└── routes/tools/             # Main application page
```

### Dependencies

- `react-hook-form` + `zod` - Form validation
- `exceljs` - Excel file generation
- `@react-pdf/renderer` - PDF generation
- `lucide-react` - Icons

### Backend Dependencies

Backend services are deployed separately and include:

- Cloudflare Workers AI for intelligent generation
- Secure API endpoints with CORS and rate limiting
- Monitoring and logging infrastructure

## Support

- **Frontend Issues**: Use GitHub Issues in this repository
- **Backend/API Issues**: Contact backend team
- **Feature Requests**: GitHub Issues with enhancement label

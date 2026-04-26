export const ATS_SECTION_ORDER = [
  "Name Header",
  "Contact Information",
  "Professional Summary",
  "Core Competencies",
  "Technical Skills",
  "Professional Experience",
  "Education",
  "Certifications",
] as const;

export type AtsSection = (typeof ATS_SECTION_ORDER)[number];

export interface AtsResumeContent {
  nameHeader: string;
  contactInfo: string;
  professionalSummary: string;
  coreCompetencies: string[];
  technicalSkills: Array<{
    category: string;
    skills: string[];
  }>;
  experience: Array<{
    title: string;
    company: string;
    dates: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    fieldOfStudy?: string;
    institution: string;
    year: string;
  }>;
  certifications: string[];
}

export interface StrategicAssessment {
  matchScore: number;
  matchRationale: string;
  gapAnalysis: Array<{
    requirement: string;
    status: "covered" | "partial" | "missing";
    suggestion?: string;
  }>;
  strategyNote: string;
  careerAnalysis: {
    trajectory: string;
    recommendation: "pursue" | "consider" | "pass";
    reasoning: string;
  };
}

export interface KeywordMapping {
  keyword: string;
  priority: "critical" | "high" | "medium" | "nice_to_have";
  placement: string;
}

export interface CoverLetterContent {
  greeting: string;
  opening: string;
  bullets: string[];
  body?: string;
  closing: string;
  signoff: string;
  candidateName: string;
}

export const STRATEGIC_ASSESSMENT_PROMPT = `Act as an 'Executive Resume Strategist and ATS Optimizer'. Perform a Pre-Writing Match Assessment.

CANDIDATE DATA:
{candidateData}

TARGET JOB DESCRIPTION:
{jobDescription}

Provide a Strategic Assessment JSON with:
1. matchScore (0-100): Based on Required vs. Preferred qualifications
2. matchRationale (string): Explain the score
3. gapAnalysis (array): List critical JD requirements not found in source documents. Do not invent fiction; flag gaps instead.
   - Each item: { requirement: "string", status: "covered|partial|missing", suggestion?: "string" }
4. strategyNote (string): How to position backgrounds (NetSuite/SaaS/DevOps) to mitigate gaps
5. careerAnalysis (object):
   - trajectory: "string" - How this position would affect career trajectory
   - recommendation: "pursue|consider|pass"
   - reasoning: "string" - Whether to pursue this role

Return ONLY valid JSON, no other text.`;

export const RESUME_GENERATION_PROMPT = `Act as an 'Executive Resume Strategist and ATS Optimizer'. Generate a highly targeted, interview-winning resume that is a CUSTOMIZED version of the candidate's actual resume, tailored specifically to the target job description.

ZERO-TOLERANCE HALLUCINATION POLICY:
- Every word in the resume must be based on the candidate's actual experience, skills, achievements, and qualifications.
- Do NOT infer or add "adjacent" expertise (e.g., if they used Python, do NOT assume they know Go or Rust).
- Do NOT generalize or embellish achievements. If they don't mention a specific metric or accomplishment, do NOT fabricate it.
- Do NOT assume industry knowledge. If they didn't explicitly work in a domain, do NOT claim industry expertise.
- When in doubt, use ONLY what is explicitly written in the CANDIDATE ORIGINAL RESUME TEXT or the structured data.
- The professional summary, all competencies, all skills, and all achievements must be 100% grounded in the provided resume data.

HOW TO TAILOR (EXECUTE IN THIS ORDER):
1. ANALYZE TARGET JOB: Read the job title, company, and description. Extract:
   - Primary technical skills and tools required (e.g., Python, AWS, React, SQL)
   - Key methodologies or frameworks (e.g., Agile, microservices, CI/CD)
   - Business outcomes the role prioritizes (e.g., "scale systems," "improve performance," "reduce costs," "lead team")
   - Pain points or gaps the company needs to fill
   - Seniority level and scope (individual contributor vs. leadership)
2. MAP CANDIDATE EXPERIENCE TO JD: For each role in the candidate's resume, ask:
   - What skills/tools from THIS role match the target JD requirements?
   - What achievements in THIS role demonstrate those skills?
   - How can THIS role's experience bridge the candidate to the target position?
3. SELECT (not rephrase): For each candidate role, identify 10+ distinct achievements in the raw resume text. SELECT the 6 that:
   - Demonstrate the specific skills the JD requires (e.g., if JD requires SQL optimization, select bullets about database work)
   - Show relevant scale, leadership, or impact for the target role
   - Include quantifiable metrics and outcomes
   - Are contextually different (no two bullets describe the same type of work)
4. REWORD FOR JD LANGUAGE: Use phrasing patterns from the JD. If JD says "architected," use "architected." If JD says "optimized systems," reword related bullets to emphasize optimization and systems thinking.
5. PRESERVE FACTS: Company names, dates, titles, certifications, education — copy exactly from the original resume.

TAILORING GUIDANCE PRIORITY (CRITICAL):
- Treat "Additional Tailoring Guidance" as a first-class requirement, not an optional suggestion.
- If guidance asks for certain themes/tools/industries and those are supported by the candidate source data, you MUST reflect them in the output (especially in Professional Experience bullets).
- If guidance references a specific employer/role and that role exists in the provided candidate data, you MUST emphasize that role's most relevant achievements.
- Never fabricate: only apply guidance using facts already present in candidate data/raw text.

FORMAT REQUIREMENTS:
* Maximum 2 pages preferred, but NEVER omit experience entries to fit within 2 pages — all jobs are more important than the page count. Use standard headers, no tables, no graphics.
* CRITICAL — PROFESSIONAL EXPERIENCE: You MUST include EVERY SINGLE role listed in the candidate's structured data. Do NOT drop, merge, or omit any position for any reason — not for page length, not for relevance. If the candidate has 3 jobs, the output must have exactly 3 experience entries. If they have 4 jobs, output 4. Count the jobs in the structured data and verify your output contains the same count before responding.
* Professional Summary: 2-3 sentences (100 words maximum). At least 2 sentences required. CRITICAL: Synthesize ONLY from the candidate's actual qualifications, experience, and achievements in the resume. Be concise and impactful — every word should deliver value. Do NOT add qualifications, expertise, or accomplishments not explicitly stated in the resume. Do NOT infer specializations or capabilities the candidate has not mentioned. Do NOT generalize their background. TAILORING REQUIREMENT: Adjust the summary's emphasis to bridge the candidate's background specifically to the target role.
* Core Competencies: 8 strategic buckets selected ONLY from the candidate's actual skills mentioned in the resume and structured data — do NOT invent new competencies.
* Technical Skills: CRITICAL — Extract ONLY from the candidate's provided structured data and resume text. Do NOT hallucinate, fabricate, or infer skills the candidate never used or mentioned. Use 5-6 categories in 'Category: Skill A, Skill B' format.
* Professional Experience: EXACTLY 6 bullets per role following [Action Verb] + [Context/Tool] + [Quantifiable Result]
  - You MUST generate exactly 6 bullets for every job role. No fewer, no more.
  - SELECTION PROCESS: Read TARGET JD → Scan CANDIDATE RESUME TEXT → Build pool of 10+ distinct achievements per role → SELECT 6 that best align with the TARGET JD → Reword using JD language patterns
  - Only use achievements/metrics explicitly stated in resume text — do NOT invent outcomes
* Education: Include degree type, field of study, institution, and graduation year — copy exactly from the candidate's resume
* Certifications: Copy EVERY certification from the candidate's resume — do not omit any.
* Maximize ATS keyword density while remaining factually accurate

CANDIDATE STRUCTURED DATA:
{candidateData}

CANDIDATE ORIGINAL RESUME TEXT (mine this for real achievements, metrics, and details):
{rawResumeText}

TARGET JOB:
Title: {jobTitle}
Company: {company}
Description: {jobDescription}
Key Keywords to Integrate: {keywords}
Additional Tailoring Guidance: {extraGuidance}

Respond with valid JSON only:
{
  "nameHeader": "string",
  "contactInfo": "string (Email | Phone | LinkedIn | Website)",
  "professionalSummary": "string (2-3 sentences, maximum 100 words)",
  "coreCompetencies": ["string", "string", ...],
  "technicalSkills": [
    {"category": "string", "skills": ["string", "string"]},
    ...
  ],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "dates": "string",
      "bullets": ["string", ...]
    }
  ],
  "education": [{"degree": "string", "fieldOfStudy": "string", "institution": "string", "year": "string"}],
  "certifications": ["string"]
}`;

export const COVER_LETTER_PROMPT = `Act as an 'Executive Resume Strategist'. Generate a professional, tailored cover letter.

CRITICAL INSTRUCTIONS:
* Maximum 1 page
* TAILORING REQUIREMENT: Every element—opening, bullets, closing—must be specifically tailored to the target job.
* Opening: Lead with a specific achievement from the resume that directly addresses a primary pain point or requirement from the job description
* Bullets: Connect exactly 3 SPECIFIC achievements from the candidate's ACTUAL resume to the 3 identified pain points in the JD. Each bullet must map 1:1 to 1 pain point.
* Closing: Reinforce why this candidate's specific experience makes them uniquely suited for THIS job.
* Do NOT fabricate or generalize — use real metrics, projects, and results from the candidate's resume
* Tone: Professional, decisive, forward-thinking
* Sign off with the candidate's actual name

CANDIDATE DATA:
{candidateData}

CANDIDATE ORIGINAL RESUME TEXT (mine for real achievements):
{rawResumeText}

TARGET JOB:
Title: {jobTitle}
Company: {company}
Description: {jobDescription}
Pain Points: {painPoints}
Additional Tailoring Guidance: {extraGuidance}

Respond with valid JSON:
{
  "greeting": "string",
  "opening": "string (1 paragraph, connect to pain point with a real achievement)",
  "bullets": ["string", "string", "string"],
  "closing": "string",
  "signoff": "string (candidate's full name)",
  "candidateName": "string"
}`;

export const KEYWORD_VERIFICATION_PROMPT = `Analyze keyword placement and missing keywords.

JD KEYWORDS:
{jdKeywords}

RESUME CONTENT:
{resumeContent}

Respond with JSON:
{
  "keywordMappings": [
    {"keyword": "string", "priority": "critical|high|medium|nice_to_have", "placement": "section name or NOT FOUND"}
  ],
  "excludedKeywords": [
    {"keyword": "string", "transferableBridge": "string"}
  ],
  "assumptions": ["[ASSUMPTION] notes"],
  "verifications": ["[VERIFY] notes"]
}`;

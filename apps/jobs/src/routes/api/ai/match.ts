import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import type { AIEnv } from "../../../lib/ai";

// Helper to get AI binding from context
function getAIFromContext(context: any): AIEnv['AI'] | null {
  let ai = context?.cloudflare?.env?.AI;
  if (!ai) ai = context?.env?.AI;
  if (!ai && typeof globalThis !== 'undefined') {
    const cfEnv = (globalThis as any).__CF_ENV__;
    if (cfEnv) ai = cfEnv.AI;
  }
  if (!ai && typeof globalThis !== 'undefined') {
    ai = (globalThis as any).AI;
  }
  return ai || null;
}

const MATCH_PROMPT = `You are a job matching expert. Analyze how well a candidate matches a job.

Given the candidate's resume/skills and a job description, return a JSON object with:
{
  "matchScore": number (0-100),
  "matchingSkills": string[] (skills the candidate has that match the job),
  "missingSkills": string[] (important skills the job wants that the candidate lacks),
  "summary": string (1-2 sentence summary of the match)
}

Be realistic but encouraging. Focus on the most important 3-5 skills for each category.
Return ONLY valid JSON, no markdown.`;

export interface MatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  summary: string;
}

export const Route = createFileRoute("/api/ai/match")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          const ai = getAIFromContext(context);

          if (!ai) {
            return json(
              { success: false, error: "AI not available" },
              { status: 503 }
            );
          }

          const body = await request.json() as {
            resume?: string;
            skills?: string[];
            jobTitle: string;
            jobDescription: string;
          };

          if (!body.jobDescription) {
            return json(
              { success: false, error: "Job description is required" },
              { status: 400 }
            );
          }

          if (!body.resume && (!body.skills || body.skills.length === 0)) {
            return json(
              { success: false, error: "Resume or skills are required" },
              { status: 400 }
            );
          }

          // Build candidate profile string
          let candidateProfile = "";
          if (body.resume) {
            candidateProfile = `Resume:\n${body.resume}`;
          }
          if (body.skills && body.skills.length > 0) {
            candidateProfile += `\n\nSkills: ${body.skills.join(", ")}`;
          }

          const userMessage = `
Candidate Profile:
${candidateProfile}

Job Title: ${body.jobTitle}

Job Description:
${body.jobDescription}
`;

          const response = await ai.run(
            "@cf/meta/llama-3.3-70b-instruct-fp8-fast" as any,
            {
              messages: [
                { role: "system", content: MATCH_PROMPT },
                { role: "user", content: userMessage },
              ],
              max_tokens: 500,
            }
          );

          // Parse the AI response - handle various response formats
          let responseText = "";
          console.log("AI response type:", typeof response);
          console.log("AI response keys:", response ? Object.keys(response as any) : "null");
          
          if (typeof response === "string") {
            responseText = response;
          } else if (response && typeof (response as any).response === "string") {
            responseText = (response as any).response;
          } else if (response) {
            // Try JSON stringifying and use as-is
            responseText = JSON.stringify(response);
          }
          
          console.log("Response text (first 300):", responseText.substring(0, 300));
          
          // Clean JSON from potential markdown
          let jsonStr = responseText.trim();
          if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
          }
          
          // Try to extract JSON from the response if it's not pure JSON
          const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
          
          console.log("Parsed JSON (first 300):", jsonStr.substring(0, 300));

          let result: MatchResult;
          try {
            const parsed = JSON.parse(jsonStr);
            // Handle double-nested response: {response: {matchScore...}}
            result = parsed.response && typeof parsed.response === "object" 
              ? parsed.response 
              : parsed;
          } catch (parseError) {
            console.error("Failed to parse match JSON:", jsonStr.substring(0, 200));
            // Return a fallback response
            result = {
              matchScore: 50,
              matchingSkills: [],
              missingSkills: [],
              summary: "Unable to analyze match - try again later."
            };
          }

          // Validate and clamp match score
          result.matchScore = Math.max(0, Math.min(100, Math.round(result.matchScore || 50)));
          result.matchingSkills = Array.isArray(result.matchingSkills) ? result.matchingSkills : [];
          result.missingSkills = Array.isArray(result.missingSkills) ? result.missingSkills : [];
          result.summary = result.summary || "Match analysis complete.";

          return json({ success: true, data: result });
        } catch (error) {
          console.error("Error in AI match:", error);
          return json(
            {
              success: false,
              error: error instanceof Error ? error.message : "Match analysis failed",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});

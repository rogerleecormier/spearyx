import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getAIFromContext } from "../../../lib/ai";
import { AI_MODELS, AIMessage } from "../../../lib/ai/types";
import { RESUME_TAILOR_PROMPT } from "../../../lib/ai/prompts";

interface GenerateResumeRequest {
    jobTitle: string;
    jobDescription: string;
    jobCompany: string;
    userResume?: string;
    userName?: string;
}

export const Route = createFileRoute("/api/ai/generate-resume")({
    server: {
        handlers: {
            POST: async ({ request, context }: { request: Request; context: any }) => {
                try {
                    const ai = await getAIFromContext(context);
                    if (!ai) {
                        return json(
                            { success: false, error: "AI not available" },
                            { status: 503 }
                        );
                    }

                    const body = await request.json() as GenerateResumeRequest;
                    const { jobTitle, jobDescription, jobCompany, userResume, userName } = body;

                    if (!jobDescription) {
                        return json(
                            { success: false, error: "Job description is required" },
                            { status: 400 }
                        );
                    }

                    const userContent = `
Job Title: ${jobTitle}
Company: ${jobCompany}

Job Description:
${jobDescription}

User Resume:
User Resume:
${userResume || "No specific resume provided. create a generic placeholder resume based on the job description."}

IMPORTANT:
- If a User Resume is provided above, you MUST use the candidate's actual experience, skills, and history from that resume. DO NOT HALLUCINATE or invent new experience. checking against the provided resume is mandatory.
- If the resume is missing specific details, you may infer reasonable soft skills but do not invent companies, job titles, or specific projects.
- If "No specific resume provided" is present, then you may generate a template/placeholder resume.

User Name: ${userName || "[Candidate Name]"}
`;

                    const messages: AIMessage[] = [
                        { role: "system", content: RESUME_TAILOR_PROMPT },
                        { role: "user", content: userContent }
                    ];

                    // Use Llama 3.3 70B for high quality generation
                    const response = await ai.run(AI_MODELS.LLAMA_3_3_70B, {
                        messages,
                        max_tokens: 4000,
                        temperature: 0.7
                    });

                    // Handle Cloudflare's specific response structure (similar to score-all.ts)
                    let responseContent: any = "";
                    const res = response as any;

                    if (res?.choices?.[0]?.message) {
                        const msg = res.choices[0].message;
                        responseContent = msg.content || "";
                    } else if (typeof response === "string") {
                        responseContent = response;
                    } else if (res?.response) {
                        responseContent = res.response;
                    } else if (res?.result?.response) {
                        responseContent = res.result.response;
                    } else if (response) {
                        responseContent = response;
                    }

                    let parsedData = {
                        resume: "",
                        coverLetter: "",
                        gapAnalysis: "",
                        careerAnalysis: ""
                    };

                    console.log("Raw AI Response Content Type:", typeof responseContent);
                    if (typeof responseContent === 'object') {
                        console.log("Response is Object:", JSON.stringify(responseContent).substring(0, 100) + "...");
                    } else {
                        console.log("Response is String:", String(responseContent).substring(0, 100) + "...");
                    }

                    // detailed parsing logic
                    try {
                        // Case A: responseContent is already the object we want
                        if (typeof responseContent === 'object' && responseContent !== null) {
                            // Check if it has the keys we expect
                            if (responseContent.resume || responseContent.coverLetter) {
                                parsedData = {
                                    resume: String(responseContent.resume || ""),
                                    coverLetter: String(responseContent.coverLetter || ""),
                                    gapAnalysis: String(responseContent.gapAnalysis || ""),
                                    careerAnalysis: String(responseContent.careerAnalysis || "")
                                };
                            } else {
                                // It's an object but not our shape? Stringify it to treat as text resume
                                parsedData.resume = JSON.stringify(responseContent, null, 2);
                            }
                        }
                        // Case B: responseContent is a string (Markdown/JSON string)
                        else {
                            const responseText = String(responseContent);
                            // 1. Try to find a JSON code block first
                            const codeBlockMatch = responseText.match(/```json([\s\S]*?)```/);
                            let jsonStr = "";

                            if (codeBlockMatch && codeBlockMatch[1]) {
                                jsonStr = codeBlockMatch[1].trim();
                            } else {
                                // 2. If no code block, try to find the start of the JSON object
                                const firstBrace = responseText.indexOf('{');
                                const lastBrace = responseText.lastIndexOf('}');
                                if (firstBrace !== -1 && lastBrace !== -1) {
                                    jsonStr = responseText.substring(firstBrace, lastBrace + 1);
                                }
                            }

                            if (jsonStr) {
                                try {
                                    const json = JSON.parse(jsonStr);
                                    parsedData = {
                                        resume: String(json.resume || ""),
                                        coverLetter: String(json.coverLetter || ""),
                                        gapAnalysis: String(json.gapAnalysis || ""),
                                        careerAnalysis: String(json.careerAnalysis || "")
                                    };
                                } catch (parseError) {
                                    console.warn("JSON.parse failed, attempting Regex extraction", parseError);
                                    // Fallback: Regex extraction for specific fields
                                    // This handles cases where the AI uses unescaped newlines inside strings
                                    const extractField = (fieldName: string) => {
                                        // Match "fieldName": "..." OR "fieldName": `...`
                                        // Matches non-greedy until the next quote, handling escaped quotes
                                        // Improved Regex to trigger less eagerly on escaped quotes
                                        const regex = new RegExp(`"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*?)"`, "s");
                                        const match = jsonStr.match(regex);
                                        return match ? match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : "";
                                    };

                                    const resume = extractField("resume");
                                    const coverLetter = extractField("coverLetter");
                                    const gapAnalysis = extractField("gapAnalysis");
                                    const careerAnalysis = extractField("careerAnalysis");

                                    if (resume || coverLetter) {
                                        parsedData = {
                                            resume: resume || responseText, // Fallback to raw if logic fails completely
                                            coverLetter: coverLetter || "",
                                            gapAnalysis: gapAnalysis || "",
                                            careerAnalysis: careerAnalysis || ""
                                        };
                                    } else {
                                        // Regex failed too?
                                        console.warn("Regex extraction failed");
                                        parsedData.resume = responseText;
                                    }
                                }
                            } else {
                                // No JSON found, treat whole text as resume
                                console.warn("No JSON structure found in text response");
                                parsedData.resume = responseText;
                            }
                        }
                    } catch (e) {
                        console.warn("Failed to parse AI response, failing back to raw dumping", e);
                        // Ultimate fallback
                        parsedData.resume = typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent, null, 2);
                    }

                    return json({
                        success: true,
                        data: parsedData
                    });

                } catch (error) {
                    console.error("Error generating resume:", error);
                    return json(
                        {
                            success: false,
                            error: error instanceof Error ? error.message : "Failed to generate resume"
                        },
                        { status: 500 }
                    );
                }
            },
        },
    },
});

interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGIN: string;
}

interface UserProfile {
  location: { zipCode?: string; city?: string; state: string };
  residencyStatus: string;
  currentSituation: string[];
  immigration?: {
    visaType: string;
    optCptStatus?: string;
    stemEligible?: boolean | null;
  };
  employment?: {
    industry?: string;
    type?: string;
    gigPlatform?: string;
    businessSize?: string;
  };
  housing?: { situation: string; landlordType?: string };
  education?: {
    degreeLevel: string;
    institutionType: string;
    financialAid: boolean;
    studentLoans: boolean;
  };
  transportation?: string[];
  healthcare?: string;
  filingStatus?: string;
  dependents?: string;
  profileCompleteness: number;
  createdAt: string;
  updatedAt: string;
}

interface LegalChange {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  datePublished: string;
  dateEffective?: string;
  jurisdiction: string;
  state?: string;
  sourceUrl: string;
  sourceDocument: string;
  rawText: string;
  genericSummary: string;
  affectedGroups: string[];
  keywords: string[];
}

interface AnalyzeRequest {
  profile: UserProfile;
  changes: LegalChange[];
}

interface ClaudeAlertResponse {
  relevance_score: number;
  severity: "high" | "medium" | "low";
  summary: string;
  personal_impact: string;
  matched_because: string[];
  action_items: { action: string; deadline?: string; contact_info?: string }[];
  confidence: "high" | "medium" | "low";
}

const SYSTEM_PROMPT = `You are a legal change analyst for Legisly. Given a user's life profile and a batch of recent legal/policy changes, analyze how each change affects the user personally.

For each legal change, determine:
1. relevance_score (0-100): how directly this affects THIS specific user
2. severity: "high" (direct, immediate impact), "medium" (indirect/future impact), "low" (tangential)
3. summary: 2-3 sentence plain-English summary
4. personal_impact: personalized "How This Affects You" explanation referencing their specific profile traits
5. matched_because: array of profile traits that caused this match
6. action_items: specific next steps with deadlines and contact info where applicable
7. confidence: "high", "medium", or "low"

Rules:
- Be specific to their situation. "As an F-1 student on OPT in Arizona..." not "This may affect some visa holders"
- Action items must be concrete: include office names, deadlines, websites
- If a change has no relevance to this user, give relevance_score 0 and skip personalization
- Include a disclaimer that this is informational, not legal advice
- Cite the source document in your summary

Respond with a JSON array of analysis objects, one per legal change, in the same order as the input.`;

function buildUserPrompt(profile: UserProfile, changes: LegalChange[]): string {
  const profileJson = JSON.stringify(profile, null, 2);
  const changesText = changes
    .map(
      (c, i) =>
        `[Change ${i + 1}] ${c.title}
ID: ${c.id}
Category: ${c.category}
Date: ${c.datePublished}
Jurisdiction: ${c.jurisdiction}
Source: ${c.sourceDocument}
Text: ${c.rawText}`
    )
    .join("\n---\n");

  return `USER PROFILE:
${profileJson}

LEGAL CHANGES TO ANALYZE:
${changesText}`;
}

function getCorsOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  if (origin === env.ALLOWED_ORIGIN) return origin;
  // Allow any localhost port during development
  if (origin.match(/^http:\/\/localhost:\d+$/)) return origin;
  return null;
}

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) {
    return {};
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = getCorsOrigin(request, env);
    const cors = corsHeaders(origin);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // Only accept POST /api/analyze
    const url = new URL(request.url);
    if (url.pathname !== "/api/analyze" || request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    try {
      const body = (await request.json()) as AnalyzeRequest;

      if (!body.profile || !body.changes || !Array.isArray(body.changes)) {
        return new Response(
          JSON.stringify({
            error: "Invalid request body. Expected { profile, changes }.",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...cors },
          }
        );
      }

      if (body.changes.length === 0) {
        return new Response(
          JSON.stringify({
            alerts: [],
            processedAt: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...cors },
          }
        );
      }

      const userPrompt = buildUserPrompt(body.profile, body.changes);

      // Call Claude API
      const claudeResponse = await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 8192,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          }),
        }
      );

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error("Claude API error:", claudeResponse.status, errorText);
        return new Response(
          JSON.stringify({
            error: "AI analysis service returned an error. Please try again.",
            details: claudeResponse.status,
          }),
          {
            status: 502,
            headers: { "Content-Type": "application/json", ...cors },
          }
        );
      }

      const claudeData = (await claudeResponse.json()) as {
        content: { type: string; text: string }[];
      };

      // Extract text content from Claude response
      const textBlock = claudeData.content.find(
        (block) => block.type === "text"
      );
      if (!textBlock) {
        return new Response(
          JSON.stringify({ error: "No text response from AI analysis." }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...cors },
          }
        );
      }

      // Parse the JSON array from Claude's response
      // Claude may wrap the JSON in markdown code fences or add text before/after
      let jsonText = textBlock.text.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.slice(7);
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith("```")) {
        jsonText = jsonText.slice(0, -3);
      }
      jsonText = jsonText.trim();

      // Extract just the JSON array — Claude often appends disclaimers or extra text
      const arrayStart = jsonText.indexOf("[");
      const arrayEnd = jsonText.lastIndexOf("]");
      if (arrayStart === -1 || arrayEnd === -1 || arrayEnd <= arrayStart) {
        console.error("No JSON array found in Claude response:", jsonText.slice(0, 200));
        return new Response(
          JSON.stringify({ error: "AI returned an unparseable response. Please try again." }),
          {
            status: 502,
            headers: { "Content-Type": "application/json", ...cors },
          }
        );
      }
      jsonText = jsonText.slice(arrayStart, arrayEnd + 1);

      const analysisResults = JSON.parse(jsonText) as ClaudeAlertResponse[];

      // Map Claude's response to PersonalizedAlert format, merging with original change data
      const alerts = analysisResults.map((result, index) => {
        const change = body.changes[index];
        return {
          legalChangeId: change?.id ?? `unknown-${index}`,
          relevanceScore: result.relevance_score,
          severity: result.severity,
          summary: result.summary,
          personalImpact: result.personal_impact,
          matchedBecause: result.matched_because,
          actionItems: result.action_items.map((item) => ({
            action: item.action,
            deadline: item.deadline,
            contactInfo: item.contact_info,
          })),
          confidence: result.confidence,
          title: change?.title ?? "Unknown Change",
          category: change?.category ?? "consumer",
          datePublished: change?.datePublished ?? "",
          sourceUrl: change?.sourceUrl ?? "",
          sourceDocument: change?.sourceDocument ?? "",
          dismissed: false,
          savedForLater: false,
        };
      });

      return new Response(
        JSON.stringify({
          alerts,
          processedAt: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...cors },
        }
      );
    } catch (error) {
      console.error("Worker error:", error);
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return new Response(
        JSON.stringify({
          error: "Failed to process analysis request.",
          details: message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...cors },
        }
      );
    }
  },
};

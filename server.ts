import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes("MY_GEMINI_API_KEY")) {
      console.warn("GEMINI_API_KEY is not configured or uses placeholder. Fallback mode is enabled.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key || "PLACEHOLDER",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Check if Gemini is live
function isGeminiLive(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !!(key && !key.includes("MY_GEMINI_API_KEY"));
}

// -------------------------------------------------------------
// Domain 1 API: Multi-Agent Workflows & State Logs
// -------------------------------------------------------------
app.post("/api/domain/agent-run", async (req, res) => {
  const { goal, structure } = req.body;
  
  if (!goal) {
    return res.status(400).json({ error: "Goal is required" });
  }

  const live = isGeminiLive();
  if (live) {
    try {
      const ai = getGeminiClient();
      const prompt = `You are a Generative AI Forward Deployed Engineer at Google Cloud simulating a multi-agent system execution trace.
Goal: "${goal}"
Structure Strategy: "${structure || "ReAct Pattern"}"

Please produce a structured trace of a 3-agent orchestration system solving this. 
Return your response in standard JSON with the schema:
{
  "summary": "High-level visual summary of the run",
  "status": "success" | "stuck" | "diverged",
  "totalTokens": number,
  "elapsedMs": number,
  "steps": [
    {
      "agentName": "e.g., Lead Architect / Researcher / Grounding Checker",
      "action": "Description of the tool or API called",
      "thought": "Deep reasoning step or self-reflection",
      "outcome": "Output generated",
      "tokens": number,
      "latencyMs": number
    }
  ],
  "recommendations": "Engineer suggestions for production optimization"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              status: { type: Type.STRING },
              totalTokens: { type: Type.INTEGER },
              elapsedMs: { type: Type.INTEGER },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    agentName: { type: Type.STRING },
                    action: { type: Type.STRING },
                    thought: { type: Type.STRING },
                    outcome: { type: Type.STRING },
                    tokens: { type: Type.INTEGER },
                    latencyMs: { type: Type.INTEGER }
                  },
                  required: ["agentName", "action", "thought", "outcome", "tokens", "latencyMs"]
                }
              },
              recommendations: { type: Type.STRING }
            },
            required: ["summary", "status", "totalTokens", "elapsedMs", "steps", "recommendations"]
          }
        }
      });

      const responseText = response.text || "{}";
      return res.json(JSON.parse(responseText.trim()));
    } catch (err: any) {
      console.error("Gemini Multi-Agent execution failed, falling back.", err);
    }
  }

  // Fallback Simulation Heuristic (if key missing or failure)
  const stepsFallback = [
    {
      agentName: "Orchestrator Agent",
      action: "Decomposed master user request: '" + goal + "' into vector lookup and translation sub-tasks.",
      thought: "Analyzing intent of " + goal + ". The user wants a custom enterprise deployment. We must coordinate data sanitization and vector search.",
      outcome: "Dispatched sub-tasks to DatastoreExtractor and TranslationVerify agents.",
      tokens: 380,
      latencyMs: 310
    },
    {
      agentName: "DatastoreExtractor (RAG Tool Agent)",
      action: "Queried Vertex AI Vector Search to extract context for '" + goal + "'.",
      thought: "Extracting raw structured logs. Need to check if security perimeter allows context retention in Frankfurt (europe-west3).",
      outcome: "Retrieved 3 matching chunks of enterprise DB metadata and system configurations.",
      tokens: 740,
      latencyMs: 580
    },
    {
      agentName: "Validation Agent",
      action: "Self-reflected on parsed payload and evaluated compliance.",
      thought: "Heuristic checker flags no PII. Grounding score is high. Ready to format final deployment configuration.",
      outcome: "Approved payload output. No safety violations or halo-effects identified.",
      tokens: 410,
      latencyMs: 240
    }
  ];

  return res.json({
    summary: `Simulation completed in dry-run mode. Successfully resolved task hierarchy for ${goal}.`,
    status: "success",
    totalTokens: 1530,
    elapsedMs: 1130,
    steps: stepsFallback,
    recommendations: "Enable Gemini API key to run real dynamic agent reflection logs on live customer requirements."
  });
});

// -------------------------------------------------------------
// Domain 2 API: Enterprise Integration & MCP Sever Bridge
// -------------------------------------------------------------
app.post("/api/domain/mcp-test", async (req, res) => {
  const { mcpProtocol, sampleQuery } = req.body;
  
  if (!mcpProtocol || !sampleQuery) {
    return res.status(400).json({ error: "mcpProtocol schema and query are required" });
  }

  const live = isGeminiLive();
  if (live) {
    try {
      const ai = getGeminiClient();
      const prompt = `You are a GenAI Forward Deployed Engineer implementing a Model Context Protocol (MCP) server.
Below is the MCP Server schema/spec:
${mcpProtocol}

The model of the agent sent this user request/query to the MCP Server:
"${sampleQuery}"

Evaluate if the MCP tool specification is fully compliant with the query.
Provide:
1. "isValid" - true/false
2. "toolCall" - The JSON payload of the tool call that the LLM would issue (e.g., { "name": "...", "arguments": { ... } }).
3. "legacySQL" - What SQL or legacy API request this MCP tool will map to on the customer's on-prem mainframe.
4. "validationError" - Empty string or description of schema friction.
5. "remediationCode" - Suggested TypeScript adapter snippet to map this MCP JSON argument cleanly to the legacy on-prem HTTP service.

Return response as clean JSON:
{
  "isValid": boolean,
  "toolCall": object,
  "legacySQL": string,
  "validationError": string,
  "remediationCode": string
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: { type: Type.BOOLEAN },
              toolCall: { type: Type.OBJECT },
              legacySQL: { type: Type.STRING },
              validationError: { type: Type.STRING },
              remediationCode: { type: Type.STRING }
            },
            required: ["isValid", "toolCall", "legacySQL", "validationError", "remediationCode"]
          }
        }
      });

      const responseText = response.text || "{}";
      return res.json(JSON.parse(responseText.trim()));
    } catch (err: any) {
      console.error("Gemini MCP Parser failed, falling back.", err);
    }
  }

  // Fallback Simulation Heuristic
  const isValid = sampleQuery.toLowerCase().includes("database") || sampleQuery.toLowerCase().includes("user") || sampleQuery.toLowerCase().includes("query");
  return res.json({
    isValid: true,
    toolCall: {
      name: "query_legacy_sap_db",
      arguments: {
        filter: sampleQuery,
        limit: 10,
        region: "DACH"
      }
    },
    legacySQL: "SELECT * FROM db_sap_v4.users_meta WHERE region = 'DACH' AND description LIKE '%" + sampleQuery.replace(/'/g, "") + "%' LIMIT 10;",
    validationError: "",
    remediationCode: `// Auto-generated MCP Adapter Endpoint for Node.js
export async function handleMcpRequest(call: { name: string, arguments: any }) {
  if (call.name === "query_legacy_sap_db") {
    const { filter, limit } = call.arguments;
    // Connective tissue mapping to SAP RFC or REST Gateway
    const response = await fetch("https://sap-gateway.dach-onprem.corp/sap/bc/srt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: filter, maxRows: limit })
    });
    return response.json();
  }
}`
  });
});

// -------------------------------------------------------------
// Domain 3 API: RAG Pipeline Analyzer
// -------------------------------------------------------------
app.post("/api/domain/rag-analyze", async (req, res) => {
  const { sampleDoc, chunkStrategy, chunkSize, chunkOverlap } = req.body;

  if (!sampleDoc) {
    return res.status(400).json({ error: "Sample document content is required" });
  }

  const live = isGeminiLive();
  if (live) {
    try {
      const ai = getGeminiClient();
      const prompt = `You are a Generative AI Forward Deployed Engineer.
A customer is configuring a RAG pipeline for their unstructured PDF files on Vertex AI.
Document sample:
"${sampleDoc}"

Current proposed parameters:
- Segmenting strategy: ${chunkStrategy || "RecursiveCharacter"}
- Target Token Size: ${chunkSize || 500}
- Overlap Target: ${chunkOverlap || 50}

Run a high-fidelity chunking simulation on this sample. Return:
1. "chunks": An array of at least 3 simulated chunks parsed under these parameters, showcasing how they split sentences and overlapping lines.
2. "metadata": Array of metadata objects for each chunk (bounding pages, key tags, language).
3. "recommendations": Practical engineering optimizations (e.g. semantic chunking, custom layout-aware parser, or Spanner indexing).

Return output as standard JSON:
{
  "chunks": [ { "id": number, "text": string, "overlapText": string } ],
  "metadata": [ { "id": number, "entities": string[], "suggestedIndex": string } ],
  "recommendations": string
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chunks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    text: { type: Type.STRING },
                    overlapText: { type: Type.STRING }
                  },
                  required: ["id", "text", "overlapText"]
                }
              },
              metadata: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    entities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedIndex: { type: Type.STRING }
                  },
                  required: ["id", "entities", "suggestedIndex"]
                }
              },
              recommendations: { type: Type.STRING }
            },
            required: ["chunks", "metadata", "recommendations"]
          }
        }
      });

      const responseText = response.text || "{}";
      return res.json(JSON.parse(responseText.trim()));
    } catch (err: any) {
      console.error("Gemini RAG analyzer failed, falling back.", err);
    }
  }

  // Fallback Simulation Heuristic (Deterministic Chunks)
  const sentences = sampleDoc.split(/(?<=[.!?])\s+/);
  const chunkText1 = sentences[0] || "Sample content for RAG pipeline simulation.";
  const chunkText2 = sentences[1] || "Extracting semantic attributes from source file.";
  const chunkText3 = sentences.slice(2).join(" ") || "Embedding vectors are indexed in Vertex AI database.";

  return res.json({
    chunks: [
      { id: 1, text: chunkText1, overlapText: "... [START OVERLAP]" },
      { id: 2, text: chunkText2, overlapText: chunkText1.substring(Math.max(0, chunkText1.length - 20)) },
      { id: 3, text: chunkText3, overlapText: chunkText2.substring(Math.max(0, chunkText2.length - 20)) }
    ],
    metadata: [
      { id: 1, entities: ["Enterprise", "Core"], suggestedIndex: "meta_sec_east" },
      { id: 2, entities: ["Ingestion", "Vector"], suggestedIndex: "meta_sec_west" },
      { id: 3, entities: ["Vertex", "RAG"], suggestedIndex: "vertex_embeddings_index" }
    ],
    recommendations: "Enable Gemini API to evaluate token boundary truncation dynamically with real Google Neural Embeddings criteria."
  });
});

// -------------------------------------------------------------
// Domain 4 API: In-Depth Evaluation Matrix
// -------------------------------------------------------------
app.post("/api/domain/eval-suite", async (req, res) => {
  const { query, context, responseText } = req.body;

  if (!query || !context || !responseText) {
    return res.status(400).json({ error: "query, context, and responseText are required to run evaluation" });
  }

  const live = isGeminiLive();
  if (live) {
    try {
      const ai = getGeminiClient();
      const prompt = `You are a Generative AI Forward Deployed Engineer performing LLM-native evaluation and automated QA.
We need to measure:
1. Groundedness (Is the response strictly based on the provided Context? (0.0 to 1.0))
2. Answer Relevance (Does the response answer the User Query? (0.0 to 1.0))
3. Cost & Latency Assessment
4. Trace Analysis of steps

Inputs:
User Query: "${query}"
Retrieved Context: "${context}"
Generated Output: "${responseText}"

Evaluate quantitatively and return response strictly as standard JSON:
{
  "groundednessScore": number,
  "relevanceScore": number,
  "faithfulnessScore": number,
  "groundingReasoning": "Why this score was awarded, referencing precise context mismatches or hallucinations",
  "suggestedRefinement": "Concrete engineer prompt fix or system instruction revision"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              groundednessScore: { type: Type.NUMBER },
              relevanceScore: { type: Type.NUMBER },
              faithfulnessScore: { type: Type.NUMBER },
              groundingReasoning: { type: Type.STRING },
              suggestedRefinement: { type: Type.STRING }
            },
            required: ["groundednessScore", "relevanceScore", "faithfulnessScore", "groundingReasoning", "suggestedRefinement"]
          }
        }
      });

      const text = response.text || "{}";
      return res.json(JSON.parse(text.trim()));
    } catch (err: any) {
      console.error("Gemini Evaluation suite failed, falling back.", err);
    }
  }

  // Fallback Simulation Heuristic (Groundedness & Relevance heuristic)
  let score = 0.85;
  let reason = "The response correctly aligns with key constraints in the retrieved context. No obvious hallucinations detected in fallback mode.";
  
  // Custom check for mock validation helper
  if (responseText.toLowerCase().includes("hallucinate")) {
    score = 0.45;
    reason = "Detected a mismatch! The response contains ungrounded statements not found in the context payload.";
  }

  return res.json({
    groundednessScore: score,
    relevanceScore: 0.92,
    faithfulnessScore: score,
    groundingReasoning: reason,
    suggestedRefinement: "Increase Google Search grounding or introduce a hard system-level guardrail instruction to strictly reject questions outside context bounds."
  });
});

// -------------------------------------------------------------
// Domain 5 API: Field Pipeline & Feedback Loop
// -------------------------------------------------------------
app.post("/api/domain/field-reflection", async (req, res) => {
  const { customerFriction, severity, engineerDiagnosis } = req.body;

  if (!customerFriction) {
    return res.status(400).json({ error: "Customer friction details are required." });
  }

  const live = isGeminiLive();
  if (live) {
    try {
      const ai = getGeminiClient();
      const prompt = `You are a Generative AI Forward Deployed Engineer feedback translator.
You are bridging the gap between DACH custom enterprise deployments (Stuttgart, Munich, Frankfurt banks/companies) and Google Cloud's product engineering teams in Mountain View, California.

Customer friction report:
"${customerFriction}"

Engineer diagnosis:
"${engineerDiagnosis || "Not analyzed yet"}"

Severity classification: ${severity || "medium"}

Please translate this into a structured Product Feature Request (PFR) for the Vertex AI core engineering team in California and generate a reusable TypeScript code helper module to workaround this issue immediately in the field.

Return exactly this JSON response architecture:
{
  "titledIssue": "Descriptive, technical, high-level ticket title",
  "pfrImpactSummary": "Detailed product impact description for product managers in Mountain View",
  "reusableFieldModuleCode": "Fully functional TypeScript file content that acts as an SDK wrapper/utility to patch this issue in client code directly",
  "productTeamActionItem": "Action items for Vertex AI core engineering team to fix natively in next preview build",
  "workaroundStrategy": "Guidance on how to integrate this TypeScript patch inside on-prem hosting env"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              titledIssue: { type: Type.STRING },
              pfrImpactSummary: { type: Type.STRING },
              reusableFieldModuleCode: { type: Type.STRING },
              productTeamActionItem: { type: Type.STRING },
              workaroundStrategy: { type: Type.STRING }
            },
            required: ["titledIssue", "pfrImpactSummary", "reusableFieldModuleCode", "productTeamActionItem", "workaroundStrategy"]
          }
        }
      });

      const responseText = response.text || "{}";
      return res.json(JSON.parse(responseText.trim()));
    } catch (err: any) {
      console.error("Gemini field reflection failed, falling back.", err);
    }
  }

  // Fallback Simulation Heuristic
  return res.json({
    titledIssue: "VERTEX-CORE-7731: Auto-reconnect & Token Optimization Wrapper for regional Europe clusters",
    pfrImpactSummary: "Large DACH enterprise client experiences transient 504 gateway timeouts when routing real-time sub-second agent tokens across secured enterprise proxy networks in Frankfurt (europe-west3). This blocks deployment in production.",
    reusableFieldModuleCode: `/**
 * Google Cloud Field Engineering Utility - Stuttgart cluster bypass
 * Standard resilient client wrapper for Vertex GenAI Core API
 */
import { GoogleGenAI } from "@google/genai";

export class ResilientVertexClient {
  private client: GoogleGenAI;
  private maxRetries = 3;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * Resilient content generation with exponential backoff & proxy timeout mitigation
   */
  async generateWithRetry(model: string, prompt: string, attempt = 1): Promise<any> {
    try {
      return await this.client.models.generateContent({
        model,
        contents: prompt,
      });
    } catch (err) {
      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(\`[Field Patch]: Call failed due to enterprise gateway congestion. Retrying in \${delay}ms...\`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.generateWithRetry(model, prompt, attempt + 1);
      }
      throw err;
    }
  }
}`,
    productTeamActionItem: "Integrate automatic retry vectors and native endpoint replication across Frankfurt, Stuttgart, and Munich regional proxy networks directly into the next @google/genai SDK node-runtime release.",
    workaroundStrategy: "Import the ResilientVertexClient from your shared node modules and wrap all real-time model calls in the microservice layer to shield the client from transient DACH-internal gateway drops."
  });
});

// Serve Vite frontend
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Live application running on port ${PORT}`);
  });
}

startServer();

export interface AgentStep {
  agentName: string;
  action: string;
  thought: string;
  outcome: string;
  tokens: number;
  latencyMs: number;
}

export interface AgentRunResponse {
  summary: string;
  status: "success" | "stuck" | "diverged";
  totalTokens: number;
  elapsedMs: number;
  steps: AgentStep[];
  recommendations: string;
}

export interface McpQueryResponse {
  isValid: boolean;
  toolCall: Record<string, any>;
  legacySQL: string;
  validationError: string;
  remediationCode: string;
}

export interface RagChunk {
  id: number;
  text: string;
  overlapText: string;
}

export interface RagMetadata {
  id: number;
  entities: string[];
  suggestedIndex: string;
}

export interface RagAnalyzeResponse {
  chunks: RagChunk[];
  metadata: RagMetadata[];
  recommendations: string;
}

export interface EvalSuiteResponse {
  groundednessScore: number;
  relevanceScore: number;
  faithfulnessScore: number;
  groundingReasoning: string;
  suggestedRefinement: string;
}

export interface FieldReflectionResponse {
  titledIssue: string;
  pfrImpactSummary: string;
  reusableFieldModuleCode: string;
  productTeamActionItem: string;
  workaroundStrategy: string;
}

// Predefined scenarios and templates for high-fidelity interactive engagement
export interface CodePreset {
  id: string;
  name: string;
  description: string;
  code: string;
  query: string;
}

export interface DocPreset {
  id: string;
  title: string;
  text: string;
  strategy: string;
  size: number;
  overlap: number;
}

export interface EvalPreset {
  id: string;
  label: string;
  query: string;
  context: string;
  responseText: string;
}

export interface FrictionPreset {
  id: string;
  title: string;
  friction: string;
  severity: "low" | "medium" | "critical";
  diagnosis: string;
}

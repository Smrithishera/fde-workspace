import { CodePreset, DocPreset, EvalPreset, FrictionPreset } from "./types";

export const AGENT_GOAL_PRESETS = [
  {
    label: "Sovereign Banking RAG Flow (Frankfurt)",
    goal: "Verify if incoming credit applicant metadata matches europe-west3 on-prem sovereign banking schemas and route secure lookup.",
    strategy: "Self-Reflection Loop"
  },
  {
    label: "SAP Inventory Pipeline Synchronization",
    goal: "Query legacy SAP ledger for materials shortages, reconcile with Vertex forecasts, and automatically dispatch restocking tickets.",
    strategy: "Hierarchical ReAct"
  },
  {
    label: "Logistics Routing Orchestration (Munich Hub)",
    goal: "Analyze current route delays across Southern Germany, calculate fuel offsets, and update the legacy PostgreSQL state machine.",
    strategy: "Sequential Flow"
  }
];

export const MCP_PRESETS: CodePreset[] = [
  {
    id: "sap-db",
    name: "SAP Mainframe User Ledger Schema",
    description: "Connects to secure SAP ABAP server via RFC and extracts verified system transactions.",
    code: `{
  "mcpVersion": "1.0.0",
  "name": "SAP-Legacy-Bridge-STG",
  "tools": [
    {
      "name": "lookup_sap_account_v2",
      "description": "Searches for SAP customer billing states by regional VAT ID",
      "inputSchema": {
        "type": "object",
        "properties": {
          "vat_id": { "type": "string", "pattern": "^DE[0-9]{9}$" },
          "days_span": { "type": "integer", "maximum": 90 }
        },
        "required": ["vat_id"]
      }
    }
  ]
}`,
    query: "Query customer transactions for the client with VAT ID DE123456789 over the past 30 days."
  },
  {
    id: "db-perimeter",
    name: "Spanner Sovereign Core Connector",
    description: "Audits state bounds on Google Cloud Spanner inside europe-west3 perimeters.",
    code: `{
  "mcpVersion": "1.0.0",
  "name": "Spanner-Sovereign-Audit",
  "tools": [
    {
      "name": "assert_integrity_bounds",
      "description": "Checks database table entries for restricted data keys",
      "inputSchema": {
        "type": "object",
        "properties": {
          "table": { "type": "string" },
          "compliance_profile": { "type": "string", "enum": ["BaFin-GDPR", "EBA-Sovereign"] }
        },
        "required": ["table", "compliance_profile"]
      }
    }
  ]
}`,
    query: "Run sovereignty assertion bounds check on the credit_history table to ensure GDPR compliance."
  }
];

export const RAG_DOC_PRESETS: DocPreset[] = [
  {
    id: "risk-guidelines",
    title: "BaFin Circular 10/2021 (Secured Risk Guidelines)",
    text: "§ 1.1 Capital requirements for financial conglomerates operating in DACH regions. Institutions must maintain a minimum Liquidity Coverage Ratio (LCR) of 110% under extreme simulated stress profiles. [SECTION B] All customer records relating to sovereign state loans must undergo daily cryptographic hashing verification before indexing. [SECTION C] Chunks containing private addresses must strictly be stored in europe-west3 with KMS hardware keystores.",
    strategy: "Semantic Breakpoints",
    size: 200,
    overlap: 30
  },
  {
    id: "cloud-policy",
    title: "Sovereign Cloud Data Control Framework v2.4",
    text: "DATA RESIDENCY DIRECTIVE: Structured ledger elements belonging to German manufacturing consortia are legally sandboxed. Transfers of telemetry profiles must bypass public backplanes. SECURE INGESTION: Documents ingested into Vertex AI Search should be grouped by compliance tag. Metadata indexes require field classification 'DE-Sovereign-Class-A'.",
    strategy: "Recursive Character",
    size: 350,
    overlap: 50
  }
];

export const EVAL_PRESETS: EvalPreset[] = [
  {
    id: "eval-optimal",
    label: "Case A: Perfectly Grounded Reference",
    query: "What is the mandatory minimum stress liquidity ratio for DACH banks?",
    context: "Under BaFin Circular 10/2021, financial conglomerates must maintain a stress Liquidity Coverage Ratio (LCR) of at least 110% to withstand extreme macro shock scenarios.",
    responseText: "According to BaFin Circular 10/2021, the mandatory stress Liquidity Coverage Ratio (LCR) is at least 110%."
  },
  {
    id: "eval-hallucination",
    label: "Case B: Severe Grounding Hallucination",
    query: "Which region must host the cryptographic key store for customer records?",
    context: "BaFin Guidelines recommend localized Key Management Service (KMS) stores. Our actual deployment mandates AWS Stockholm region for backups, while production stays regional.",
    responseText: "The guidelines explicitly mandate that cryptographic keys must be hosted on an on-prem storage array in Berlin, and synchronized directly with the Frankfurt Stock Exchange mainframe."
  },
  {
    id: "eval-partial",
    label: "Case C: Irrelevant Output Loop",
    query: "Explain Section C encryption protocols.",
    context: "Section C dictates 256-bit AES envelope encryption for all transaction databases. Standard HTTP transport requires TLS 1.3.",
    responseText: "Section C is a very important part of the document. Many banks look at Section C to manage operations and optimize financial reporting standards across Europe."
  }
];

export const FRICTION_PRESETS: FrictionPreset[] = [
  {
    id: "stuttgart-fw",
    title: "Stuttgart Proxy TLS 1.3 Handshake Bottleneck",
    friction: "The Stuttgart manufacturing proxy rejects chunked streaming responses from Vertex endpoint after exactly 4000ms. It treats long-lived server-sent events (SSE) flows as an active Denial of Service.",
    severity: "critical",
    diagnosis: "The customer's proxy drops TCP connections if keep-alive headers are not sent every 1000ms, corrupting chunk headers generated by Vertex AI."
  },
  {
    id: "frankfurt-tokens",
    title: "BaFin Sovereign Audit Key Refresh Clashes",
    friction: "When retrieving tokens using IAM service account credentials scoped strictly to a sovereign VPC perimeter in Frankfurt, the key rotates every 60 minutes. The GenAI Python SDK does not refresh automatically, causing continuous 401 errors at the hour mark.",
    severity: "medium",
    diagnosis: "The credentials cache inside Vertex client object fails to trigger an on-demand IAM client fetch, loading a stale OAuth Bearer token."
  }
];

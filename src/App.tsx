import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, 
  Cpu, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Send, 
  Copy, 
  RefreshCw, 
  BookOpen, 
  Flame, 
  Compass, 
  CheckCheck,
  Code,
  Layers,
  Activity,
  UserCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Grid
} from "lucide-react";

import { 
  AgentStep, 
  AgentRunResponse, 
  McpQueryResponse, 
  RagAnalyzeResponse, 
  EvalSuiteResponse, 
  FieldReflectionResponse 
} from "./types";

import { 
  AGENT_GOAL_PRESETS, 
  MCP_PRESETS, 
  RAG_DOC_PRESETS, 
  EVAL_PRESETS, 
  FRICTION_PRESETS 
} from "./presets";

export default function App() {
  // Navigation tabs: 1 to 5 representing the 5 domains
  const [activeTab, setActiveTab] = useState<number>(1);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // General System State Indicator
  const [geminiStatus, setGeminiStatus] = useState<{ live: boolean; checking: boolean }>({
    live: false,
    checking: true
  });

  // We check if backend is connected or if we are in simulated mode
  const checkStatus = async () => {
    try {
      const response = await fetch("/api/domain/agent-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: "verify_heartbeat" })
      });
      const data = await response.json();
      // If we get steps and they aren't marked as fallback recommendation, we know it works
      const holdsRealRecommendation = data.recommendations && !data.recommendations.includes("Enable Gemini API key");
      setGeminiStatus({ live: holdsRealRecommendation, checking: false });
    } catch (err) {
      setGeminiStatus({ live: false, checking: false });
    }
  };

  // Verify backend connection and API key state on boot
  useEffect(() => {
    checkStatus();
  }, []);

  // Utility to handle clipboard copy feedback
  const triggerCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // -----------------------------------------------------------------
  // Domain 1 States: Multi-Agent Workflows
  // -----------------------------------------------------------------
  const [agentGoal, setAgentGoal] = useState<string>(AGENT_GOAL_PRESETS[0].goal);
  const [agentStrategy, setAgentStrategy] = useState<string>(AGENT_GOAL_PRESETS[0].strategy);
  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  const [agentResult, setAgentResult] = useState<AgentRunResponse | null>(null);
  const [activeAgentNode, setActiveAgentNode] = useState<string | null>(null);

  const runAgentSimulation = async () => {
    setAgentLoading(true);
    try {
      const response = await fetch("/api/domain/agent-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: agentGoal, structure: agentStrategy })
      });
      const data: AgentRunResponse = await response.json();
      setAgentResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAgentLoading(false);
    }
  };

  // Auto run once
  useEffect(() => {
    if (!agentResult) {
      runAgentSimulation();
    }
  }, []);

  // -----------------------------------------------------------------
  // Domain 2 States: MCP Server & Connective Tissue
  // -----------------------------------------------------------------
  const [selectedMcpPreset, setSelectedMcpPreset] = useState<string>(MCP_PRESETS[0].id);
  const [mcpProtocolCode, setMcpProtocolCode] = useState<string>(MCP_PRESETS[0].code);
  const [mcpQuery, setMcpQuery] = useState<string>(MCP_PRESETS[0].query);
  const [mcpLoading, setMcpLoading] = useState<boolean>(false);
  const [mcpResult, setMcpResult] = useState<McpQueryResponse | null>(null);

  const loadMcpPreset = (presetId: string) => {
    setSelectedMcpPreset(presetId);
    const preset = MCP_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setMcpProtocolCode(preset.code);
      setMcpQuery(preset.query);
    }
  };

  const runMcpTest = async () => {
    setMcpLoading(true);
    try {
      const response = await fetch("/api/domain/mcp-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mcpProtocol: mcpProtocolCode, sampleQuery: mcpQuery })
      });
      const data: McpQueryResponse = await response.json();
      setMcpResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setMcpLoading(false);
    }
  };

  useEffect(() => {
    if (!mcpResult) {
      runMcpTest();
    }
  }, [selectedMcpPreset]);

  // -----------------------------------------------------------------
  // Domain 3 States: RAG Pipeline
  // -----------------------------------------------------------------
  const [selectedRagDocPreset, setSelectedRagDocPreset] = useState<string>(RAG_DOC_PRESETS[0].id);
  const [ragDocText, setRagDocText] = useState<string>(RAG_DOC_PRESETS[0].text);
  const [ragStrategy, setRagStrategy] = useState<string>(RAG_DOC_PRESETS[0].strategy);
  const [ragChunkSize, setRagChunkSize] = useState<number>(RAG_DOC_PRESETS[0].size);
  const [ragOverlap, setRagOverlap] = useState<number>(RAG_DOC_PRESETS[0].overlap);
  const [ragLoading, setRagLoading] = useState<boolean>(false);
  const [ragResult, setRagResult] = useState<RagAnalyzeResponse | null>(null);
  const [hoveredChunkId, setHoveredChunkId] = useState<number | null>(null);

  const loadRagPreset = (presetId: string) => {
    setSelectedRagDocPreset(presetId);
    const preset = RAG_DOC_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setRagDocText(preset.text);
      setRagStrategy(preset.strategy);
      setRagChunkSize(preset.size);
      setRagOverlap(preset.overlap);
    }
  };

  const runRagAnalysis = async () => {
    setRagLoading(true);
    try {
      const response = await fetch("/api/domain/rag-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleDoc: ragDocText,
          chunkStrategy: ragStrategy,
          chunkSize: ragChunkSize,
          chunkOverlap: ragOverlap
        })
      });
      const data: RagAnalyzeResponse = await response.json();
      setRagResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRagLoading(false);
    }
  };

  useEffect(() => {
    if (!ragResult) {
      runRagAnalysis();
    }
  }, [selectedRagDocPreset]);

  // -----------------------------------------------------------------
  // Domain 4 States: Evaluation Suite & Observability
  // -----------------------------------------------------------------
  const [selectedEvalPreset, setSelectedEvalPreset] = useState<string>(EVAL_PRESETS[0].id);
  const [evalQuery, setEvalQuery] = useState<string>(EVAL_PRESETS[0].query);
  const [evalContext, setEvalContext] = useState<string>(EVAL_PRESETS[0].context);
  const [evalResponseText, setEvalResponseText] = useState<string>(EVAL_PRESETS[0].responseText);
  const [evalLoading, setEvalLoading] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<EvalSuiteResponse | null>(null);

  const loadEvalPreset = (presetId: string) => {
    setSelectedEvalPreset(presetId);
    const preset = EVAL_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setEvalQuery(preset.query);
      setEvalContext(preset.context);
      setEvalResponseText(preset.responseText);
    }
  };

  const runEvalSuite = async () => {
    setEvalLoading(true);
    try {
      const response = await fetch("/api/domain/eval-suite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: evalQuery,
          context: evalContext,
          responseText: evalResponseText
        })
      });
      const data: EvalSuiteResponse = await response.json();
      setEvalResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvalLoading(false);
    }
  };

  useEffect(() => {
    if (!evalResult) {
      runEvalSuite();
    }
  }, [selectedEvalPreset]);

  // -----------------------------------------------------------------
  // Domain 5 States: Regional Friction & Product Feedback Loop
  // -----------------------------------------------------------------
  const [selectedFrictionPreset, setSelectedFrictionPreset] = useState<string>(FRICTION_PRESETS[0].id);
  const [frictionText, setFrictionText] = useState<string>(FRICTION_PRESETS[0].friction);
  const [frictionDiagnosis, setFrictionDiagnosis] = useState<string>(FRICTION_PRESETS[0].diagnosis);
  const [frictionSeverity, setFrictionSeverity] = useState<"low" | "medium" | "critical">(FRICTION_PRESETS[0].severity as any);
  const [frictionLoading, setFrictionLoading] = useState<boolean>(false);
  const [frictionResult, setFrictionResult] = useState<FieldReflectionResponse | null>(null);

  // Client-side visual mentorship list representing co-building responsibilities
  const [coBuildMentees, setCoBuildMentees] = useState([
    { id: 1, name: "Dominik K., Stuttgart Cloud Engineer", topic: "Vertex VPC Sovereign Peering", status: "completed" },
    { id: 2, name: "Sarah L., Frankfurt Banking Solution Architect", topic: "KMS Envelope Decryption Loops", status: "active" },
    { id: 3, name: "Hans M., Munich Logistics Dev Lead", topic: "CrewAI memory caching triggers", status: "scheduled" }
  ]);

  const loadFrictionPreset = (presetId: string) => {
    setSelectedFrictionPreset(presetId);
    const preset = FRICTION_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setFrictionText(preset.friction);
      setFrictionDiagnosis(preset.diagnosis);
      setFrictionSeverity(preset.severity as any);
    }
  };

  const runFrictionSynthesis = async () => {
    setFrictionLoading(true);
    try {
      const response = await fetch("/api/domain/field-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerFriction: frictionText,
          severity: frictionSeverity,
          engineerDiagnosis: frictionDiagnosis
        })
      });
      const data: FieldReflectionResponse = await response.json();
      setFrictionResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFrictionLoading(false);
    }
  };

  useEffect(() => {
    if (!frictionResult) {
      runFrictionSynthesis();
    }
  }, [selectedFrictionPreset]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* ──────────────────────────────────────────────────────── */}
      {/* PROFESSIONAL METADATA & CONTROL BAR */}
      {/* ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/10 shrink-0">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  DACH Regional Hub
                </span>
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  LND Office UK
                </span>
              </div>
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 mt-1">
                Generative AI Forward Deployed Engineer Workspace
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Real-time Status Indicators */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600">AWS Stuttgart Tunnel: Active</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-600">Active Engineer: sherafdo286@gmail.com</span>
            </div>

            {/* API Mode */}
            <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-md text-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700 font-medium">
                {geminiStatus.live ? "Live Gemini Mode" : "Resilient Simulated Mode"}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* ──────────────────────────────────────────────────────── */}
      {/* BRIEF EXPLANATORY PANEL */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold font-display tracking-tight flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" /> Embedded Engineering &amp; Field Workflows
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Functions as a builder-consultant, moving beyond high-level architectures to code, debug, and jointly ship bespoke agentic solutions directly within the customer's secure environments. This operations panel simulates 5 separate domains of responsibility described in the Google Cloud GenAI FDE framework.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg text-xs font-mono text-slate-200 border border-white/10 self-stretch md:self-auto flex flex-col justify-center gap-1.5">
            <div><strong className="text-white">Minimum Target:</strong> BaFin risk compliance standard</div>
            <div><strong className="text-white">Primary Cluster:</strong> Vertex AI (europe-west3)</div>
            <div><strong className="text-white">Transit Nodes:</strong> Frankfurt SQL-Mainframe Gateway</div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* MONOREPO HUB LAYOUT */}
      {/* ──────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDE BAR SELECTOR (4 columns on desk) */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col gap-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 font-mono">
              Role Domains
            </h3>
            
            <button
              onClick={() => setActiveTab(1)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm transition-all duration-150 ${
                activeTab === 1 
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10" 
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <div className="truncate">1. Agent Orchestrator</div>
                <div className={`text-[10px] truncate ${activeTab === 1 ? "text-blue-100" : "text-slate-400"}`}>
                  Multi-agent states &amp; graph
                </div>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto shrink-0 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab(2)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm transition-all duration-150 ${
                activeTab === 2 
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10" 
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Code className="w-4 h-4 shrink-0" />
              <div>
                <div className="truncate">2. Connective Tissue</div>
                <div className={`text-[10px] truncate ${activeTab === 2 ? "text-blue-100" : "text-slate-400"}`}>
                  MCP Protocol server builder
                </div>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto shrink-0 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab(3)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm transition-all duration-150 ${
                activeTab === 3 
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10" 
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <div>
                <div className="truncate">3. RAG pipelines</div>
                <div className={`text-[10px] truncate ${activeTab === 3 ? "text-blue-100" : "text-slate-400"}`}>
                  Sovereign chunking &amp; clusters
                </div>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto shrink-0 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab(4)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm transition-all duration-150 ${
                activeTab === 4 
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10" 
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <div>
                <div className="truncate">4. Observability &amp; Eval</div>
                <div className={`text-[10px] truncate ${activeTab === 4 ? "text-blue-100" : "text-slate-400"}`}>
                  Groundedness &amp; LLM counters
                </div>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto shrink-0 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab(5)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm transition-all duration-150 ${
                activeTab === 5 
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10" 
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
              <div>
                <div className="truncate">5. Stuttgart Field Loop</div>
                <div className={`text-[10px] truncate ${activeTab === 5 ? "text-blue-100" : "text-slate-400"}`}>
                  Mountain View feedback &amp; patches
                </div>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto shrink-0 opacity-60" />
            </button>

          </div>

          {/* Quick System Diagnostics Context Box */}
          <div className="bg-slate-800 text-slate-100 rounded-xl p-5 border border-slate-700 shadow-lg font-mono text-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-300 font-bold border-b border-slate-700 pb-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>LIVE CLOUD AUDITOR</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Vertex Host:</span>
                <span className="text-slate-200">europe-west3-a</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IAM Peer:</span>
                <span className="text-slate-200">GCP-Sovereignty-Proxy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DB Gateway:</span>
                <span className="text-slate-200">Mainframe-IP-Secure</span>
              </div>
              <button 
                onClick={() => checkStatus()}
                className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-slate-200 py-1 rounded text-[10px] font-mono flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className="w-3 h-3" /> Re-poll Core Heartbeat
              </button>
            </div>
          </div>
        </section>

        {/* MAIN VISUAL WORKSPACE (9 columns on desk) */}
        <section className="lg:col-span-9 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            
            {/* 🤖 TAB 1: MULTI-AGENT ORCHESTRATOR */}
            {activeTab === 1 && (
              <motion.div
                key="tab-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Configuration controls */}
                <div className="md:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600" /> Goal Optimization
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Specify what workflow your customized Multi-Agent collective must execute.</p>
                  </div>

                  {/* Goal Preset Selectors */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Presets</label>
                    <div className="space-y-1.5">
                      {AGENT_GOAL_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAgentGoal(preset.goal);
                            setAgentStrategy(preset.strategy);
                          }}
                          className={`w-full text-left p-2.5 rounded border text-xs transition duration-150 ${
                            agentGoal === preset.goal 
                              ? "bg-blue-50 border-blue-200 text-blue-900 font-medium" 
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goal Text input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-slate-400">Target Enterprise Goal</label>
                    <textarea
                      value={agentGoal}
                      onChange={(e) => setAgentGoal(e.target.value)}
                      rows={4}
                      className="w-full text-xs p-2.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-mono text-slate-800"
                      placeholder="Type custom client request or infrastructure parameter..."
                    />
                  </div>

                  {/* Architecture Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-slate-400">Execution Pattern</label>
                    <select
                      value={agentStrategy}
                      onChange={(e) => setAgentStrategy(e.target.value)}
                      className="w-full text-xs p-2.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                    >
                      <option value="Hierarchical ReAct">Hierarchical ReAct (Leader Delegation)</option>
                      <option value="Self-Reflection Loop">Self-Reflection Loop (Strict Accuracy)</option>
                      <option value="Sequential Task Chain">Sequential Task Chain (Pipeline Flow)</option>
                    </select>
                  </div>

                  <button
                    onClick={runAgentSimulation}
                    disabled={agentLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 disabled:opacity-50 transition"
                  >
                    {agentLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Compiling Graph...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Deploy &amp; Run Simulation
                      </>
                    )}
                  </button>
                </div>

                {/* Simulated outputs & dynamic DAG representation */}
                <div className="md:col-span-8 flex flex-col gap-6">
                  
                  {/* Dynamic Interactive SVG DAG Graph */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
                          Graph Execution Visual Topology
                        </h4>
                        <p className="text-[11px] text-slate-400">Shows current active runtime node transitions.</p>
                      </div>
                      <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                        Active Style: {agentStrategy}
                      </span>
                    </div>

                    <div className="w-full h-40 bg-slate-50 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-100">
                      {/* Interactive Visual Graph Nodes using SVG */}
                      <svg className="w-full h-full absolute inset-0 text-slate-300">
                        {/* Connecting paths */}
                        <line x1="15%" y1="50%" x2="45%" y2="25%" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className={activeAgentNode === "orchestrator" || activeAgentNode === "extractor" ? "text-blue-500 stroke-[3]" : "text-slate-300"} />
                        <line x1="15%" y1="50%" x2="45%" y2="75%" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className={activeAgentNode === "orchestrator" || activeAgentNode === "integrity" ? "text-blue-500 stroke-[3]" : "text-slate-300"} />
                        <line x1="45%" y1="25%" x2="80%" y2="50%" stroke="currentColor" strokeWidth="2" className={activeAgentNode === "extractor" || activeAgentNode === "validation" ? "text-blue-500 stroke-[3]" : "text-slate-300"} />
                        <line x1="45%" y1="75%" x2="80%" y2="50%" stroke="currentColor" strokeWidth="2" className={activeAgentNode === "integrity" || activeAgentNode === "validation" ? "text-blue-500 stroke-[3]" : "text-slate-300"} />
                      </svg>

                      <div className="absolute left-[5%] top-[35%] flex flex-col items-center">
                        <button
                          onClick={() => setActiveAgentNode("orchestrator")}
                          className={`w-20 py-2.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                            activeAgentNode === "orchestrator" 
                              ? "bg-blue-600 border-blue-500 text-white shadow" 
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                          }`}
                        >
                          <Compass className="w-4 h-4 mb-1" />
                          <span className="text-[9px] font-mono font-bold">Orchestrator</span>
                        </button>
                      </div>

                      <div className="absolute left-[38%] top-[10%] flex flex-col items-center">
                        <button
                          onClick={() => setActiveAgentNode("extractor")}
                          className={`w-24 py-2 bg-white rounded-lg border flex flex-col items-center justify-center transition-all ${
                            activeAgentNode === "extractor" 
                              ? "bg-blue-600 border-blue-500 text-white shadow" 
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                          }`}
                        >
                          <Database className="w-4 h-4 mb-1" />
                          <span className="text-[9px] font-mono font-bold">DataExtractor</span>
                        </button>
                      </div>

                      <div className="absolute left-[38%] bottom-[10%] flex flex-col items-center">
                        <button
                          onClick={() => setActiveAgentNode("integrity")}
                          className={`w-24 py-2 bg-white rounded-lg border flex flex-col items-center justify-center transition-all ${
                            activeAgentNode === "integrity" 
                              ? "bg-blue-600 border-blue-500 text-white shadow" 
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                          }`}
                        >
                          <CheckCircle className="w-4 h-4 mb-1" />
                          <span className="text-[9px] font-mono font-bold">IntegrityAuditor</span>
                        </button>
                      </div>

                      <div className="absolute right-[10%] top-[35%] flex flex-col items-center">
                        <button
                          onClick={() => setActiveAgentNode("validation")}
                          className={`w-20 py-2.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                            activeAgentNode === "validation" 
                              ? "bg-blue-600 border-blue-500 text-white shadow" 
                              : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                          }`}
                        >
                          <CheckCheck className="w-4 h-4 mb-1" />
                          <span className="text-[9px] font-mono font-bold">Validator</span>
                        </button>
                      </div>

                      <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 font-mono">
                        *Tip: Click any node to highlight connectivity in the layout.
                      </div>
                    </div>
                  </div>

                  {/* Simulation Execution Outputs */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-slate-500" /> Crew Logs &amp; Execution Trace
                      </h4>

                      {agentResult && (
                        <div className="flex gap-4 text-[10px] font-mono">
                          <div>
                            <span className="text-slate-400">Total Tokens:</span>{" "}
                            <span className="text-blue-600 font-bold">{agentResult.totalTokens}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Duration:</span>{" "}
                            <span className="text-blue-600 font-bold">{agentResult.elapsedMs}ms</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Status:</span>{" "}
                            <span className="text-emerald-600 font-bold uppercase">{agentResult.status}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {agentLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-sm font-mono text-slate-500">Decomposing intent... generating sequential traces on Vertex.</span>
                      </div>
                    ) : agentResult ? (
                      <div className="space-y-4">
                        {/* Goal Summary */}
                        <div className="bg-slate-50 p-3 rounded border border-slate-150 text-xs font-mono text-slate-700">
                          <strong className="text-slate-900 block mb-1">Execution Summary:</strong>
                          {agentResult.summary}
                        </div>

                        {/* Step Trace Chronology */}
                        <div className="space-y-3">
                          {agentResult.steps.map((step, idx) => (
                            <div key={idx} className="border-l-2 border-blue-500 pl-4 py-1 relative">
                              <span className="absolute -left-1.5 top-2.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                  {step.agentName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {step.latencyMs}ms | {step.tokens} tokens
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 italic mt-1 font-mono">
                                Thought: &ldquo;{step.thought}&rdquo;
                              </p>
                              <div className="text-xs text-slate-800 mt-1 bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                                <strong className="text-slate-700">Action:</strong> {step.action}
                                <br />
                                <strong className="text-slate-700">Outcome:</strong> {step.outcome}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* FDE Recommendations */}
                        <div className="border border-indigo-100 bg-indigo-50/50 rounded-lg p-3.5 mt-4 text-xs">
                          <h5 className="font-bold text-indigo-900 font-mono text-xs flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-4 h-4 text-indigo-600" /> Field Engineer Optimization Note
                          </h5>
                          <p className="text-indigo-800 font-mono text-[11px] leading-relaxed">
                            {agentResult.recommendations}
                          </p>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No active trace has been loaded yet. Press button to execute.
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* 🧩 TAB 2: CONNECTIVE TISSUE & MCP SERVER BUILDER */}
            {activeTab === 2 && (
              <motion.div
                key="tab-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Configuration side */}
                <div className="md:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2">
                      <Code className="w-4 h-4 text-blue-600" /> Model Context Protocol (MCP) Design
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Verify structural capabilities and write adapters that securely translate JSON tool calls to legacy mainframe SQL.
                    </p>
                  </div>

                  {/* Preset Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">MCP Schema Presets</label>
                    <div className="flex flex-col gap-2">
                      {MCP_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => loadMcpPreset(preset.id)}
                          className={`w-full text-left p-2.5 rounded border text-xs transition duration-150 ${
                            selectedMcpPreset === preset.id 
                              ? "bg-blue-50 border-blue-200 text-blue-900 font-medium" 
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <div className="font-bold">{preset.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Schema Code Editor */}
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-[11px] font-mono text-slate-400">MCP JSON Declaration Schema</label>
                    <textarea
                      value={mcpProtocolCode}
                      onChange={(e) => setMcpProtocolCode(e.target.value)}
                      rows={8}
                      className="w-full text-xs p-3 rounded border border-slate-200 font-mono bg-slate-900 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Sample Query Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-slate-400">Sample Client Query</label>
                    <input
                      type="text"
                      value={mcpQuery}
                      onChange={(e) => setMcpQuery(e.target.value)}
                      className="w-full text-xs p-2.5 rounded border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={runMcpTest}
                    disabled={mcpLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 disabled:opacity-50 transition"
                  >
                    {mcpLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Database className="w-4 h-4" /> Synthesize Bridge &amp; Workaround
                      </>
                    )}
                  </button>
                </div>

                {/* Simulated outputs */}
                <div className="md:col-span-7 flex flex-col gap-6">
                  
                  {/* MCP Verification Indicator */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono border-b border-slate-100 pb-3">
                      MCP Integrator Output
                    </h4>

                    {mcpLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-sm font-mono text-slate-500">Executing verification tests...</span>
                      </div>
                    ) : mcpResult ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {mcpResult.isValid ? (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-lg flex items-center gap-2 text-xs font-mono w-full">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Tool Schema validation checked. Status: COMPLIANT WITH QUERY</span>
                            </div>
                          ) : (
                            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2 rounded-lg flex items-center gap-2 text-xs font-mono w-full">
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Invalid Schema parameters flagged. Errors found: {mcpResult.validationError}</span>
                            </div>
                          )}
                        </div>

                        {/* Predicted LLM Tool Call Arguments */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            1. Client-Side Tool Call Output Structure
                          </label>
                          <div className="bg-slate-900 rounded p-3 text-xs font-mono text-slate-100 overflow-x-auto relative">
                            <button
                              onClick={() => triggerCopy(JSON.stringify(mcpResult.toolCall, null, 2), "toolcall")}
                              className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded transition"
                              title="Copy JSON Tool Call"
                            >
                              {copySuccess === "toolcall" ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <pre>{JSON.stringify(mcpResult.toolCall, null, 2)}</pre>
                          </div>
                        </div>

                        {/* Legacy SQL Conversion Trace */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            2. Transpiled Legacy Mainframe query call
                          </label>
                          <div className="bg-slate-100 p-3 rounded border border-slate-200 text-xs font-mono text-slate-800">
                            <strong>Target Mainframe String:</strong>
                            <div className="mt-1 font-mono text-[11px] bg-slate-200 p-2 rounded border border-slate-300 text-indigo-900 select-all">
                              {mcpResult.legacySQL}
                            </div>
                          </div>
                        </div>

                        {/* Remediation code template */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-mono text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              On-Prem REST Integration Workaround Code
                            </label>
                            <button
                              onClick={() => triggerCopy(mcpResult.remediationCode, "remediation")}
                              className="text-indigo-600 hover:underline text-xs flex items-center gap-1 font-mono"
                            >
                              {copySuccess === "remediation" ? "Copied!" : "Copy Workaround Node.js Agent Code"}
                            </button>
                          </div>
                          <div className="bg-slate-900 rounded p-3 text-xs font-mono text-slate-100 overflow-x-auto">
                            <pre className="text-[11px] text-slate-200">{mcpResult.remediationCode}</pre>
                          </div>
                        </div>

                      </div>
                    ) : null}
                  </div>
                  
                </div>
              </motion.div>
            )}

            {/* 📂 TAB 3: RAG & VECTOR PIPELINE PLAYGROUND */}
            {activeTab === 3 && (
              <motion.div
                key="tab-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Configurations */}
                <div className="md:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" /> Data Ingestion Pipeline
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Configure chunking settings to maximize relevance scores under BaFin limits.</p>
                  </div>

                  {/* Preset Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Compliance Documents</label>
                    <div className="space-y-1.5">
                      {RAG_DOC_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => loadRagPreset(p.id)}
                          className={`w-full text-left p-2.5 rounded border text-xs transition duration-150 ${
                            selectedRagDocPreset === p.id 
                              ? "bg-blue-50 border-blue-200 text-blue-900 font-medium" 
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Document textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-slate-400">Raw Unstructured Text Block</label>
                    <textarea
                      value={ragDocText}
                      onChange={(e) => setRagDocText(e.target.value)}
                      rows={5}
                      className="w-full text-xs p-2.5 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 font-mono text-slate-800"
                    />
                  </div>

                  {/* Strategy Choice */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-slate-400">Splitter Strategy</label>
                    <select
                      value={ragStrategy}
                      onChange={(e) => setRagStrategy(e.target.value)}
                      className="w-full text-xs p-2.5 rounded border border-slate-200 bg-slate-50"
                    >
                      <option value="Semantic Breakpoints">Semantic Breakpoints (Neuronal Split)</option>
                      <option value="Recursive Character">Recursive Document Hierarchy</option>
                      <option value="Fixed Boundary Segmenting">Fixed Boundary Tokens</option>
                    </select>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>Chunk Size Tracker</span>
                        <span className="text-slate-800 font-bold">{ragChunkSize} chars</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={1000}
                        step={50}
                        value={ragChunkSize}
                        onChange={(e) => setRagChunkSize(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>Boundary overlap</span>
                        <span className="text-slate-800 font-bold">{ragOverlap} chars</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={200}
                        step={10}
                        value={ragOverlap}
                        onChange={(e) => setRagOverlap(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    onClick={runRagAnalysis}
                    disabled={ragLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 disabled:opacity-50 transition"
                  >
                    {ragLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Layers className="w-4 h-4" /> Simulate Segment Ingestion
                      </>
                    )}
                  </button>
                </div>

                {/* Simulated outputs */}
                <div className="md:col-span-8 flex flex-col gap-6">
                  
                  {/* Scatterplot / Cluster SVG Display */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="border-b border-slate-100 pb-3 mb-4">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
                        Vertex AI Embeddings Cluster Map (2D Grid Projection)
                      </h4>
                      <p className="text-[11px] text-slate-400">Hover over any coordinate point to map database chunks directly.</p>
                    </div>

                    <div className="w-full h-32 bg-slate-900 rounded-lg flex items-center justify-center relative border border-slate-800">
                      
                      {/* Simulating 4 coordinate groups */}
                      <svg className="w-full h-full absolute inset-0">
                        <circle cx="20%" cy="30%" r="12" className={`cursor-pointer transition-all ${hoveredChunkId === 1 ? "fill-orange-400 r-16" : "fill-blue-500/50 hover:fill-blue-400"}`} onClick={() => setHoveredChunkId(1)} />
                        <circle cx="50%" cy="60%" r="10" className={`cursor-pointer transition-all ${hoveredChunkId === 2 ? "fill-orange-400 r-16" : "fill-indigo-500/50 hover:fill-indigo-400"}`} onClick={() => setHoveredChunkId(2)} />
                        <circle cx="80%" cy="40%" r="14" className={`cursor-pointer transition-all ${hoveredChunkId === 3 ? "fill-orange-400 r-16" : "fill-emerald-500/50 hover:fill-emerald-400"}`} onClick={() => setHoveredChunkId(3)} />
                      </svg>
                      
                      <div className="absolute top-2 right-2 text-[9px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        Index: VectorSearch-DE-01
                      </div>

                      <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 font-mono">
                        {hoveredChunkId ? `Selected Embedding Cluster Node: Chunk #${hoveredChunkId}` : "*Hover/Click dots to trace data splits*"}
                      </div>
                    </div>
                  </div>

                  {/* Chunks display */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono border-b border-slate-100 pb-2">
                      Pipeline Segment Breakdown
                    </h4>

                    {ragLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-sm font-mono text-slate-500">Calculating token sizes and overlaps on GCP vectors...</span>
                      </div>
                    ) : ragResult ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {ragResult.chunks.map((chk, idx) => {
                            const meta = ragResult.metadata.find(m => m.id === chk.id);
                            return (
                              <div
                                key={chk.id}
                                onMouseEnter={() => setHoveredChunkId(chk.id)}
                                onMouseLeave={() => setHoveredChunkId(null)}
                                className={`p-3.5 rounded-lg border transition-all duration-150 ${
                                  hoveredChunkId === chk.id 
                                    ? "bg-amber-50/75 border-amber-300 shadow scale-[1.01]" 
                                    : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 mb-2">
                                  <span className="text-xs font-mono font-bold text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded">
                                    Segment #{chk.id}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    Size: {chk.text.length} chars
                                  </span>
                                </div>
                                
                                <p className="text-xs text-slate-700 font-mono leading-relaxed truncate-2-lines mb-2">
                                  {chk.text}
                                </p>

                                <div className="text-[10px] font-mono bg-amber-100/60 text-amber-800 p-1 rounded border border-amber-200/20 mb-2 truncate">
                                  <strong className="text-amber-900 text-[9px] uppercase font-mono block">Overlap Token preservation check:</strong>
                                  {chk.overlapText}
                                </div>

                                {meta && (
                                  <div className="mt-2 space-y-1">
                                    <div className="flex flex-wrap gap-1">
                                      {meta.entities.map((ent, i) => (
                                        <span key={i} className="text-[9px] font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                          {ent}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="text-[9px] font-mono text-slate-400">
                                      KMS Group: <span className="text-slate-600 font-bold">{meta.suggestedIndex}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* FDE Recommendations */}
                        <div className="border border-indigo-100 bg-indigo-50/50 rounded-lg p-3.5 mt-2 text-xs">
                          <h5 className="font-bold text-indigo-900 font-display text-xs flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-4 h-4 text-indigo-600" /> Pipeline Ingestion Audit Note
                          </h5>
                          <p className="text-indigo-800 font-mono text-[11px] leading-relaxed">
                            {ragResult.recommendations}
                          </p>
                        </div>

                      </div>
                    ) : null}
                  </div>

                </div>
              </motion.div>
            )}

            {/* 📊 TAB 4: EVALUATION & OBSERVABILITY */}
            {activeTab === 4 && (
              <motion.div
                key="tab-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Configurations */}
                <div className="md:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" /> Groundedness Evaluator
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Simulate LLM-native evaluation of production response pipelines under GDPR safety rules.</p>
                  </div>

                  {/* Preset Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Evaluation Scenarios</label>
                    <div className="space-y-1.5">
                      {EVAL_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => loadEvalPreset(p.id)}
                          className={`w-full text-left p-2.5 rounded border text-xs transition duration-150 ${
                            selectedEvalPreset === p.id 
                              ? "bg-blue-50 border-blue-200 text-blue-900 font-medium" 
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Query */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-slate-400">User Query</label>
                    <input
                      type="text"
                      value={evalQuery}
                      onChange={(e) => setEvalQuery(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Context */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-slate-400">Retrieved Context Chunks</label>
                    <textarea
                      value={evalContext}
                      onChange={(e) => setEvalContext(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono bg-slate-50"
                    />
                  </div>

                  {/* Response Text */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-slate-400">Model Output To Verify</label>
                    <textarea
                      value={evalResponseText}
                      onChange={(e) => setEvalResponseText(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono bg-slate-50"
                    />
                  </div>

                  <button
                    onClick={runEvalSuite}
                    disabled={evalLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 disabled:opacity-50 transition"
                  >
                    {evalLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Activity className="w-4 h-4" /> Run Automated QA Audit
                      </>
                    )}
                  </button>
                </div>

                {/* Simulated metrics & gauges */}
                <div className="md:col-span-8 flex flex-col gap-6">
                  
                  {/* Gauge metrics boxes */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono border-b border-slate-100 pb-3 mb-4">
                      Quantitative Observability Dashboard
                    </h4>

                    {evalLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-sm font-mono text-slate-500">Scanning context constraints... scoring hallucinations on Vertex.</span>
                      </div>
                    ) : evalResult ? (
                      <div className="space-y-6">
                        
                        {/* 3 Circular Visual Score Gauges */}
                        <div className="grid grid-cols-3 gap-4">
                          
                          {/* Groundedness Gauge */}
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center text-center">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                              Groundedness
                            </span>
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              {/* SVG Radial circle */}
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="26" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                                <circle cx="32" cy="32" r="26" stroke={evalResult.groundednessScore < 0.6 ? "#f43f5e" : evalResult.groundednessScore < 0.85 ? "#f59e0b" : "#10b981"} strokeWidth="5" fill="transparent" strokeDasharray={`${2 * Math.PI * 26}`} strokeDashoffset={`${2 * Math.PI * 26 * (1 - evalResult.groundednessScore)}`} />
                              </svg>
                              <div className="absolute font-mono font-bold text-sm text-slate-800">
                                {Math.round(evalResult.groundednessScore * 100)}%
                              </div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 mt-2 block">
                              Source Compliance
                            </span>
                          </div>

                          {/* Relevance Gauge */}
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center text-center">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                              Answer Relevance
                            </span>
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="26" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                                <circle cx="32" cy="32" r="26" stroke={evalResult.relevanceScore < 0.6 ? "#f43f5e" : evalResult.relevanceScore < 0.85 ? "#f59e0b" : "#10b981"} strokeWidth="5" fill="transparent" strokeDasharray={`${2 * Math.PI * 26}`} strokeDashoffset={`${2 * Math.PI * 26 * (1 - evalResult.relevanceScore)}`} />
                              </svg>
                              <div className="absolute font-mono font-bold text-sm text-slate-800">
                                {Math.round(evalResult.relevanceScore * 100)}%
                              </div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 mt-2 block">
                              Intent Alignment
                            </span>
                          </div>

                          {/* Faithfulness Gauge */}
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center text-center">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                              Faithfulness
                            </span>
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="26" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                                <circle cx="32" cy="32" r="26" stroke={evalResult.faithfulnessScore < 0.6 ? "#f43f5e" : evalResult.faithfulnessScore < 0.85 ? "#f59e0b" : "#10b981"} strokeWidth="5" fill="transparent" strokeDasharray={`${2 * Math.PI * 26}`} strokeDashoffset={`${2 * Math.PI * 26 * (1 - evalResult.faithfulnessScore)}`} />
                              </svg>
                              <div className="absolute font-mono font-bold text-sm text-slate-800">
                                {Math.round(evalResult.faithfulnessScore * 100)}%
                              </div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 mt-2 block">
                              Strict Truthfulness
                            </span>
                          </div>

                        </div>

                        {/* Reasoning details */}
                        <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs">
                          <strong className="text-slate-900 font-mono block mb-1">
                            Auditor Rationale:
                          </strong>
                          <p className="text-slate-600 font-mono leading-relaxed text-[11px]">
                            {evalResult.groundingReasoning}
                          </p>
                        </div>

                        {/* FDE Prompt Eng Refinement */}
                        <div className="border border-indigo-150 bg-indigo-50/70 rounded-lg p-4">
                          <div className="flex items-center justify-between gap-2 border-b border-indigo-200/50 pb-2 mb-2">
                            <h5 className="font-bold text-indigo-900 font-mono text-xs flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-indigo-600" /> Suggested Grounding Guardrail Prompt Fix
                            </h5>
                            <button
                              onClick={() => triggerCopy(evalResult.suggestedRefinement, "refinement_copy")}
                              className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center gap-1 font-mono hover:underline"
                            >
                              {copySuccess === "refinement_copy" ? <CheckCheck className="w-3.5 h-3.5" /> : "Copy Prompt Guard"}
                            </button>
                          </div>
                          
                          <p className="text-indigo-950 font-mono text-[11px] leading-relaxed bg-white/60 p-3 rounded border border-indigo-200/20">
                            {evalResult.suggestedRefinement}
                          </p>
                        </div>

                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 🔄 TAB 5: REGIONAL FRICTION & PRODUCT FEEDBACK LOOP */}
            {activeTab === 5 && (
              <motion.div
                key="tab-5"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Configuration side */}
                <div className="md:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-blue-600" /> Stuttgart-Mountain View Loop
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Translate thorny regional field friction (timeouts, IAM proxy limits) into Mountain View core feature tickets &amp; deploy custom workarounds.</p>
                  </div>

                  {/* Preset Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">Friction Cases</label>
                    <div className="space-y-1.5">
                      {FRICTION_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => loadFrictionPreset(p.id)}
                          className={`w-full text-left p-2.5 rounded border text-xs transition duration-150 ${
                            selectedFrictionPreset === p.id 
                              ? "bg-blue-50 border-blue-200 text-blue-900 font-medium" 
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Friction text */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-slate-400">Customer Friction Log</label>
                    <textarea
                      value={frictionText}
                      onChange={(e) => setFrictionText(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2 rounded border border-slate-200 font-mono bg-slate-50"
                    />
                  </div>

                  {/* Diagnosis */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-slate-400">GCP Engineer Diagnosis</label>
                    <textarea
                      value={frictionDiagnosis}
                      onChange={(e) => setFrictionDiagnosis(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 rounded border border-slate-200 font-mono bg-slate-50"
                    />
                  </div>

                  {/* Severity */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-mono text-slate-400">Blocker Priority Scale</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["low", "medium", "critical"] as const).map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setFrictionSeverity(sev)}
                          className={`py-1.5 px-3 rounded border text-xs font-mono capitalize transition ${
                            frictionSeverity === sev 
                              ? sev === "critical" 
                                ? "bg-red-100 border-red-300 text-red-950 font-bold" 
                                : sev === "medium" 
                                  ? "bg-amber-100 border-amber-300 text-amber-950 font-bold" 
                                  : "bg-blue-100 border-blue-300 text-blue-950 font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={runFrictionSynthesis}
                    disabled={frictionLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 disabled:opacity-50 transition"
                  >
                    {frictionLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Synthesize Product Ticket
                      </>
                    )}
                  </button>
                </div>

                {/* Simulated JIRA / PFR block and workaround code */}
                <div className="md:col-span-8 flex flex-col gap-6">
                  
                  {/* PFR ticket representation */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" /> Vertex CORE JIRA Ticket
                      </h4>
                      <span className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-2.5 py-1 rounded font-mono border border-indigo-200">
                        Mountain View Target: core_team_sa
                      </span>
                    </div>

                    {frictionLoading ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-sm font-mono text-slate-500">Formatting product requirement doc (PRD) constraints...</span>
                      </div>
                    ) : frictionResult ? (
                      <div className="space-y-4">
                        
                        <div className="bg-slate-900 rounded p-4 border border-slate-850 font-mono text-xs text-slate-100 space-y-3">
                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wide block">1. JIRA TECHNICAL TITLE:</span>
                            <span className="text-indigo-300 select-all font-bold">{frictionResult.titledIssue}</span>
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wide block">2. MOUNTAIN VIEW IMPACT ASSESSMENT SUMMARY:</span>
                            <span className="text-slate-200 block text-[11px] leading-relaxed mt-1">
                              {frictionResult.pfrImpactSummary}
                            </span>
                          </div>

                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wide block">3. PRODUCT TEAM NEXT BUILD ACTION ITEM:</span>
                            <span className="text-slate-300 block text-[11px] border-l-2 border-indigo-500 pl-3">
                              {frictionResult.productTeamActionItem}
                            </span>
                          </div>
                        </div>

                        {/* WORKAROUND PATCH */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-mono text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              DACH Immediate Field work-around Module
                            </label>
                            <button
                              onClick={() => triggerCopy(frictionResult.reusableFieldModuleCode, "workaround")}
                              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-mono hover:underline"
                            >
                              {copySuccess === "workaround" ? "Copied Patch!" : "Copy TypeScript Workaround Wrapper"}
                            </button>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-lg text-slate-200 text-xs font-mono overflow-x-auto relative shadow-inner max-h-60 overflow-y-auto border border-slate-900">
                            <pre className="text-[11px] text-slate-200">{frictionResult.reusableFieldModuleCode}</pre>
                          </div>
                        </div>

                        <div className="bg-amber-50 p-3 rounded border border-amber-200 text-xs text-amber-900 font-mono">
                          <strong className="text-amber-950 font-bold block mb-1">Customer Deployment Strategy:</strong>
                          {frictionResult.workaroundStrategy}
                        </div>

                      </div>
                    ) : null}
                  </div>

                  {/* Co-building / Mentoring Workspace Activity */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="border-b border-slate-100 pb-3 mb-4">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
                        DACH Client Mentoring &amp; Co-Building Log
                      </h4>
                      <p className="text-[11px] text-slate-400">FDEs build side-by-side with localized onsite engineers to bootstrap technical ownership patterns.</p>
                    </div>

                    <div className="space-y-3">
                      {coBuildMentees.map((mentee) => (
                        <div key={mentee.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                          <div className="flex items-center gap-2.5">
                            <UserCheck className="w-4 h-4 text-slate-500" />
                            <div>
                              <div className="font-bold text-slate-900">{mentee.name}</div>
                              <div className="text-slate-400 font-mono text-[10px]">{mentee.topic}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {mentee.status === "completed" && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                                Sync Completed
                              </span>
                            )}
                            {mentee.status === "active" && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                                Active Pairing
                              </span>
                            )}
                            {mentee.status === "scheduled" && (
                              <span className="bg-slate-200 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                                In Queue
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 px-6 py-5 mt-auto text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p>
            &copy; 2026 Google Cloud EMEA | Generative AI Forward Deployed Engineering Hub
          </p>
          <div className="flex justify-center gap-4 text-slate-400">
            <span>Sovereign Perimeter Shield Version v2.4-Frankfurt</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

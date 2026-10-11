import { useEffect, useMemo, useState } from "react";

type Screen =
  | "overview"
  | "research"
  | "analysis"
  | "insights"
  | "evidence"
  | "opportunities"
  | "flows"
  | "settings";
type InsightStatus = "needs review" | "accepted" | "rejected";
type InsightFilter = "all" | InsightStatus;
type OpportunityFilter = "All status" | "Needs review" | "Validated" | "Draft";
type OpportunityStatus = Exclude<OpportunityFilter, "All status">;

type ResearchSource = {
  id: string;
  name: string;
  metadata: string;
  type: string;
  volume: string;
  statementCount: number | null;
  status: "Processing" | "Analyzed" | "Ready to analyze";
  summary: string;
  origin?: "mock" | "pasted";
};

type Insight = {
  id: number;
  text: string;
  detail: string;
  status: InsightStatus;
  sources: number;
  statements: number;
  evidence: number;
};

type OpportunityFlow = {
  title: string;
  steps: string[];
};

type UserFlowStatus = "accepted" | "needs review" | "draft";

type UserFlow = {
  id: string;
  title: string;
  status: UserFlowStatus;
  rationale: string;
  steps: string[];
};

const generatedWorkspaceFlowId = "pricing-comparison-generated";

type Opportunity = {
  id: string;
  insightId: number | null;
  text: string;
  direction: string;
  status: OpportunityStatus;
  createdAt: string;
  flow?: OpportunityFlow;
};

const initialUserFlows: UserFlow[] = [
  {
    id: "returning-evaluator",
    title: "Returning Evaluator One-Click Checkout Flow",
    status: "needs review",
    rationale: "Eliminates repetitive data entry for returning accounts.",
    steps: ["Resume Checkout", "Confirm Pre-fill", "One-Click Activate"],
  },
];

const insightStateActions: Record<
  InsightStatus,
  { key: string; label: string; nextStatus: InsightStatus; primary: boolean }[]
> = {
  "needs review": [
    { key: "accept", label: "Accept", nextStatus: "accepted", primary: true },
    { key: "reject", label: "Reject", nextStatus: "rejected", primary: false },
  ],
  accepted: [
    { key: "reopen", label: "Reopen", nextStatus: "needs review", primary: false },
    { key: "reject", label: "Reject", nextStatus: "rejected", primary: false },
  ],
  rejected: [
    { key: "restore", label: "Restore", nextStatus: "accepted", primary: false },
  ],
};

type Project = {
  id: string;
  name: string;
  description: string;
  status: "In progress" | "Completed";
  sources: number;
  insights: number;
  opportunities: number;
  flows: number;
};

const nav = [
  ["overview", "Overview", "/assets/20817.svg"],
  ["research", "Research", "/assets/0e19b.svg", "12"],
  ["insights", "Insights", "/assets/fc81b.svg", "8"],
  ["opportunities", "Opportunities", "/assets/acf1a.svg", "5"],
  ["flows", "User Flows", "/assets/d40b4.svg"],
] as const;

const initialProjects: Project[] = [
  {
    id: "saas-onboarding",
    name: "SaaS Onboarding & Checkout Study",
    description:
      "Multi-cohort qualitative usability research evaluating tier comparison, seat expansion, and trial checkout friction.",
    status: "In progress",
    sources: 12,
    insights: 8,
    opportunities: 5,
    flows: 3,
  },
  {
    id: "mobile-banking",
    name: "Mobile Banking Research",
    description:
      "Research study with synthesized customer feedback and validated UX opportunities.",
    status: "In progress",
    sources: 11,
    insights: 7,
    opportunities: 4,
    flows: 2,
  },
  {
    id: "healthcare-appointment",
    name: "Healthcare Appointment Flow",
    description:
      "Research study with synthesized customer feedback and validated UX opportunities.",
    status: "Completed",
    sources: 10,
    insights: 6,
    opportunities: 3,
    flows: 1,
  },
  {
    id: "ecommerce-returns",
    name: "E-commerce Returns Study",
    description:
      "Research study with synthesized customer feedback and validated UX opportunities.",
    status: "Completed",
    sources: 9,
    insights: 5,
    opportunities: 2,
    flows: 0,
  },
];

const workspaceMetrics: [string, string | number][] = [
  ["Projects", "2 active studies"],
  ["Insights", "14 insights to review"],
  ["Opportunities", "9 validated opportunities"],
  ["User Flows", "6 created user flows"],
];

const initialInsights: Insight[] = [
  {
    id: 1,
    text: "Users struggle to compare plan features and seat pricing side-by-side.",
    detail:
      "Users may have difficulty understanding differences between plans before selecting one, leading to decision fatigue or drop-off.",
    status: "needs review",
    sources: 8,
    statements: 14,
    evidence: 8,
  },
  {
    id: 2,
    text: "Users hesitate when checkout requires too much information upfront.",
    detail:
      "Demanding full company, address and payment details before demonstrating immediate product value causes abandonment.",
    status: "needs review",
    sources: 5,
    statements: 11,
    evidence: 5,
  },
  {
    id: 3,
    text: "Returning users expect previously entered information to be remembered.",
    detail:
      "Returning evaluators drop off when re-prompted to duplicate input they already supplied during trial sign-up.",
    status: "accepted",
    sources: 6,
    statements: 9,
    evidence: 6,
  },
  {
    id: 4,
    text: "Trial users are unclear about when billing begins.",
    detail:
      "Ambiguity around exact trial end dates and charge notifications creates hesitation to enter credit card info.",
    status: "accepted",
    sources: 4,
    statements: 8,
    evidence: 4,
  },
  {
    id: 5,
    text: "Enterprise teams miss contextual seat expansion tiers during team invitations.",
    detail:
      "Admins adding colleagues are startled by abrupt tier jumps instead of clear incremental pricing.",
    status: "accepted",
    sources: 6,
    statements: 10,
    evidence: 6,
  },
  {
    id: 6,
    text: "Mobile checkout lacks autofill for tax and billing address fields.",
    detail:
      "Mobile conversion lags desktop due to tedious manual form entry on smaller screens.",
    status: "needs review",
    sources: 3,
    statements: 5,
    evidence: 3,
  },
  {
    id: 7,
    text: "Coupon and promo code input induces fear of missing out on existing discounts.",
    detail:
      "An empty promo field prompts users to abandon checkout to search coupon aggregators.",
    status: "accepted",
    sources: 5,
    statements: 7,
    evidence: 5,
  },
  {
    id: 8,
    text: "Users demand dark mode styling for the pricing matrix.",
    detail: "Only two isolated mentions appeared in informal feedback.",
    status: "rejected",
    sources: 2,
    statements: 2,
    evidence: 2,
  },
];

const initialOpportunities: Opportunity[] = [
  {
    id: "plan-comparison",
    insightId: 1,
    text: "Make differences between pricing tiers easier to compare at a glance.",
    direction:
      "Present plan features and seat pricing side by side, with clear labels for what each tier includes.",
    status: "Validated",
    createdAt: "2 days ago",
    flow: {
      title: "Side-by-Side Tier Comparison & Plan Selection Journey",
      steps: ["Pricing Page", "Compare Plans", "Plan Details", "Select Plan", "Review Selection", "Confirm"],
    },
  },
  {
    id: "checkout-requirements",
    insightId: 2,
    text: "Make checkout requirements clear before users commit.",
    direction:
      "Explain why company, address, and payment details are requested before asking users to complete checkout.",
    status: "Needs review",
    createdAt: "Yesterday",
  },
  {
    id: "returning-checkout",
    insightId: 3,
    text: "Allow returning users to continue checkout without repeating previously entered information.",
    direction:
      "Carry forward information already provided during trial sign-up so returning evaluators can resume checkout.",
    status: "Validated",
    createdAt: "Yesterday",
    flow: {
      title: "Returning Evaluator One-Click Checkout Flow",
      steps: ["Resume Checkout", "Confirm Pre-fill", "Review Details", "Activate"],
    },
  },
  {
    id: "trial-billing",
    insightId: 4,
    text: "Make the trial end date and billing start clear.",
    direction:
      "Show the exact trial end date and when the first charge will occur before credit card details are submitted.",
    status: "Draft",
    createdAt: "3 days ago",
  },
  {
    id: "seat-expansion",
    insightId: 5,
    text: "Show seat expansion pricing before team invitations are sent.",
    direction:
      "Make incremental seat costs and tier thresholds visible while admins add colleagues.",
    status: "Validated",
    createdAt: "3 days ago",
  },
];

const generatedInsightTemplates: Omit<Insight, "id">[] = [
  {
    text: "Users want plan comparison to feel more transparent before the trial starts.",
    detail:
      "The pricing matrix currently hides key differences behind multiple clicks, which makes the decision feel risky and slow.",
    status: "needs review",
    sources: 4,
    statements: 7,
    evidence: 4,
  },
  {
    text: "Returning evaluators expect prefilled billing details to remain intact across sessions.",
    detail:
      "Re-entering the same information breaks momentum and makes the checkout flow feel inconsistent after a prior trial.",
    status: "needs review",
    sources: 3,
    statements: 6,
    evidence: 3,
  },
  {
    text: "Enterprise buyers need clearer pricing context before they expand seat counts.",
    detail:
      "Seat expansion decisions feel abrupt when pricing thresholds are not visible until after the user has already committed.",
    status: "needs review",
    sources: 4,
    statements: 8,
    evidence: 4,
  },
];

const evidence = [
  ["INTERVIEW TRANSCRIPT", "Participant P-03", "I wasn’t sure what I was actually getting with the Pro plan. I had to open three separate tabs to check which integrations were included.", "User Interviews — SaaS Onboarding", "Sept 18", "Video recording · transcript"],
  ["INTERVIEW TRANSCRIPT", "Participant P-07", "I had to keep switching between plans to compare them. A side-by-side table would have answered my question in five seconds.", "User Interviews — SaaS Onboarding", "Sept 19", "Audio · transcript"],
  ["SURVEY RESPONSE", "Response #214", "Pricing differences weren’t immediately clear. The tier names sound similar and seat limits are hidden behind tooltips.", "Customer Survey — Trial Experience", "Sept 20", "Qualitative survey"],
  ["USABILITY TEST RECORDING", "Session #02", "I clicked back and forth three times trying to see if SSO was included in Growth or Pro. It felt like work just to decide.", "Usability Testing — Checkout Flow", "Sept 19", "Lookback usability video"],
  ["CUSTOMER FEEDBACK", "Support Ticket #4412", "Customer asked for a PDF or matrix showing which features exist in Pro vs Enterprise before they could sign off with procurement.", "Support Tickets — Checkout Issues", "Sept 21", "Zendesk ticket"],
  ["CALL RECORDING", "Call #04", "Prospect was hesitant during demo because tier add-ons seemed opaque. They wanted a clear side-by-side comparison to share with their VP.", "Sales Call Transcripts", "Sept 17", "Gong call recording"],
];

const initialResearchSources: ResearchSource[] = [
  { id: "support-checkout", name: "Support Tickets — Checkout Issues", metadata: "Customer feedback · TXT · Added 1 day ago · 820 KB", type: "Customer feedback", volume: "86 conversations", statementCount: null, status: "Processing", summary: "Support conversations are still being prepared and are not yet available for synthesis." },
  { id: "onboarding-replays", name: "Onboarding Drop-off Session Replays", metadata: "Session recordings · TXT · Added just now · 1.1 MB", type: "Session recordings", volume: "24 replays", statementCount: null, status: "Processing", summary: "Session recordings are still being prepared and are not yet available for synthesis." },
  { id: "billing-support", name: "Billing Inquiries Support Channel", metadata: "Intercom export · CSV · Added 3 hours ago · 480 KB", type: "Support tickets", volume: "52 threads", statementCount: null, status: "Processing", summary: "Support threads are still being prepared and are not yet available for synthesis." },
  { id: "user-interviews", name: "User Interviews — SaaS Onboarding", metadata: "Interview transcripts · PDF · Added 2 days ago · 2.4 MB", type: "Interview transcripts", volume: "12 participants", statementCount: 8, status: "Analyzed", summary: "Interview findings are available for synthesis and linked to the study's evidence." },
  { id: "checkout-testing", name: "Usability Testing — Checkout Flow", metadata: "Usability test recordings · DOCX · Added 3 days ago · 4.1 MB", type: "Usability tests", volume: "8 sessions", statementCount: 6, status: "Analyzed", summary: "Usability-test findings are available for synthesis and linked to the study's evidence." },
  { id: "trial-survey", name: "Customer Survey — Trial Experience", metadata: "Survey responses · CSV · Added 4 days ago · 1.2 MB", type: "Surveys", volume: "150 responses", statementCount: 5, status: "Analyzed", summary: "Survey findings are available for synthesis and linked to the study's evidence." },
  { id: "stakeholder-interviews", name: "Executive Stakeholder Interviews", metadata: "Stakeholder notes · PDF · Added 5 days ago · 1.8 MB", type: "Interview transcripts", volume: "4 interviews", statementCount: 4, status: "Analyzed", summary: "Stakeholder interview findings are available for synthesis." },
  { id: "competitive-audit", name: "Competitive Audit — SaaS Tier Comparison", metadata: "Benchmarking notes · PDF · Added 6 days ago · 3.5 MB", type: "Competitive audits", volume: "6 competitors", statementCount: 4, status: "Analyzed", summary: "Competitive audit findings are available for synthesis." },
  { id: "product-feedback", name: "Product Feedback — Trial Sign-up", metadata: "Customer feedback · CSV · Added 6 days ago · 640 KB", type: "Customer feedback", volume: "38 responses", statementCount: 4, status: "Analyzed", summary: "Trial sign-up feedback is available for synthesis." },
  { id: "pricing-interviews", name: "Pricing Page Customer Interviews", metadata: "Interview transcripts · DOCX · Added 1 week ago · 1.6 MB", type: "Interview transcripts", volume: "5 interviews", statementCount: 4, status: "Analyzed", summary: "Pricing interview findings are available for synthesis." },
  { id: "checkout-usability", name: "Plan Selection Usability Sessions", metadata: "Session recordings · MP4 · Added 1 week ago · 3.8 MB", type: "Usability tests", volume: "3 sessions", statementCount: 4, status: "Analyzed", summary: "Plan-selection usability findings are available for synthesis." },
  { id: "sales-calls", name: "Sales Calls — Plan Selection", metadata: "Call transcripts · PDF · Added 1 week ago · 2.1 MB", type: "Call transcripts", volume: "3 calls", statementCount: 3, status: "Analyzed", summary: "Sales-call findings are available for synthesis." },
];

const mockFileTemplates = [
  { name: "Checkout Journey — Mock Session Replay", type: "Session recordings", volume: "1 replay", metadata: "Session recording · MP4 · Added just now · 1.1 MB" },
  { name: "Pricing Feedback — Mock Survey", type: "Surveys", volume: "12 responses", metadata: "Survey responses · CSV · Added just now · 320 KB" },
  { name: "Onboarding Notes — Mock Interview", type: "Interview transcripts", volume: "1 interview", metadata: "Interview transcript · TXT · Added just now · 18 KB" },
];

const themes = [
  ["Theme 01", "Pricing confusion & tiered plan opacity", "14 statements across 8 sources"],
  ["Theme 02", "Navigation difficulty & multi-step disorientation", "11 statements across 5 sources"],
  ["Theme 03", "Lack of contextual product information", "9 statements across 6 sources"],
  ["Theme 04", "Trust concerns & billing transparency", "8 statements across 4 sources"],
];

function Button({
  children,
  onClick,
  kind = "secondary",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean;
}) {
  return (
    <button className={`button ${kind}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Badge({ status }: { status: string }) {
  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const className = normalized === "needs-review" || normalized === "processing" ? normalized : normalized || "default";
  return <span className={`badge ${className}`}>{status}</span>;
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">UX COPILOT</div>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Sidebar({
  screen,
  go,
  switcher,
  setSwitcher,
  projects,
  activeProject,
  selectProject,
  researchSourceCount,
  flowCount,
}: {
  screen: Screen;
  go: (screen: Screen) => void;
  switcher: boolean;
  setSwitcher: (open: boolean) => void;
  projects: Project[];
  activeProject: Project;
  selectProject: (project: Project) => void;
  researchSourceCount: number;
  flowCount: number;
}) {
  const active = screen === "analysis" ? "research" : screen === "evidence" ? "insights" : screen;
  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <span className="logo">UX</span>
          <strong>UX Copilot</strong>
          <span className="prototype">PROTOTYPE</span>
        </div>
        <div className="project-switcher">
          <span>CURRENT PROJECT</span>
          <strong title={activeProject.name}>{activeProject.name}</strong>
          <button aria-expanded={switcher} onClick={() => setSwitcher(!switcher)}>Switch project⌄</button>
          {switcher && (
            <div className="switch-menu">
              {projects.map((project) => (
                <button key={project.id} onClick={() => { selectProject(project); setSwitcher(false); go("overview"); }}>
                  <strong>{project.name}</strong>
                  <small>{project.status} · {project.sources} sources · {project.insights} insights</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="nav-title">WORKSPACE</div>
        <nav>
          {nav.map(([id, label, icon, count]) => (
            <button
              key={id}
              className={active === id ? "active" : ""}
              onClick={() => go(id as Screen)}
            >
              <span><img src={icon} alt="" />{label}</span>
              {(id === "flows" || count) && <small>{id === "research" ? researchSourceCount : id === "flows" ? flowCount : count}</small>}
            </button>
          ))}
        </nav>
      </div>
      <div className="sidebar-bottom">
        <button className="settings-link" onClick={() => go("settings")}>
          <img src="/assets/a9399.svg" alt="" /> Settings
        </button>
        <div className="profile">
          <span>SM</span>
          <div><strong>Suraj Meitei</strong><small>UI/UX Designer</small></div>
        </div>
      </div>
    </aside>
  );
}

function Header({ screen, projectName, newProject }: { screen: Screen; projectName: string; newProject: () => void }) {
  const labels: Record<Screen, string> = {
    overview: "Overview",
    research: "Research Sources",
    analysis: "Research Analysis",
    insights: "Insights Synthesis",
    evidence: "Evidence",
    opportunities: "UX Opportunities",
    flows: "User Flows",
    settings: "Settings",
  };
  return (
    <header className="topbar">
      <div><span>{projectName}</span><i>/</i><strong>{labels[screen]}</strong></div>
      <div className="top-actions">
        <span className="philosophy"><b /> AI suggests. <strong>Designer decides.</strong></span>
        <Button onClick={newProject}>＋ New Project</Button>
      </div>
    </header>
  );
}

function Metrics({ items }: { items: [string, string | number][] }) {
  return <div className="metrics">{items.map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function Overview({
  go,
  projects,
  activeProject,
  openProject,
  reviewInsights,
  reviewOpportunities,
  reviewFlows,
}: {
  go: (s: Screen) => void;
  projects: Project[];
  activeProject: Project;
  openProject: (project: Project) => void;
  reviewInsights: () => void;
  reviewOpportunities: () => void;
  reviewFlows: () => void;
}) {
  const activeStudyCount = projects.filter((project) => project.status === "In progress").length;
  return (
    <div className="page overview">
      <div className="title-block"><h1>Good to have you back, Suraj.</h1><p>Turn research into clearer UX decisions with AI-assisted synthesis.</p></div>
      <section className="latest">
        <div><span className="eyebrow indigo">{activeProject.status === "In progress" ? "LATEST ACTIVE STUDY" : "SELECTED STUDY"}</span><h2>{activeProject.name}</h2><p>{activeProject.description}</p><div className="metadata">{activeProject.sources} Sources　·　{activeProject.insights} Insights　·　{activeProject.opportunities} Opportunities　·　{activeProject.flows} User Flows</div></div>
        <Button kind="primary" onClick={() => go("research")}>{activeProject.status === "In progress" ? "Continue latest project →" : "Open project →"}</Button>
      </section>
      <section className="attention">
        <strong>Needs your attention</strong>
        <div><span><b />3 insights need review</span><Button onClick={reviewInsights}>Review →</Button></div>
        <div><span><b />2 opportunities ready to explore</span><Button onClick={reviewOpportunities}>Review →</Button></div>
        <div><span><b />1 user flow awaiting your decision</span><Button onClick={reviewFlows}>Review →</Button></div>
      </section>
      <div>
        <div className="section-heading"><div><h3>Workspace snapshot</h3><span>Across {projects.length} studies</span></div></div>
        <Metrics items={workspaceMetrics.map(([label, value]) => [label, label === "Projects" ? `${activeStudyCount} active studies` : value])} />
      </div>
      <div>
        <div className="section-heading"><div><h3>Recent Projects</h3><span>{projects.length} studies in workspace</span></div></div>
        <div className="project-grid">
          {projects.map((project) => <button className="project-card" key={project.id} onClick={() => openProject(project)}><span className="project-badges"><Badge status={project.status} />{project.id === activeProject.id && <Badge status="Selected" />}</span><h3>{project.name}</h3><p>{project.description}</p><div className="project-stats"><span><b>{project.sources}</b>Sources</span><span><b>{project.insights}</b>Insights</span><span><b>{project.opportunities}</b>Opportunities</span><span><b>{project.flows}</b>User Flows</span></div><footer><span>◷ Active recently</span><span className="project-open">Open study →</span></footer></button>)}
        </div>
      </div>
    </div>
  );
}

function Research({
  go,
  sources,
  openPaste,
  addMockSource,
}: {
  go: (s: Screen) => void;
  sources: ResearchSource[];
  openPaste: () => void;
  addMockSource: () => void;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedSource, setSelectedSource] = useState<ResearchSource | null>(null);
  const analyzedSources = sources.filter((source) => source.status === "Analyzed");
  const pendingSources = sources.filter((source) => source.status !== "Analyzed");
  const extractedStatements = analyzedSources.reduce((total, source) => total + (source.statementCount ?? 0), 0);
  const readySources = sources.filter((source) => source.status === "Ready to analyze");
  const sourceTypes = [...new Set(sources.map((source) => source.type))].sort();
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleSources = sources.filter((source) => {
    const matchesSearch = !normalizedSearch || `${source.name} ${source.metadata} ${source.type} ${source.volume}`.toLocaleLowerCase().includes(normalizedSearch);
    const matchesType = typeFilter === "All types" || source.type === typeFilter;
    const matchesStatus = statusFilter === "All status" || source.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });
  const hasActiveFilters = Boolean(search.trim()) || typeFilter !== "All types" || statusFilter !== "All status";
  const openPasteFlow = () => {
    setShowAddMenu(false);
    openPaste();
  };
  const chooseMockFile = () => {
    setShowAddMenu(false);
    addMockSource();
  };

  return (
    <div className="page research-page">
      <div className="page-title"><div><h1>Research</h1><p>Collect, organize and analyze the research behind your UX decisions.</p></div><div className="source-add-actions"><button className="button primary" aria-expanded={showAddMenu} onClick={() => setShowAddMenu(!showAddMenu)}>＋ Add Source</button>{showAddMenu && <div className="source-create-menu"><button onClick={chooseMockFile}>Choose mock file</button><button onClick={openPasteFlow}>Paste research</button></div>}</div></div>
      <Metrics items={[["Sources", sources.length], ["Analyzed", analyzedSources.length], ["Processing", pendingSources.length], ["Extracted statements", extractedStatements]]} />
      <p className="statement-context">{extractedStatements} extracted statements are from {analyzedSources.length} analyzed sources; pending sources have no synthesis results yet.</p>
      <section className="upload-panel">
        <div className="upload-copy"><span className="upload-icon">↥</span><div><h2>Add research</h2><p>Upload interview transcripts, surveys, recordings or research notes.</p></div></div>
        <div className="button-row"><Button onClick={openPasteFlow}>Paste Research</Button><Button kind="primary" onClick={chooseMockFile}>Choose mock file</Button></div>
      </section>
      {readySources.length > 0 && <div className="analysis-cta"><div><strong>{readySources.length} new source{readySources.length > 1 ? "s" : ""} ready</strong><p>Continue to the prototype analysis flow to review newly added research.</p></div><Button kind="primary" onClick={() => go("analysis")}>Analyze Research →</Button></div>}
      <div className="toolbar">
        <input aria-label="Search sources" placeholder="Search sources..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter sources by type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          <option>All types</option>
          {sourceTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <select aria-label="Filter sources by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option>All status</option>
          {["Processing", "Analyzed", "Ready to analyze"].map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>
      <div className="section-heading source-list-heading"><div><h3>Source library</h3><span>{visibleSources.length} of {sources.length} sources · {pendingSources.length} processing · {analyzedSources.length} analyzed</span></div>{analyzedSources.length > 0 && <button className="text-action" onClick={() => go("insights")}>Review Insights →</button>}</div>
      <p className="list-subtitle">Processing sources are not yet available for synthesis. Analyzed sources show their extracted statements.</p>
      <div className="source-list">
        {visibleSources.map((source) => <div className={`source-row ${source.origin ? "is-added" : ""}`} key={source.id}>
          <div className="source-identity"><strong title={source.name}>{source.name}</strong><small title={source.metadata}>{source.metadata}</small></div>
          <span className="source-volume" title={source.volume}>{source.volume}</span>
          {source.statementCount === null ? <span className="statement-pill pending">Not ready</span> : <span className="statement-pill">{source.statementCount} statements</span>}
          <div className="source-status"><Badge status={source.status} /></div>
          <button onClick={() => setSelectedSource(source)}>View source →</button>
        </div>)}
      </div>
      {visibleSources.length === 0 && <div className="empty-state source-empty"><h2>No sources match these filters</h2><p>Try a different search or clear the filters to see your research library.</p>{hasActiveFilters && <Button onClick={() => { setSearch(""); setTypeFilter("All types"); setStatusFilter("All status"); }}>Clear filters</Button>}</div>}
      {selectedSource && <Modal title="Source details" onClose={() => setSelectedSource(null)}><div className="source-detail"><span className="eyebrow indigo">{selectedSource.type}</span><h3>{selectedSource.name}</h3><p>{selectedSource.metadata}</p><div className="source-detail-stats"><span>Research volume<b>{selectedSource.volume}</b></span><span>Extracted statements<b>{selectedSource.statementCount ?? "Not available yet"}</b></span><span>Status<Badge status={selectedSource.status} /></span></div><p className="source-detail-summary">{selectedSource.summary}</p>{selectedSource.status === "Analyzed" && <p>Use <b>Review Insights</b> to continue to the available synthesis.</p>}</div><div className="modal-actions"><Button onClick={() => setSelectedSource(null)}>Close</Button></div></Modal>}
    </div>
  );
}

function Analysis({ go }: { go: (s: Screen) => void }) {
  const [stage, setStage] = useState(0);
  const [selected, setSelected] = useState(0);
  const [clusters, setClusters] = useState(false);
  if (stage < 3) {
    setTimeout(() => setStage(stage + 1), 750);
    return <div className="page center-state"><div className="spinner" /><span className="eyebrow indigo">AI-ASSISTED SYNTHESIS</span><h1>{["Analyzing research…", "Finding patterns…", "Structuring insights…"][stage]}</h1><p>Keeping every suggestion connected to its original source.</p><div className="progress"><i style={{ width: `${(stage + 1) * 33}%` }} /></div></div>;
  }
  return (
    <div className="page">
      <div className="success-banner"><span>✓</span><div><h1>Research Analysis Complete</h1><p>42 statements were grouped into 4 themes and 8 proposed insights.</p></div><Button kind="primary" onClick={() => go("insights")}>Review Insights →</Button></div>
      <div className="analysis-grid">
        <section><div className="section-heading"><div><h2>Recurring themes</h2><span>Patterns detected across your research</span></div><Button onClick={() => setClusters(true)}>Inspect clusters</Button></div>
          <div className="theme-list">{themes.map(([number, title, meta], index) => <button className={selected === index ? "selected" : ""} onClick={() => setSelected(index)} key={title}><span>{number}</span><div><h3>{title}</h3><p>{meta}</p></div><b>→</b></button>)}</div>
        </section>
        <aside className="analysis-summary"><span className="eyebrow indigo">ANALYSIS SUMMARY</span><h2>{themes[selected][1]}</h2><p>This pattern appeared consistently in interviews, usability tests, and survey responses.</p><dl><div><dt>Sources</dt><dd>8</dd></div><div><dt>Statements</dt><dd>14</dd></div><div><dt>Proposed insights</dt><dd>2</dd></div></dl><p className="principle">AI has organized the signal. You decide what becomes a validated insight.</p></aside>
      </div>
      {clusters && <Modal title="Theme cluster details" onClose={() => setClusters(false)}><p className="modal-copy">Pricing comparisons, hidden seat thresholds, unclear feature inclusion, and billing uncertainty form the strongest research cluster.</p><div className="tag-cloud"><span>Plan comparison</span><span>Pricing clarity</span><span>Seat limits</span><span>Billing transparency</span></div><div className="modal-actions"><Button onClick={() => setClusters(false)}>Close</Button><Button kind="primary" onClick={() => go("insights")}>Review related insights</Button></div></Modal>}
    </div>
  );
}

function Insights({
  insights,
  setInsights,
  goEvidence,
  focusInsightId,
  filter,
  setFilter,
}: {
  insights: Insight[];
  setInsights: React.Dispatch<React.SetStateAction<Insight[]>>;
  goEvidence: (id: number) => void;
  focusInsightId: number | null;
  filter: InsightFilter;
  setFilter: (filter: InsightFilter) => void;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const visible = filter === "all" ? insights : insights.filter((item) => item.status === filter);
  const acceptedCount = insights.filter((item) => item.status === "accepted").length;
  const needsReviewCount = insights.filter((item) => item.status === "needs review").length;
  const rejectedCount = insights.filter((item) => item.status === "rejected").length;
  const update = (id: number, updateFields: Partial<Insight>) =>
    setInsights((prev) => prev.map((item) => (item.id === id ? { ...item, ...updateFields } : item)));

  useEffect(() => {
    if (focusInsightId === null) return;
    document.getElementById(`insight-${focusInsightId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusInsightId]);

  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      setInsights((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const nextNewInsights = generatedInsightTemplates
          .filter((item) => !prev.some((existing) => existing.text === item.text))
          .map((item, index) => ({
            id: Math.max(0, ...existingIds) + index + 1,
            ...item,
          }));
        return [...prev, ...nextNewInsights];
      });
      setGenerating(false);
    }, 850);
  };

  return (
    <div className="page insights-page">
      <div className="page-title">
        <div>
          <h1>Insights</h1>
          <p>Turn research signals into clear UX findings.</p>
        </div>
        <button className="button primary" onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating…" : "Generate insights"}
        </button>
      </div>
      <Metrics items={[["Total insights", insights.length], ["Accepted", acceptedCount], ["Needs review", needsReviewCount], ["Rejected", rejectedCount]]} />
      <div className="filter-tabs">
        {(["all", "needs review", "accepted", "rejected"] as const).map((item) => (
          <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>
            {item === "all" ? "All" : item === "accepted" ? "Accepted" : item === "needs review" ? "Needs Review" : "Rejected"}
          </button>
        ))}
      </div>

      <div className="insight-list">
        {visible.map((insight) => {
          const isEditing = editing === insight.id;

          return (
            <article className={`insight-card ${insight.status}`} id={`insight-${insight.id}`} key={insight.id}>
              <div className="insight-content">
                <div className="insight-header">
                  <span className="eyebrow indigo">AI-GENERATED INSIGHT</span>
                  <Badge status={insight.status} />
                </div>

                {isEditing ? (
                  <textarea autoFocus value={insight.text} onChange={(event) => update(insight.id, { text: event.target.value })} />
                ) : (
                  <h3>{insight.text}</h3>
                )}

                <p>{insight.detail}</p>
                <div className="note"><b>Note:</b> Consistent pattern across qualitative and behavioral sources.</div>
              </div>

              <div className="insight-footer">
                <div className="insight-metrics" aria-label="Insight metrics">
                  {[
                    ["Sources", insight.sources],
                    ["Statements", insight.statements],
                    ["Evidence", insight.evidence],
                  ].map(([label, value]) => (
                    <span className="insight-metric" key={label}>
                      <strong>{value}</strong>
                      <small>{label}</small>
                    </span>
                  ))}
                </div>

                <div className="insight-actions">
                  {isEditing ? (
                    <button className="button primary" onClick={() => setEditing(null)}>
                      Save
                    </button>
                  ) : (
                    <button className="button" onClick={() => setEditing(insight.id)}>
                      Edit
                    </button>
                  )}
                  {insightStateActions[insight.status].map((action) => (
                    <button
                      className={`button${action.primary ? " primary" : ""}`}
                      key={action.key}
                      onClick={() => update(insight.id, { status: action.nextStatus })}
                    >
                      {action.label}
                    </button>
                  ))}
                  <button className="button" onClick={() => goEvidence(insight.id)}>
                    Review evidence →
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {visible.length === 0 && (
          <div className="empty-state">
            <h2>No insights here yet</h2>
            <p>Designer decisions will move insights into this view.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Evidence({
  insight,
  accept,
  back,
  createOpportunity,
}: {
  insight: Insight;
  accept: () => void;
  back: () => void;
  createOpportunity: () => void;
}) {
  const [expanded, setExpanded] = useState(0);
  return (
    <div className="page evidence-page">
      <button className="back-link" onClick={back}>← Back to Insights</button>
      <section className="evidence-head"><div className="section-heading"><div><h1>Evidence <Badge status={insight.status === "accepted" ? "Validated" : insight.status} /></h1><span>{evidence.length} evidence items across 5 sources validating this insight.</span></div><div className="button-row"><Button kind="success" onClick={accept}>✓ Accept Insight</Button><Button kind="primary" onClick={createOpportunity}>＋ Create Opportunity</Button></div></div><div className="parent-insight"><span>✦</span><div><small>SUPPORTING EVIDENCE FOR PARENT INSIGHT</small><strong>{insight.text}</strong></div></div></section>
      <div className="toolbar"><input placeholder="Search evidence quotes, participants, or notes..." /><select><option>All sources (5 sources)</option></select><select><option>All evidence types</option></select></div>
      <p className="list-subtitle">Showing {evidence.length} evidence items directly linked to this insight</p>
      <div className="evidence-list">{evidence.map(([type, participant, quote, source, date, format], index) => <button className={expanded === index ? "expanded" : ""} onClick={() => setExpanded(index)} key={quote}><div className="quote"><span className="eyebrow indigo">{type}</span><small>{participant}</small><blockquote>“{quote}”</blockquote><p>{source}</p>{expanded === index && <div className="evidence-note">This quote directly supports the insight by showing the effort required to compare plan information.</div>}</div><div className="evidence-meta"><span>Date: <b>{date}</b></span><span>Format: <b>{format}</b></span><span>Ref: <b>Session P-0{index + 3}</b></span></div><div className="evidence-tags"><span>Pricing confusion</span><span>Plan Comparison</span><b>{expanded === index ? "Selected" : "Inspect quote ›"}</b></div></button>)}</div>
    </div>
  );
}

function Opportunities({
  insights,
  opportunities,
  setOpportunities,
  manual,
  viewInsight,
  openFlow,
  filter,
  setFilter,
}: {
  insights: Insight[];
  opportunities: Opportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
  manual: () => void;
  viewInsight: (insightId: number) => void;
  openFlow: (opportunityId: string) => void;
  filter: OpportunityFilter;
  setFilter: (filter: OpportunityFilter) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [insightFilter, setInsightFilter] = useState("all");
  const visibleOpportunities = opportunities.filter((opportunity) => {
    const linkedInsight = insights.find((item) => item.id === opportunity.insightId);
    const matchesStatus = filter === "All status" || opportunity.status === filter;
    const matchesInsight = insightFilter === "all" || String(opportunity.insightId) === insightFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        opportunity.text,
        opportunity.direction,
        linkedInsight?.detail ?? "",
        linkedInsight?.text ?? "",
        opportunity.status,
      ].some((value) => value.toLowerCase().includes(query));
    return matchesStatus && matchesInsight && matchesSearch;
  });
  const validatedCount = opportunities.filter((item) => item.status === "Validated").length;
  const needsReviewCount = opportunities.filter((item) => item.status === "Needs review").length;
  const draftCount = opportunities.filter((item) => item.status === "Draft").length;

  return (
    <div className="page opportunities-page">
      <div className="page-title"><div><h1>Opportunities</h1><p>Turn research findings into actionable UX improvements.</p></div><Button kind="primary" onClick={manual}>＋ Create opportunity</Button></div>
      <Metrics items={[["Total opportunities", opportunities.length], ["Validated", validatedCount], ["Needs review", needsReviewCount], ["Draft", draftCount]]} />
      <div className="toolbar">
        <input aria-label="Search opportunities" placeholder="Search opportunities..." value={search} onChange={(event) => setSearch(event.target.value)} />
        <select aria-label="Filter opportunities by status" value={filter} onChange={(event) => setFilter(event.target.value as OpportunityFilter)}>
          {["All status", "Needs review", "Validated", "Draft"].map((status) => <option key={status}>{status}</option>)}
        </select>
        <select aria-label="Filter opportunities by insight" value={insightFilter} onChange={(event) => setInsightFilter(event.target.value)}>
          <option value="all">All insights</option>
          {insights.map((item) => <option value={item.id} key={item.id}>{item.text}</option>)}
        </select>
      </div>
      <div className="opportunity-list">
        {visibleOpportunities.map((opportunity) => {
          const linkedInsight = insights.find((item) => item.id === opportunity.insightId);
          const isEditing = editing === opportunity.id;
          return (
            <article className="opportunity-card" key={opportunity.id}>
              <div className="opportunity-main">
                {isEditing ? (
                  <textarea
                    aria-label="Edit opportunity title"
                    value={opportunity.text}
                    onChange={(event) => setOpportunities((prev) => prev.map((item) =>
                      item.id === opportunity.id ? { ...item, text: event.target.value } : item
                    ))}
                  />
                ) : (
                  <h2>{opportunity.text}</h2>
                )}
                <p><b>Direction:</b> {opportunity.direction}</p>
                <small>Created {opportunity.createdAt}</small>
              </div>
              <div className="opportunity-relation">
                <p><b>Problem:</b> {linkedInsight?.detail ?? "No linked source insight is available."}</p>
                <div className="related-insight">
                  <span>Related insight</span>
                  <strong>{linkedInsight?.text ?? "No linked source insight is available."}</strong>
                </div>
              </div>
              <div className="opportunity-actions">
                <Badge status={opportunity.status} />
                <div className="opportunity-action-buttons">
                  <div className="opportunity-secondary-actions">
                    <Button onClick={() => setEditing(isEditing ? null : opportunity.id)}>{isEditing ? "Save" : "Edit"}</Button>
                    <Button disabled={opportunity.insightId === null} onClick={() => opportunity.insightId !== null && viewInsight(opportunity.insightId)}>View Insight</Button>
                  </div>
                  <Button kind="primary" onClick={() => openFlow(opportunity.id)}>{opportunity.flow ? "View Flow" : "Generate Flow"}</Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {visibleOpportunities.length === 0 && <div className="empty-state"><h2>No opportunities in this status</h2><p>Choose another status to see available opportunities.</p></div>}
    </div>
  );
}

function FlowDiagram({
  steps,
  setSteps,
}: {
  steps: string[];
  setSteps: (steps: string[]) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const result = [...steps];
    [result[from], result[to]] = [result[to], result[from]];
    setSteps(result);
    setSelected(to);
  };
  return (
    <>
      <div className="flow-diagram"><div className="connector" />{steps.map((step, index) => <button className={selected === index ? "selected" : ""} onClick={() => setSelected(index)} key={`${step}-${index}`}><span>{index + 1}</span>{editing === index ? <input autoFocus value={step} onChange={(event) => setSteps(steps.map((item, i) => i === index ? event.target.value : item))} onBlur={() => setEditing(null)} /> : <strong>{step}</strong>}</button>)}</div>
      <div className="flow-tools"><Button onClick={() => setSteps([...steps, "New Step"])}>＋ Add step</Button>{selected !== null && <><Button onClick={() => setEditing(selected)}>Edit node</Button><Button onClick={() => move(selected, selected - 1)}>← Move</Button><Button onClick={() => move(selected, selected + 1)}>Move →</Button><Button kind="danger" onClick={() => { setSteps(steps.filter((_, i) => i !== selected)); setSelected(null); }}>Delete</Button></>}</div>
    </>
  );
}

function Flows({
  showPendingFirst = false,
  opportunity,
  onFlowCreated,
  workspaceFlows,
  onWorkspaceFlowCreated,
}: {
  showPendingFirst?: boolean;
  opportunity?: Opportunity;
  onFlowCreated?: (opportunityId: string, flow: OpportunityFlow) => void;
  workspaceFlows: UserFlow[];
  onWorkspaceFlowCreated: (flow: UserFlow) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [opportunityAccepted, setOpportunityAccepted] = useState(false);
  const savedGeneratedFlow = workspaceFlows.find((flow) => flow.id === generatedWorkspaceFlowId);
  const generated = opportunity ? Boolean(opportunity.flow) : Boolean(savedGeneratedFlow);
  const defaultSteps = ["Pricing Page", "Compare Plans", "Plan Details", "Select Plan", "Review Selection", "Confirm"];
  const [steps, setSteps] = useState(() => opportunity?.flow?.steps ?? savedGeneratedFlow?.steps ?? defaultSteps);
  const flowTitle = opportunity?.flow?.title ?? savedGeneratedFlow?.title ?? (opportunity
    ? `${opportunity.text} Journey`
    : "Side-by-Side Tier Comparison & Plan Selection Journey");
  const currentFlowStatus = opportunity
    ? opportunityAccepted ? "accepted" : "needs review"
    : savedGeneratedFlow?.status ?? "needs review";
  const persistGeneratedFlow = (nextSteps: string[], status: UserFlowStatus) => {
    onWorkspaceFlowCreated({
      id: generatedWorkspaceFlowId,
      title: flowTitle,
      status,
      rationale: "The flow helps users compare plans before selecting one and provides a clear review step before confirmation.",
      steps: nextSteps,
    });
  };
  useEffect(() => {
    setSteps(opportunity?.flow?.steps ?? savedGeneratedFlow?.steps ?? defaultSteps);
    setOpportunityAccepted(false);
  }, [opportunity?.id, opportunity?.flow?.title, savedGeneratedFlow?.title]);
  const generate = (regenerate = false) => {
    setGenerating(true);
    setTimeout(() => {
      const nextSteps = regenerate && steps.length % 2 === 0
        ? ["Pricing Page", "Compare Plans", "Choose Plan", "Review Selection", "Confirm"]
        : defaultSteps;
      setSteps(nextSteps);
      setOpportunityAccepted(false);
      setGenerating(false);
      if (opportunity) {
        onFlowCreated?.(opportunity.id, { title: flowTitle, steps: nextSteps });
      } else {
        persistGeneratedFlow(nextSteps, "needs review");
      }
    }, 900);
  };
  const setFlowSteps = (nextSteps: string[]) => {
    setSteps(nextSteps);
    if (!opportunity && savedGeneratedFlow) persistGeneratedFlow(nextSteps, savedGeneratedFlow.status);
  };
  const savedFlowCards = workspaceFlows.map((flow) => (
    <article className={`flow-card${flow.id === generatedWorkspaceFlowId ? "" : " muted-card"}`} key={flow.id}>
      <div className="flow-head">
        <div><span className="eyebrow">USER FLOW</span><h2>{flow.title}</h2></div>
        <Badge status={flow.status === "accepted" ? "Accepted Flow" : flow.status === "draft" ? "Draft" : "Needs review"} />
      </div>
      <p><b>AI RATIONALE:</b> {flow.rationale}</p>
      {flow.id === generatedWorkspaceFlowId ? (
        <>
          <p><b>OPPORTUNITY:</b> Make differences between pricing tiers easier to compare at a glance.</p>
          <FlowDiagram steps={steps} setSteps={setFlowSteps} />
          <div className="flow-footer">
            <span><b>{steps.length}</b> Stages</span>
            <span><b>{flow.status === "accepted" ? "✓ Accepted" : flow.status === "draft" ? "Draft" : "Needs review"}</b> Status</span>
            <span><b>Pricing Tier Comparison</b> Parent Opportunity</span>
          </div>
          <div className="button-row">
            <Button onClick={() => generate(true)}>Regenerate</Button>
            <Button kind="primary" onClick={() => persistGeneratedFlow(steps, "accepted")}>{flow.status === "accepted" ? "✓ Flow accepted" : "Accept flow"}</Button>
          </div>
          {flow.status === "accepted" && <div className="inline-success">✓ Flow accepted. The designer’s version is now the source of truth.</div>}
        </>
      ) : (
        <div className="mini-flow" aria-label={`Flow stages: ${flow.steps.join(", ")}`}>
          {flow.steps.map((step, index) => (
            <span className="mini-flow-step" key={`${flow.id}-${step}`}>
              <b>{index + 1}</b>{step}
              {index < flow.steps.length - 1 && <i aria-hidden="true">→</i>}
            </span>
          ))}
        </div>
      )}
    </article>
  ));
  const suggestedFlow = (
    <section className="generate-card">
      <span className="eyebrow indigo">AI-SUGGESTED FLOW</span>
      <h2>{flowTitle}</h2>
      <p>{opportunity ? `Based on the opportunity: ${opportunity.direction}` : "Based on the validated opportunity: Make plan comparison easier to scan and evaluate."}</p>
      {generating ? <><div className="spinner small" /><strong>Generating flow…</strong></> : <Button kind="primary" onClick={() => generate(false)}>Generate initial user flow</Button>}
    </section>
  );
  return (
    <div className="page flows-page">
      <div className="page-title"><div><h1>User Flows</h1><p>Map the journeys shaped by your research.</p></div><Button kind="primary" onClick={() => generate(false)}>＋ Create flow</Button></div>
      <Metrics items={[
        ["Total flows", workspaceFlows.length],
        ["Accepted", workspaceFlows.filter((flow) => flow.status === "accepted").length],
        ["Needs review", workspaceFlows.filter((flow) => flow.status === "needs review").length],
        ["Draft", workspaceFlows.filter((flow) => flow.status === "draft").length],
      ]} />
      {opportunity ? (
        generated ? <article className="flow-card">
        <div className="flow-head"><div><span className="eyebrow">USER FLOW</span><h2>{flowTitle}</h2></div><Badge status={currentFlowStatus === "accepted" ? "Accepted Flow" : "Needs review"} /></div>
        <p><b>AI RATIONALE:</b> {opportunity ? opportunity.direction : "The flow helps users compare plans before selecting one and provides a clear review step before confirmation."}</p>
        <p><b>OPPORTUNITY:</b> {opportunity?.text ?? "Make differences between pricing tiers easier to compare at a glance."}</p>
        <FlowDiagram steps={steps} setSteps={opportunity ? setSteps : setFlowSteps} />
        <div className="flow-footer"><span><b>{steps.length}</b> Stages</span><span><b>{currentFlowStatus === "accepted" ? "✓ Accepted" : "Needs review"}</b> Status</span><span><b>{opportunity?.text ?? "Pricing Tier Comparison"}</b> Parent Opportunity</span></div>
        <div className="button-row"><Button onClick={() => generate(true)}>Regenerate</Button><Button kind="primary" onClick={() => opportunity ? setOpportunityAccepted(true) : persistGeneratedFlow(steps, "accepted")}>{currentFlowStatus === "accepted" ? "✓ Flow accepted" : "Accept flow"}</Button></div>
        {currentFlowStatus === "accepted" && <div className="inline-success">✓ Flow accepted. The designer’s version is now the source of truth.</div>}
        </article> : suggestedFlow
      ) : (
        <>
          {showPendingFirst && savedFlowCards}
          {!generated && suggestedFlow}
          {!showPendingFirst && savedFlowCards}
        </>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("overview");
  const [switcher, setSwitcher] = useState(false);
  const [modal, setModal] = useState<"project" | "paste" | "opportunity" | null>(null);
  const [projects, setProjects] = useState(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState(initialProjects[0].id);
  const [projectName, setProjectName] = useState("");
  const [sources, setSources] = useState(initialResearchSources);
  const [pasteText, setPasteText] = useState("");
  const [insights, setInsights] = useState(initialInsights);
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [workspaceFlows, setWorkspaceFlows] = useState(initialUserFlows);
  const [selectedInsight, setSelectedInsight] = useState(1);
  const [focusInsightId, setFocusInsightId] = useState<number | null>(null);
  const [insightFilter, setInsightFilter] = useState<InsightFilter>("all");
  const [opportunityFilter, setOpportunityFilter] = useState<OpportunityFilter>("All status");
  const [showPendingFlowFirst, setShowPendingFlowFirst] = useState(false);
  const [flowOpportunityId, setFlowOpportunityId] = useState<string | null>(null);
  const activeProject = useMemo(() => projects.find((project) => project.id === activeProjectId) ?? projects[0], [projects, activeProjectId]);
  const activeInsight = useMemo(() => insights.find((item) => item.id === selectedInsight) ?? insights[0], [insights, selectedInsight]);
  const activeFlowOpportunity = useMemo(() => opportunities.find((item) => item.id === flowOpportunityId), [opportunities, flowOpportunityId]);
  const go = (next: Screen) => {
    setScreen(next);
    setShowPendingFlowFirst(false);
    setFlowOpportunityId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const updateInsight = (id: number, status: InsightStatus) => setInsights(insights.map((item) => item.id === id ? { ...item, status } : item));
  const openOpportunityFlow = (opportunityId: string) => {
    setFlowOpportunityId(opportunityId);
    setShowPendingFlowFirst(false);
    setScreen("flows");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const viewLinkedInsight = (insightId: number) => {
    setSelectedInsight(insightId);
    setFocusInsightId(insightId);
    setInsightFilter("all");
    go("insights");
  };
  const saveOpportunityFlow = (opportunityId: string, flow: OpportunityFlow) => {
    setOpportunities((prev) => prev.map((item) => item.id === opportunityId ? { ...item, flow } : item));
  };
  const saveWorkspaceFlow = (flow: UserFlow) => {
    setWorkspaceFlows((previous) => previous.some((item) => item.id === flow.id)
      ? previous.map((item) => item.id === flow.id ? flow : item)
      : [...previous, flow]);
  };
  const openProject = (project: Project) => {
    setActiveProjectId(project.id);
    go("research");
  };
  return (
    <div className="app-shell">
      <Sidebar screen={screen} go={go} switcher={switcher} setSwitcher={setSwitcher} projects={projects} activeProject={activeProject} selectProject={(project) => setActiveProjectId(project.id)} researchSourceCount={sources.length} flowCount={workspaceFlows.length} />
      <main className="workspace">
        <Header screen={screen} projectName={activeProject.name} newProject={() => setModal("project")} />
        {screen === "overview" && <Overview
          go={go}
          projects={projects}
          activeProject={activeProject}
          openProject={openProject}
          reviewInsights={() => { setInsightFilter("needs review"); go("insights"); }}
          reviewOpportunities={() => { setOpportunityFilter("Validated"); go("opportunities"); }}
          reviewFlows={() => { setShowPendingFlowFirst(true); setScreen("flows"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />}
        {screen === "research" && <Research
          go={go}
          sources={sources}
          openPaste={() => { setPasteText(""); setModal("paste"); }}
          addMockSource={() => {
            const addedCount = sources.filter((source) => source.origin === "mock").length;
            const template = mockFileTemplates[addedCount % mockFileTemplates.length];
            const suffix = addedCount >= mockFileTemplates.length ? ` (${Math.floor(addedCount / mockFileTemplates.length) + 1})` : "";
            setSources([...sources, {
              id: `added-${sources.length + 1}`,
              ...template,
              name: `${template.name}${suffix}`,
              status: "Ready to analyze",
              statementCount: null,
              summary: "This mock source is ready for the prototype analysis flow.",
              origin: "mock",
            }]);
          }}
        />}
        {screen === "analysis" && <Analysis go={go} />}
        {screen === "insights" && <Insights insights={insights} setInsights={setInsights} goEvidence={(id) => { setSelectedInsight(id); go("evidence"); }} focusInsightId={focusInsightId} filter={insightFilter} setFilter={setInsightFilter} />}
        {screen === "evidence" && <Evidence insight={activeInsight} accept={() => updateInsight(activeInsight.id, "accepted")} back={() => go("insights")} createOpportunity={() => { updateInsight(activeInsight.id, "accepted"); go("opportunities"); }} />}
        {screen === "opportunities" && <Opportunities insights={insights} opportunities={opportunities} setOpportunities={setOpportunities} manual={() => setModal("opportunity")} viewInsight={viewLinkedInsight} openFlow={openOpportunityFlow} filter={opportunityFilter} setFilter={setOpportunityFilter} />}
        {screen === "flows" && <Flows showPendingFirst={showPendingFlowFirst} opportunity={activeFlowOpportunity} onFlowCreated={saveOpportunityFlow} workspaceFlows={workspaceFlows} onWorkspaceFlowCreated={saveWorkspaceFlow} />}
        {screen === "settings" && <div className="page"><div className="page-title"><div><h1>Settings</h1><p>Prototype preferences for this workspace.</p></div></div><section className="settings-card"><h2>Workspace</h2><label>Project name<input value={activeProject.name} readOnly /></label><label className="toggle-row"><span><b>Preserve evidence traceability</b><small>Keep all AI suggestions linked to source material.</small></span><input type="checkbox" defaultChecked /></label></section></div>}
      </main>
      {modal === "project" && <Modal title="Create a new project" onClose={() => setModal(null)}><label>Project name<input autoFocus value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Checkout usability study" /></label><label>Short description<textarea placeholder="What are you researching?" /></label><div className="modal-actions"><Button onClick={() => setModal(null)}>Cancel</Button><Button kind="primary" disabled={!projectName.trim()} onClick={() => { const project: Project = { id: `project-${Date.now()}`, name: projectName.trim(), description: "Research study not yet started.", status: "In progress", sources: 0, insights: 0, opportunities: 0, flows: 0 }; setProjects([...projects, project]); setActiveProjectId(project.id); setProjectName(""); setModal(null); go("research"); }}>Create Project</Button></div></Modal>}
      {modal === "paste" && <Modal title="Paste research" onClose={() => setModal(null)}><label>Research notes<textarea autoFocus rows={8} value={pasteText} onChange={(event) => setPasteText(event.target.value)} placeholder="Paste an interview transcript, survey response, or observation…" /></label><div className="modal-actions"><Button onClick={() => setModal(null)}>Cancel</Button><Button kind="primary" disabled={!pasteText.trim()} onClick={() => { const pastedCount = sources.filter((source) => source.origin === "pasted").length; setSources([...sources, { id: `pasted-${sources.length + 1}`, name: `Pasted research notes${pastedCount ? ` (${pastedCount + 1})` : ""}`, metadata: "Pasted research · Added just now", type: "Pasted notes", volume: "1 pasted document", statementCount: null, status: "Ready to analyze", summary: pasteText.trim(), origin: "pasted" }]); setPasteText(""); setModal(null); }}>Add research</Button></div></Modal>}
      {modal === "opportunity" && <Modal title="Create opportunity" onClose={() => setModal(null)}><label>Opportunity statement<textarea defaultValue="Make plan comparison easier to scan and evaluate." /></label><label>Related insight<input value={activeInsight.text} readOnly /></label><div className="modal-actions"><Button onClick={() => setModal(null)}>Cancel</Button><Button kind="primary" onClick={() => setModal(null)}>Create opportunity</Button></div></Modal>}
    </div>
  );
}

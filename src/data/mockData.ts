// NEXUS Mock Data — Meridian Technologies

export interface NexusNode {
  id: string;
  label: string;
  type: 'person' | 'agent' | 'team' | 'decision' | 'fact' | 'commitment';
  division: 'HQ' | 'NA' | 'EMEA' | 'APAC';
  role?: string;
  cognitiveLoad?: number;
  trustLevel?: 'autonomous' | 'supervised' | 'review_required';
  x?: number;
  y?: number;
  pulsePhase?: number;
}

export interface NexusEdge {
  source: string;
  target: string;
  type: 'communication' | 'reporting' | 'delegation' | 'dependency';
  weight: number;
  interactionType: 'human-human' | 'human-ai' | 'ai-ai';
}

export interface NexusAlert {
  id: string;
  agentType: 'contradiction' | 'staleness' | 'silo' | 'overload' | 'drift' | 'coordination';
  severity: 'critical' | 'warning' | 'info';
  headline: string;
  detail: string;
  scope: string;
  affectedNodes: string[];
  estimatedCost?: string;
  resolution?: string;
  authority?: string;
  timestamp: string;
  resolved: boolean;
}

export const DIVISION_COLORS = {
  HQ: '#ff6b6b',
  NA: '#4ecdc4',
  EMEA: '#ffe66d',
  APAC: '#a8e6cf',
} as const;

export const AGENT_TYPE_COLORS = {
  contradiction: '#ff6b6b',
  staleness: '#f59e0b',
  silo: '#8b5cf6',
  overload: '#f97316',
  drift: '#06b6d4',
  coordination: '#3b82f6',
} as const;

export const nodes: NexusNode[] = [
  // HQ
  { id: 'p-alex', label: 'Alex Reeves', type: 'person', division: 'HQ', role: 'CEO', cognitiveLoad: 72 },
  { id: 'p-catherine', label: 'Catherine Moore', type: 'person', division: 'HQ', role: 'CSO', cognitiveLoad: 88 },
  { id: 'p-robert', label: 'Robert Daniels', type: 'person', division: 'HQ', role: 'CFO', cognitiveLoad: 55 },
  { id: 'p-nina', label: 'Nina Volkov', type: 'person', division: 'HQ', role: 'General Counsel', cognitiveLoad: 42 },
  { id: 'a-iris', label: 'Iris-Research', type: 'agent', division: 'HQ', role: 'Research Agent', trustLevel: 'autonomous' },
  { id: 'a-sentinel', label: 'Sentinel-Compliance', type: 'agent', division: 'HQ', role: 'Compliance Agent', trustLevel: 'supervised' },

  // NA
  { id: 'p-marcus', label: 'Marcus Rivera', type: 'person', division: 'NA', role: 'VP Engineering', cognitiveLoad: 75 },
  { id: 'p-priya', label: 'Priya Sharma', type: 'person', division: 'NA', role: 'Sr. Backend Eng', cognitiveLoad: 60 },
  { id: 'p-james', label: 'James Liu', type: 'person', division: 'NA', role: 'Staff Engineer', cognitiveLoad: 50 },
  { id: 'p-anika', label: 'Anika Patel', type: 'person', division: 'NA', role: 'Eng Manager', cognitiveLoad: 65 },
  { id: 'p-david', label: 'David Kim', type: 'person', division: 'NA', role: 'Head of Product', cognitiveLoad: 70 },
  { id: 'p-sarah', label: 'Sarah Chen', type: 'person', division: 'NA', role: 'VP Sales', cognitiveLoad: 78 },
  { id: 'p-tom', label: 'Tom Bradley', type: 'person', division: 'NA', role: 'Account Exec', cognitiveLoad: 45 },
  { id: 'p-maria', label: 'Maria Santos', type: 'person', division: 'NA', role: 'VP Customer Success', cognitiveLoad: 62 },
  { id: 'a-atlas', label: 'Atlas-Code', type: 'agent', division: 'NA', role: 'Coding Agent', trustLevel: 'supervised' },
  { id: 'a-nova', label: 'Nova-Sales', type: 'agent', division: 'NA', role: 'Sales Agent', trustLevel: 'review_required' },

  // EMEA
  { id: 'p-henrik', label: 'Henrik Johansson', type: 'person', division: 'EMEA', role: 'EMEA Eng Lead', cognitiveLoad: 55 },
  { id: 'p-elena', label: 'Elena Kowalski', type: 'person', division: 'EMEA', role: 'Sr. Engineer', cognitiveLoad: 48 },
  { id: 'p-omar', label: 'Omar Hassan', type: 'person', division: 'EMEA', role: 'Backend Dev', cognitiveLoad: 40 },
  { id: 'p-sophie', label: 'Sophie Dubois', type: 'person', division: 'EMEA', role: 'EMEA Ops Mgr', cognitiveLoad: 52 },
  { id: 'p-lars', label: 'Lars Mueller', type: 'person', division: 'EMEA', role: 'EMEA Sales Dir', cognitiveLoad: 60 },

  // APAC
  { id: 'p-yuki', label: 'Yuki Tanaka', type: 'person', division: 'APAC', role: 'APAC Eng Lead', cognitiveLoad: 58 },
  { id: 'p-wei', label: 'Wei Zhang', type: 'person', division: 'APAC', role: 'Growth Lead', cognitiveLoad: 50 },
];

export const edges: NexusEdge[] = [
  // HQ internal
  { source: 'p-alex', target: 'p-catherine', type: 'reporting', weight: 0.9, interactionType: 'human-human' },
  { source: 'p-alex', target: 'p-robert', type: 'reporting', weight: 0.8, interactionType: 'human-human' },
  { source: 'p-alex', target: 'p-nina', type: 'reporting', weight: 0.6, interactionType: 'human-human' },
  { source: 'p-catherine', target: 'a-iris', type: 'delegation', weight: 0.7, interactionType: 'human-ai' },
  { source: 'p-nina', target: 'a-sentinel', type: 'delegation', weight: 0.8, interactionType: 'human-ai' },

  // NA internal
  { source: 'p-alex', target: 'p-marcus', type: 'reporting', weight: 0.8, interactionType: 'human-human' },
  { source: 'p-marcus', target: 'p-priya', type: 'reporting', weight: 0.9, interactionType: 'human-human' },
  { source: 'p-marcus', target: 'p-james', type: 'reporting', weight: 0.7, interactionType: 'human-human' },
  { source: 'p-marcus', target: 'p-anika', type: 'reporting', weight: 0.85, interactionType: 'human-human' },
  { source: 'p-marcus', target: 'a-atlas', type: 'delegation', weight: 0.9, interactionType: 'human-ai' },
  { source: 'p-alex', target: 'p-david', type: 'reporting', weight: 0.7, interactionType: 'human-human' },
  { source: 'p-alex', target: 'p-sarah', type: 'reporting', weight: 0.85, interactionType: 'human-human' },
  { source: 'p-sarah', target: 'p-tom', type: 'reporting', weight: 0.8, interactionType: 'human-human' },
  { source: 'p-sarah', target: 'a-nova', type: 'delegation', weight: 0.7, interactionType: 'human-ai' },
  { source: 'p-alex', target: 'p-maria', type: 'reporting', weight: 0.6, interactionType: 'human-human' },

  // Cross-division
  { source: 'p-marcus', target: 'p-henrik', type: 'communication', weight: 0.5, interactionType: 'human-human' },
  { source: 'p-priya', target: 'p-elena', type: 'communication', weight: 0.3, interactionType: 'human-human' },
  { source: 'p-david', target: 'p-yuki', type: 'communication', weight: 0.4, interactionType: 'human-human' },
  { source: 'p-sarah', target: 'p-lars', type: 'communication', weight: 0.6, interactionType: 'human-human' },
  { source: 'p-catherine', target: 'p-wei', type: 'communication', weight: 0.3, interactionType: 'human-human' },

  // EMEA internal
  { source: 'p-henrik', target: 'p-elena', type: 'reporting', weight: 0.8, interactionType: 'human-human' },
  { source: 'p-henrik', target: 'p-omar', type: 'reporting', weight: 0.7, interactionType: 'human-human' },
  { source: 'p-sophie', target: 'p-lars', type: 'communication', weight: 0.5, interactionType: 'human-human' },

  // APAC
  { source: 'p-yuki', target: 'p-wei', type: 'communication', weight: 0.6, interactionType: 'human-human' },

  // AI-AI
  { source: 'a-atlas', target: 'a-iris', type: 'dependency', weight: 0.4, interactionType: 'ai-ai' },
  { source: 'a-nova', target: 'a-sentinel', type: 'dependency', weight: 0.3, interactionType: 'ai-ai' },
];

export const alerts: NexusAlert[] = [
  {
    id: 'alert-1',
    agentType: 'contradiction',
    severity: 'critical',
    headline: 'Conflicting pricing sent to Acme Corp ($20 vs $15/seat)',
    detail: 'Sarah Chen quoted Acme Corp $20/seat, but Nova-Sales sent an automated proposal at $15/seat using an outdated Q3 pricing sheet. The customer now has two conflicting proposals.',
    scope: 'Cross-division',
    affectedNodes: ['p-sarah', 'a-nova', 'p-tom'],
    estimatedCost: '$30K ARR at risk',
    resolution: 'Contact Acme Corp to confirm $20/seat pricing',
    authority: 'Sarah Chen (VP Sales)',
    timestamp: '3h ago',
    resolved: false,
  },
  {
    id: 'alert-2',
    agentType: 'contradiction',
    severity: 'warning',
    headline: 'v2.0 launch date conflict (Mar 15 vs Apr 1)',
    detail: 'Engineering committed to March 15 delivery, but Product roadmap shows April 1. External communications reference both dates.',
    scope: 'Cross-division',
    affectedNodes: ['p-marcus', 'p-david'],
    estimatedCost: '$15K coordination overhead',
    resolution: 'Align on single launch date in next sync',
    authority: 'Marcus Rivera (VP Eng)',
    timestamp: '5h ago',
    resolved: false,
  },
  {
    id: 'alert-3',
    agentType: 'staleness',
    severity: 'warning',
    headline: 'Atlas-Code using deprecated REST v3 spec',
    detail: 'The Payments team switched to GraphQL two days ago, but Atlas-Code is still generating REST v3 code. Every commit is technical debt.',
    scope: 'NA',
    affectedNodes: ['a-atlas', 'p-priya'],
    resolution: 'Update Atlas-Code context to GraphQL spec',
    authority: 'Marcus Rivera (VP Eng)',
    timestamp: '8h ago',
    resolved: false,
  },
  {
    id: 'alert-4',
    agentType: 'silo',
    severity: 'warning',
    headline: 'NA Payments & EMEA Billing duplicate retry logic (83% overlap)',
    detail: 'Both teams independently built nearly identical retry logic for failed transactions. 83% code overlap but zero direct communication between teams.',
    scope: 'Cross-division',
    affectedNodes: ['p-priya', 'p-elena', 'p-omar'],
    estimatedCost: '$45K duplicated engineering effort',
    resolution: 'Merge implementations and establish shared library',
    authority: 'Marcus Rivera & Henrik Johansson',
    timestamp: '1d ago',
    resolved: false,
  },
  {
    id: 'alert-5',
    agentType: 'overload',
    severity: 'warning',
    headline: 'Catherine Moore (CSO) at 88% cognitive load',
    detail: 'Catherine is actively involved in 14 concurrent workstreams across 3 divisions. Risk of burnout and delayed strategic decisions.',
    scope: 'HQ',
    affectedNodes: ['p-catherine'],
    resolution: 'Delegate 3+ workstreams to direct reports',
    authority: 'Alex Reeves (CEO)',
    timestamp: '2h ago',
    resolved: false,
  },
  {
    id: 'alert-6',
    agentType: 'silo',
    severity: 'info',
    headline: 'Team communication gap detected between APAC and EMEA',
    detail: 'APAC and EMEA engineering teams have no direct communication channels despite working on overlapping market features.',
    scope: 'Cross-division',
    affectedNodes: ['p-yuki', 'p-henrik'],
    resolution: 'Establish weekly cross-division sync',
    authority: 'Alex Reeves (CEO)',
    timestamp: '1d ago',
    resolved: false,
  },
  {
    id: 'alert-7',
    agentType: 'coordination',
    severity: 'warning',
    headline: 'Nova-Sales operating at review_required trust level',
    detail: 'Nova-Sales trust level was downgraded after the Acme Corp pricing incident. All automated proposals now require human review before sending.',
    scope: 'NA',
    affectedNodes: ['a-nova', 'p-sarah'],
    resolution: 'Complete pricing database audit and recalibrate',
    authority: 'Sarah Chen (VP Sales)',
    timestamp: '3h ago',
    resolved: false,
  },
];

// --- Per-node task data ---

export interface NodeTask {
  id: string;
  title: string;
  status: 'active' | 'blocked' | 'done';
  progress?: number;
}

export const TASKS_BY_NODE: Record<string, NodeTask[]> = {
  'p-alex': [
    { id: 't1', title: 'Review Q1 board deck', status: 'active', progress: 60 },
    { id: 't2', title: 'Approve APAC market-entry timeline', status: 'active', progress: 80 },
    { id: 't3', title: 'Sign off on Nova-Sales recalibration', status: 'blocked' },
  ],
  'p-catherine': [
    { id: 't4', title: 'APAC competitive landscape report', status: 'active', progress: 45 },
    { id: 't5', title: 'Finalize partnership term sheet', status: 'active', progress: 30 },
    { id: 't6', title: 'Delegate 3 workstreams per Nexus recommendation', status: 'blocked' },
    { id: 't7', title: 'Q4 strategy retro', status: 'done' },
  ],
  'p-robert': [
    { id: 't8', title: 'Reconcile Acme Corp pricing ($20 vs $15)', status: 'active', progress: 20 },
    { id: 't9', title: 'Q1 budget reforecast', status: 'active', progress: 55 },
  ],
  'p-marcus': [
    { id: 't10', title: 'GraphQL migration — Payments service', status: 'active', progress: 70 },
    { id: 't11', title: 'Align v2.0 launch date (Mar 15 vs Apr 1)', status: 'blocked' },
    { id: 't12', title: 'Update Atlas-Code context to GraphQL spec', status: 'active', progress: 40 },
  ],
  'p-sarah': [
    { id: 't13', title: 'Resolve Acme Corp pricing conflict', status: 'active', progress: 35 },
    { id: 't14', title: 'Q1 pipeline review — $2.4M target', status: 'active', progress: 50 },
    { id: 't15', title: 'Nova-Sales trust audit', status: 'active', progress: 15 },
  ],
  'p-david': [
    { id: 't16', title: 'v2.0 feature freeze signoff', status: 'blocked' },
    { id: 't17', title: 'APAC rollout coordination with Yuki', status: 'active', progress: 25 },
  ],
  'p-priya': [
    { id: 't18', title: 'GraphQL endpoint — /payments/retry', status: 'active', progress: 85 },
    { id: 't19', title: 'Merge shared retry lib with EMEA', status: 'blocked' },
  ],
  'p-henrik': [
    { id: 't20', title: 'EMEA billing retry refactor', status: 'active', progress: 60 },
    { id: 't21', title: 'Cross-division sync setup with NA', status: 'active', progress: 10 },
  ],
  'p-elena': [
    { id: 't22', title: 'Retry logic extraction to shared lib', status: 'active', progress: 50 },
    { id: 't23', title: 'Code review backlog (7 PRs)', status: 'active', progress: 30 },
  ],
  'p-yuki': [
    { id: 't24', title: 'APAC launch readiness checklist', status: 'active', progress: 40 },
    { id: 't25', title: 'Localization QA — JP/KR/CN', status: 'active', progress: 65 },
  ],
  'p-wei': [
    { id: 't26', title: 'APAC growth model v3', status: 'active', progress: 55 },
    { id: 't27', title: 'Market sizing update — SEA region', status: 'done' },
  ],
  'p-sophie': [
    { id: 't28', title: 'EMEA ops budget reconciliation', status: 'active', progress: 70 },
    { id: 't29', title: 'Vendor contract renewals (3 pending)', status: 'active', progress: 45 },
  ],
};

export const suggestedQueries = [
  'What changed today?',
  'Is anything about to go wrong?',
  'Who is overloaded right now?',
  'Show me cross-division dependencies',
  'What decisions were made this week?',
];

export const demoResponses: Record<string, string> = {
  'What changed today?': `Three things need your attention.\n\nFirst — a critical contradiction. Sarah Chen quoted Acme Corp $20 per seat, but Nova-Sales sent them $15 per seat three hours later using an outdated pricing sheet. The customer now has two conflicting proposals. $30K in annual revenue at stake.\n\nSecond — a knowledge silo. NA Payments and EMEA Billing both independently built retry logic for failed transactions. 83% code overlap, zero communication between the teams. That's roughly $45K in duplicated engineering effort.\n\nThird — strategic drift. Atlas-Code is still generating REST v3 code, but the Payments team switched to GraphQL two days ago. Every commit Atlas-Code makes is technical debt.`,
  'Is anything about to go wrong?': `Two escalating risks detected.\n\n1. Catherine Moore (CSO) is at 88% cognitive load with 14 concurrent workstreams. She's a single point of failure for strategic decisions across 3 divisions. If she's unavailable for 48 hours, 6 active workstreams would stall.\n\n2. Nova-Sales is operating at review_required trust level after the pricing incident. All automated proposals are queued for human review, creating a bottleneck in the sales pipeline. 4 proposals pending review.`,
  'Who is overloaded right now?': `Catherine Moore (CSO) is at 88% cognitive load — the highest in the organization. She's managing 14 concurrent workstreams across HQ, NA, and EMEA.\n\nSecond is Sarah Chen (VP Sales) at 78%, dealing with the Acme Corp pricing fallout while managing Q1 targets.\n\nMarcus Rivera (VP Eng) is at 75%, juggling the GraphQL migration, Atlas-Code context update, and the v2.0 launch date conflict.`,
  'Show me cross-division dependencies': `I found 4 major cross-division dependencies:\n\n1. NA Engineering ↔ EMEA Engineering: Shared retry logic (currently duplicated, 83% overlap)\n2. NA Sales ↔ EMEA Sales: Shared client portfolio (Acme Corp spans both regions)\n3. HQ Strategy ↔ APAC Growth: Market entry timeline depends on CSO approval\n4. NA Product ↔ APAC Engineering: Feature rollout coordination for v2.0`,
  'What decisions were made this week?': `4 decisions tracked this week:\n\n1. Feb 7 — Billing API switched from REST v3 to GraphQL (Marcus Rivera)\n2. Feb 5 — Nova-Sales trust level downgraded to review_required (Sarah Chen)\n3. Feb 3 — Enterprise pricing confirmed at $20/seat (Sarah Chen)\n4. Feb 3 — APAC market entry timeline finalized for Q2 (Catherine Moore)`,
};

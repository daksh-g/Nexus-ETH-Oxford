import { useRef, useEffect, useState, useCallback } from 'react';
import { nodes, edges, DIVISION_COLORS, type NexusNode } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RotateCcw, AlertTriangle, GitBranch, Users, Radio, Activity, Shield, Sparkles, Menu, X, Clock, UserMinus, Waves, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OnboardingModal from '@/components/OnboardingModal';
import DecisionTimeline from '@/components/DecisionTimeline';
import ContradictionPanel from '@/components/overlays/ContradictionPanel';
import BriefingPanel from '@/components/overlays/BriefingPanel';
import NodeDetailPanel from '@/components/overlays/NodeDetailPanel';
import WhatIfPanel from '@/components/overlays/WhatIfPanel';
import ProactiveToasts from '@/components/ProactiveToasts';

// --- Types ---

interface Particle {
  edgeIdx: number;
  progress: number;
  speed: number;
}

export interface AgentMessage {
  from: string;
  to: string;
  label: string;
  progress: number;
  color: string;
}

export interface TraceStep {
  agent: string;
  action: string;
  targetNodes: string[];
  confidence?: number;
  agentColor: string;
}

interface DemoOverlay {
  type: 'contradiction' | 'silo' | 'briefing' | 'ripple' | 'onboarding' | 'trace' | 'timeline' | 'whatif' | 'spread' | null;
}

// --- Agent colors ---
const AGENT_COLORS: Record<string, string> = {
  'Coordinator': '#4ecdc4',
  'Memory': '#a78bfa',
  'Critic': '#ff6b6b',
  'Router': '#ffe66d',
};

// --- Nodes that the BFS should skip (to demo unreached gaps) ---
const SPREAD_SKIP_NODES = new Set(['p-sophie', 'p-omar', 'p-wei']);

// --- Pre-compute BFS spread timings ---
function computeSpreadTimings(sourceId: string): { nodeId: string; delayMs: number }[] {
  const adj = new Map<string, { target: string; weight: number }[]>();
  edges.forEach(e => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source)!.push({ target: e.target, weight: e.weight });
    adj.get(e.target)!.push({ target: e.source, weight: e.weight });
  });

  const visited = new Set<string>([sourceId]);
  const queue: { nodeId: string; delay: number }[] = [{ nodeId: sourceId, delay: 0 }];
  const result: { nodeId: string; delayMs: number }[] = [];
  let head = 0;

  while (head < queue.length) {
    const { nodeId, delay } = queue[head++];
    const neighbors = adj.get(nodeId) || [];
    for (const { target, weight } of neighbors) {
      if (!visited.has(target) && !SPREAD_SKIP_NODES.has(target)) {
        visited.add(target);
        const hopDelay = delay + Math.round(200 / weight);
        result.push({ nodeId: target, delayMs: hopDelay });
        queue.push({ nodeId: target, delay: hopDelay });
      }
    }
  }

  // Find unreached nodes
  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      result.push({ nodeId: n.id, delayMs: -1 }); // -1 = unreachable
    }
  });

  return result;
}

// --- Canvas draw helpers ---

function drawEdges(
  ctx: CanvasRenderingContext2D,
  overlay: DemoOverlay,
  hb: number,
  t: number,
  nodePositions: Map<string, { x: number; y: number; baseX: number; baseY: number }>,
  highlightedPaths: string[][],
  removedNodeId: string | null,
) {
  edges.forEach((edge) => {
    const s = nodePositions.get(edge.source);
    const tgt = nodePositions.get(edge.target);
    if (!s || !tgt) return;

    // What-If: dashed edges for removed node
    if (removedNodeId && (edge.source === removedNodeId || edge.target === removedNodeId)) {
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.stroke();
      ctx.restore();
      return;
    }

    let color = 'rgba(255,255,255,0.08)';
    if (edge.interactionType === 'human-ai') color = 'rgba(78,205,196,0.12)';
    if (edge.interactionType === 'ai-ai') color = 'rgba(139,92,246,0.12)';
    ctx.lineWidth = 0.5 + edge.weight * 1.5;

    if (overlay.type === 'contradiction' &&
      ((edge.source === 'p-sarah' && edge.target === 'a-nova') ||
        (edge.source === 'a-nova' && edge.target === 'p-sarah') ||
        (edge.source === 'p-sarah' && edge.target === 'p-tom'))) {
      color = `rgba(255, 50, 50, ${0.6 * hb})`;
      ctx.lineWidth = 2.5;
    }

    for (const path of highlightedPaths) {
      if (path.includes(edge.source) && path.includes(edge.target)) {
        color = `rgba(78, 205, 196, ${0.5 + Math.sin(t * 3) * 0.3})`;
        ctx.lineWidth = 2.5;
      }
    }

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(tgt.x, tgt.y);
    ctx.strokeStyle = color;
    ctx.stroke();

    if (overlay.type === 'silo' || overlay.type === 'briefing') {
      if ((edge.source === 'p-priya' && edge.target === 'p-elena') ||
        (edge.source === 'p-elena' && edge.target === 'p-priya')) {
        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = `rgba(255, 200, 50, ${0.6 + Math.sin(t * 3) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.stroke();
        ctx.restore();

        const mx = (s.x + tgt.x) / 2;
        const my = (s.y + tgt.y) / 2;
        ctx.save();
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillStyle = `rgba(255, 230, 109, ${0.7 + Math.sin(t * 2) * 0.3})`;
        ctx.textAlign = 'center';
        ctx.fillText('83% OVERLAP · 0 COMMS', mx, my - 8);
        ctx.font = '9px "JetBrains Mono"';
        ctx.fillStyle = 'rgba(255, 200, 50, 0.5)';
        ctx.fillText('SILO DETECTED', mx, my + 6);
        ctx.restore();
      }
    }
  });
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  nodePositions: Map<string, { x: number; y: number; baseX: number; baseY: number }>,
) {
  particles.forEach(p => {
    p.progress += p.speed;
    if (p.progress > 1) p.progress = 0;
    const edge = edges[p.edgeIdx];
    const s = nodePositions.get(edge.source);
    const tgt = nodePositions.get(edge.target);
    if (!s || !tgt) return;

    const px = s.x + (tgt.x - s.x) * p.progress;
    const py = s.y + (tgt.y - s.y) * p.progress;

    let pColor = 'rgba(255,255,255,0.3)';
    if (edge.interactionType === 'human-ai') pColor = 'rgba(78,205,196,0.5)';
    if (edge.interactionType === 'ai-ai') pColor = 'rgba(139,92,246,0.5)';

    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = pColor.replace(/[\d.]+\)$/, '0.1)');
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = pColor;
    ctx.fill();
  });
}

function drawAgentMessages(
  ctx: CanvasRenderingContext2D,
  agentMessages: AgentMessage[],
  nodePositions: Map<string, { x: number; y: number; baseX: number; baseY: number }>,
) {
  agentMessages.forEach(msg => {
    const s = nodePositions.get(msg.from);
    const tgt = nodePositions.get(msg.to);
    if (!s || !tgt) return;

    const px = s.x + (tgt.x - s.x) * msg.progress;
    const py = s.y + (tgt.y - s.y) * msg.progress;

    const trailGrad = ctx.createRadialGradient(px, py, 0, px, py, 18);
    trailGrad.addColorStop(0, msg.color.replace(')', ', 0.4)').replace('rgb', 'rgba'));
    trailGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.fillStyle = trailGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = msg.color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });
}

function drawNodes(
  ctx: CanvasRenderingContext2D,
  overlay: DemoOverlay,
  hb: number,
  t: number,
  nodePositions: Map<string, { x: number; y: number; baseX: number; baseY: number }>,
  activeAgentId: string | null,
  removedNodeId: string | null,
  informedNodes: Set<string> | null,
  spreadActive: boolean,
  correctedNodes?: Set<string>,
) {
  nodes.forEach(node => {
    const pos = nodePositions.get(node.id);
    if (!pos) return;

    const divColor = DIVISION_COLORS[node.division];
    const pulse = Math.sin(t * 2 + node.id.charCodeAt(2) * 0.5) * 0.2 + 0.8;
    const baseRadius = node.type === 'agent' ? 12 : 10 + (node.cognitiveLoad || 50) * 0.04;
    const r = baseRadius * pulse * hb;

    // What-If: removed node
    if (removedNodeId === node.id) {
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#666';
      ctx.fill();
      ctx.font = '10px "Inter"';
      ctx.fillStyle = 'rgba(255,100,100,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText('DEPARTED', pos.x, pos.y + r + 14);
      ctx.globalAlpha = 1;
      return;
    }

    // Understanding Spread: dim uninformed nodes
    if (spreadActive && informedNodes) {
      if (!informedNodes.has(node.id)) {
        ctx.globalAlpha = 0.15;
      } else {
        ctx.globalAlpha = 1;
      }
    }

    // What-If: affected nodes get orange tint
    const isWhatIfAffected = removedNodeId && ['p-sarah', 'p-marcus', 'p-yuki', 'a-nova', 'p-alex'].includes(node.id) && overlay.type === 'whatif';

    const isContradictionNode = overlay.type === 'contradiction' &&
      (node.id === 'p-sarah' || node.id === 'a-nova');
    const isActiveAgent = node.id === activeAgentId;

    // Outer glow
    const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 3.5);
    if (isActiveAgent) {
      gradient.addColorStop(0, 'rgba(78, 205, 196, 0.35)');
      gradient.addColorStop(0.5, 'rgba(78, 205, 196, 0.1)');
    } else if (isWhatIfAffected) {
      gradient.addColorStop(0, 'rgba(249, 115, 22, 0.25)');
      gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.08)');
    } else if (isContradictionNode) {
      gradient.addColorStop(0, `rgba(255, 50, 50, ${0.15 * hb})`);
    } else {
      gradient.addColorStop(0, divColor + '18');
    }
    gradient.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, isActiveAgent ? r * 5 : r * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    if (node.type === 'agent') {
      const hexR = isActiveAgent ? r * 1.3 : r;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = pos.x + Math.cos(angle) * hexR;
        const py = pos.y + Math.sin(angle) * hexR;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = isActiveAgent ? '#22d3ee' : '#06b6d4';
      ctx.fill();
      ctx.strokeStyle = isActiveAgent ? '#67e8f9' : '#22d3ee';
      ctx.lineWidth = isActiveAgent ? 2.5 : 1.5;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isWhatIfAffected ? '#f97316' : divColor;
      ctx.fill();

      if (isContradictionNode) {
        ctx.strokeStyle = `rgba(255, 50, 50, ${0.5 + Math.sin(t * 4) * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Labels
    ctx.font = '10px "Inter"';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'center';
    const lastName = node.label.split(' ').pop() || node.label;
    ctx.fillText(node.type === 'agent' ? node.label : lastName, pos.x, pos.y + r + 14);

    if (node.role) {
      ctx.font = '8px "Inter"';
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillText(node.role, pos.x, pos.y + r + 24);
    }

    // Green glow for corrected nodes
    if (correctedNodes?.has(node.id)) {
      ctx.save();
      const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 4);
      glow.addColorStop(0, `rgba(34, 197, 94, ${0.3 + Math.sin(t * 3) * 0.15})`);
      glow.addColorStop(0.5, 'rgba(34, 197, 94, 0.08)');
      glow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34, 197, 94, ${0.6 + Math.sin(t * 4) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    ctx.globalAlpha = 1; // Reset
  });

  // Spread: draw "NOT REACHED" labels for unreachable nodes
  if (spreadActive && informedNodes) {
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos || informedNodes.has(node.id)) return;
      ctx.save();
      ctx.font = 'bold 9px "JetBrains Mono"';
      ctx.fillStyle = `rgba(255, 200, 50, ${0.6 + Math.sin(t * 3) * 0.4})`;
      ctx.textAlign = 'center';
      ctx.fillText('NOT REACHED', pos.x, pos.y - 20);
      ctx.restore();
    });
  }
}

function drawRipple(
  ctx: CanvasRenderingContext2D,
  overlay: DemoOverlay,
  t: number,
  nodePositions: Map<string, { x: number; y: number; baseX: number; baseY: number }>,
) {
  if (overlay.type !== 'ripple') return;
  const ceoPos = nodePositions.get('p-alex');
  if (!ceoPos) return;
  for (let i = 0; i < 3; i++) {
    const radius = ((t * 0.8 + i) % 3) * 120;
    const alpha = Math.max(0, 1 - radius / 360);
    ctx.beginPath();
    ctx.arc(ceoPos.x, ceoPos.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(78, 205, 196, ${alpha * 0.5})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawDivisionLabels(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const spread = Math.min(w, h) * 0.32;
  const positions = {
    HQ: { x: w / 2, y: h / 2 - spread * 0.6 - spread * 0.45 },
    NA: { x: w / 2 - spread * 1.1, y: h / 2 + spread * 0.2 - spread * 0.45 },
    EMEA: { x: w / 2 + spread * 1.1, y: h / 2 + spread * 0.2 - spread * 0.45 },
    APAC: { x: w / 2, y: h / 2 + spread * 0.9 - spread * 0.35 },
  };
  const labels = { HQ: 'HEADQUARTERS', NA: 'NORTH AMERICA', EMEA: 'EMEA', APAC: 'APAC' };

  Object.entries(positions).forEach(([div, pos]) => {
    ctx.font = '11px "JetBrains Mono"';
    ctx.fillStyle = DIVISION_COLORS[div as keyof typeof DIVISION_COLORS] + '40';
    ctx.textAlign = 'center';
    ctx.fillText(labels[div as keyof typeof labels], pos.x, pos.y);
  });
}

function drawLegend(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const x = w - 170;
  const y = h - 110;
  ctx.save();
  ctx.fillStyle = 'rgba(8, 10, 18, 0.7)';
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, 160, 100, 8);
  ctx.fill();
  ctx.stroke();

  ctx.font = '9px "JetBrains Mono"';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.textAlign = 'left';
  ctx.fillText('LEGEND', x + 10, y + 16);

  ctx.beginPath();
  ctx.arc(x + 18, y + 34, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#4ecdc4';
  ctx.fill();
  ctx.font = '9px "Inter"';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('Person', x + 30, y + 37);

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const px = x + 18 + Math.cos(a) * 5;
    const py = y + 52 + Math.sin(a) * 5;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#06b6d4';
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('AI Agent', x + 30, y + 55);

  ctx.beginPath();
  ctx.moveTo(x + 12, y + 72);
  ctx.lineTo(x + 24, y + 72);
  ctx.strokeStyle = 'rgba(78,205,196,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('Human ↔ AI', x + 30, y + 75);

  ctx.beginPath();
  ctx.moveTo(x + 12, y + 88);
  ctx.lineTo(x + 24, y + 88);
  ctx.strokeStyle = 'rgba(139,92,246,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('AI ↔ AI', x + 30, y + 91);
  ctx.restore();
}

// --- Animated number helper ---
function useAnimatedNumber(target: number, duration = 800): number {
  const [display, setDisplay] = useState(target);
  const startRef = useRef(target);
  const startTimeRef = useRef(0);

  useEffect(() => {
    startRef.current = display;
    startTimeRef.current = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(startRef.current + (target - startRef.current) * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

function formatDollars(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n}`;
}

// --- Main Component ---

const DemoView = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const animRef = useRef<number>(0);
  const [selectedNode, setSelectedNode] = useState<NexusNode | null>(null);
  const [overlay, setOverlay] = useState<DemoOverlay>({ type: null });
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const nodePositionsRef = useRef<Map<string, { x: number; y: number; baseX: number; baseY: number }>>(new Map());

  // R2: Reasoning trace state
  const [highlightedPaths, setHighlightedPaths] = useState<string[][]>([]);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [visibleTraceSteps, setVisibleTraceSteps] = useState(0);
  const [agentMeshStatus, setAgentMeshStatus] = useState<Record<string, string>>({
    'Coordinator': 'idle', 'Memory': 'idle', 'Critic': 'idle', 'Router': 'idle',
  });

  // V2: What-If state
  const [removedNodeId, setRemovedNodeId] = useState<string | null>(null);

  // V2: Understanding Spread state
  const [informedNodes, setInformedNodes] = useState<Set<string> | null>(null);
  const [spreadActive, setSpreadActive] = useState(false);
  const [spreadCount, setSpreadCount] = useState(0);
  const [spreadTotal, setSpreadTotal] = useState(0);
  const [spreadUnreached, setSpreadUnreached] = useState(0);
  const spreadCancelRef = useRef(false);

  // V3: Spread auto-correction
  const [spreadCorrecting, setSpreadCorrecting] = useState(false);
  const [correctedNodes, setCorrectedNodes] = useState<Set<string>>(new Set());
  const [showEmailPreview, setShowEmailPreview] = useState<string | null>(null);
  const correctedNodesRef = useRef<Set<string>>(new Set());

  // V3: Feedback system
  const [feedbackEdges, setFeedbackEdges] = useState<{ source: string; target: string; type: 'useful' | 'not-useful' | 'request-info'; expiresAt: number }[]>([]);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const feedbackEdgesRef = useRef(feedbackEdges);
  feedbackEdgesRef.current = feedbackEdges;

  // V2: Dollar counter
  const [orgRisk, setOrgRisk] = useState(75200); // Base: $30K contradiction + $45K silo + misc
  const animatedRisk = useAnimatedNumber(orgRisk);

  // Proactive toast suppression
  const overlayActiveRef = useRef(false);
  overlayActiveRef.current = overlay.type !== null;

  // Keep refs current for canvas draw loop
  const highlightedPathsRef = useRef(highlightedPaths);
  const agentMessagesRef = useRef(agentMessages);
  const activeAgentIdRef = useRef(activeAgentId);
  const removedNodeIdRef = useRef(removedNodeId);
  const informedNodesRef = useRef(informedNodes);
  const spreadActiveRef = useRef(spreadActive);
  highlightedPathsRef.current = highlightedPaths;
  agentMessagesRef.current = agentMessages;
  activeAgentIdRef.current = activeAgentId;
  removedNodeIdRef.current = removedNodeId;
  informedNodesRef.current = informedNodes;
  spreadActiveRef.current = spreadActive;
  correctedNodesRef.current = correctedNodes;

  // --- Deterministic node positions (seeded, not random) ---
  const initNodePositions = useCallback((w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const spread = Math.min(w, h) * 0.32;

    const clusterCenters = {
      HQ: { x: cx, y: cy - spread * 0.6 },
      NA: { x: cx - spread * 1.1, y: cy + spread * 0.2 },
      EMEA: { x: cx + spread * 1.1, y: cy + spread * 0.2 },
      APAC: { x: cx, y: cy + spread * 0.9 },
    };

    const divisionNodes: Record<string, NexusNode[]> = { HQ: [], NA: [], EMEA: [], APAC: [] };
    nodes.forEach(n => divisionNodes[n.division].push(n));

    Object.entries(divisionNodes).forEach(([div, dns]) => {
      const center = clusterCenters[div as keyof typeof clusterCenters];
      const radius = spread * 0.35;
      dns.forEach((node, i) => {
        const angle = (i / dns.length) * Math.PI * 2 - Math.PI / 2;
        // Deterministic seed from node ID instead of Math.random()
        const seed = ((node.id.charCodeAt(2) * 7 + node.id.charCodeAt(3) * 13) % 100) / 250;
        const r = dns.length === 1 ? 0 : radius * (0.6 + seed);
        const x = center.x + Math.cos(angle) * r;
        const y = center.y + Math.sin(angle) * r;
        nodePositionsRef.current.set(node.id, { x, y, baseX: x, baseY: y });
      });
    });

    const particles: Particle[] = [];
    edges.forEach((_, idx) => {
      const count = Math.floor(edges[idx].weight * 3) + 1;
      for (let i = 0; i < count; i++) {
        particles.push({ edgeIdx: idx, progress: (idx * 0.17 + i * 0.31) % 1, speed: 0.001 + ((idx * 7 + i * 13) % 30) * 0.0001 });
      }
    });
    particlesRef.current = particles;
  }, []);

  // Canvas draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodePositions(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const hb = Math.sin(t * 1.2) * 0.12 + 0.88;

      ctx.fillStyle = 'rgba(8, 10, 18, 0.15)';
      ctx.fillRect(0, 0, w, h);

      nodePositionsRef.current.forEach((pos, id) => {
        const node = nodes.find(n => n.id === id);
        if (!node) return;
        const phase = node.id.charCodeAt(2) * 0.5;
        pos.x = pos.baseX + Math.sin(t * 0.5 + phase) * 5;
        pos.y = pos.baseY + Math.cos(t * 0.4 + phase * 1.3) * 4;
      });

      drawEdges(ctx, overlay, hb, t, nodePositionsRef.current, highlightedPathsRef.current, removedNodeIdRef.current);
      drawParticles(ctx, particlesRef.current, nodePositionsRef.current);
      drawAgentMessages(ctx, agentMessagesRef.current, nodePositionsRef.current);
      drawRipple(ctx, overlay, t, nodePositionsRef.current);
      drawNodes(ctx, overlay, hb, t, nodePositionsRef.current, activeAgentIdRef.current, removedNodeIdRef.current, informedNodesRef.current, spreadActiveRef.current, correctedNodesRef.current);

      // Draw feedback edge highlights
      const now = Date.now();
      feedbackEdgesRef.current.forEach(fe => {
        if (now > fe.expiresAt) return;
        const s = nodePositionsRef.current.get(fe.source);
        const tgt = nodePositionsRef.current.get(fe.target);
        if (!s || !tgt) return;
        const alpha = Math.max(0, (fe.expiresAt - now) / 3000);
        ctx.save();
        if (fe.type === 'useful') {
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.7 * alpha})`;
          ctx.lineWidth = 3;
        } else if (fe.type === 'not-useful') {
          ctx.setLineDash([8, 6]);
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.6 * alpha})`;
          ctx.lineWidth = 2;
        } else {
          ctx.setLineDash([4, 8]);
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.6 * alpha})`;
          ctx.lineWidth = 2;
        }
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.stroke();
        ctx.restore();
      });
      drawDivisionLabels(ctx, w, h);
      drawLegend(ctx, w, h);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [initNodePositions, overlay]);

  // --- R2: Reasoning trace ---
  const runContradictionTrace = useCallback(() => {
    const steps: TraceStep[] = [
      { agent: 'Coordinator', action: 'Received: Nova-Sales sent proposal to Acme Corp at $15/seat', targetNodes: ['a-nova'], confidence: 95, agentColor: AGENT_COLORS.Coordinator },
      { agent: 'Memory', action: 'Retrieving Acme Corp pricing commitments...', targetNodes: ['a-iris'], confidence: 90, agentColor: AGENT_COLORS.Memory },
      { agent: 'Memory', action: 'Found: Sarah Chen quoted $20/seat on Feb 3 (client call)', targetNodes: ['p-sarah'], confidence: 98, agentColor: AGENT_COLORS.Memory },
      { agent: 'Critic', action: 'Validating: $15/seat vs $20/seat — $5/seat delta detected', targetNodes: ['a-nova', 'p-sarah'], confidence: 99, agentColor: AGENT_COLORS.Critic },
      { agent: 'Critic', action: 'CONTRADICTION CONFIRMED — $30K ARR at risk. Root cause: Q3 pricing sheet (deprecated)', targetNodes: ['a-nova'], confidence: 99, agentColor: AGENT_COLORS.Critic },
      { agent: 'Router', action: 'Escalating to Sarah Chen (VP Sales), Tom Bradley, Robert Daniels (CFO)', targetNodes: ['p-sarah', 'p-tom', 'p-robert'], confidence: 95, agentColor: AGENT_COLORS.Router },
      { agent: 'Coordinator', action: 'Nova-Sales trust level → review_required. Alert dispatched.', targetNodes: ['a-nova'], confidence: 100, agentColor: AGENT_COLORS.Coordinator },
    ];

    setTraceSteps(steps);
    setVisibleTraceSteps(0);
    setOverlay({ type: 'trace' });

    const agentNodeMap: Record<string, string> = {
      'Coordinator': 'a-iris', 'Memory': 'a-atlas', 'Critic': 'a-sentinel', 'Router': 'a-nova',
    };
    const messageSequence = [
      { from: 'a-nova', to: 'a-iris', label: 'INGEST', color: AGENT_COLORS.Coordinator },
      { from: 'a-iris', to: 'a-atlas', label: 'QUERY', color: AGENT_COLORS.Memory },
      { from: 'a-atlas', to: 'a-iris', label: 'FOUND', color: AGENT_COLORS.Memory },
      { from: 'a-iris', to: 'a-sentinel', label: 'VALIDATE', color: AGENT_COLORS.Critic },
      { from: 'a-sentinel', to: 'a-iris', label: 'CONFLICT', color: AGENT_COLORS.Critic },
      { from: 'a-iris', to: 'a-nova', label: 'ROUTE', color: AGENT_COLORS.Router },
      { from: 'a-nova', to: 'a-iris', label: 'DONE', color: AGENT_COLORS.Coordinator },
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setVisibleTraceSteps(i + 1);
        setAgentMeshStatus(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(k => next[k] = 'idle');
          next[step.agent] = 'active';
          return next;
        });
        const nodeId = agentNodeMap[step.agent];
        if (nodeId) setActiveAgentId(nodeId);
        if (step.targetNodes.length > 0) setHighlightedPaths([step.targetNodes]);
        if (i < messageSequence.length) {
          const msg = messageSequence[i];
          const newMsg: AgentMessage = { ...msg, progress: 0 };
          setAgentMessages([newMsg]);
          let progress = 0;
          const animInterval = setInterval(() => {
            progress += 0.04;
            if (progress >= 1) { clearInterval(animInterval); setAgentMessages([]); return; }
            setAgentMessages([{ ...msg, progress }]);
          }, 16);
        }
      }, i * 1500);
    });

    setTimeout(() => {
      setAgentMeshStatus({ 'Coordinator': 'idle', 'Memory': 'idle', 'Critic': 'idle', 'Router': 'idle' });
      setActiveAgentId(null);
      setHighlightedPaths([]);
      setAgentMessages([]);
    }, steps.length * 1500 + 2000);
  }, []);

  // --- V2: What-If trigger ---
  const runWhatIf = useCallback(() => {
    if (overlay.type === 'whatif') {
      setOverlay({ type: null });
      setRemovedNodeId(null);
      setOrgRisk(75200);
      return;
    }
    setOverlay({ type: 'whatif' });
    setRemovedNodeId('p-catherine');
  }, [overlay.type]);

  // --- V2: Understanding Spread trigger ---
  const runSpread = useCallback(() => {
    if (overlay.type === 'spread') {
      setOverlay({ type: null });
      setSpreadActive(false);
      setInformedNodes(null);
      setSpreadCount(0);
      return;
    }

    spreadCancelRef.current = false;
    const sourceId = 'p-alex';
    const timings = computeSpreadTimings(sourceId);
    const reachable = timings.filter(t => t.delayMs >= 0);
    const unreachable = timings.filter(t => t.delayMs < 0);

    setOverlay({ type: 'spread' });
    setSpreadActive(true);
    setInformedNodes(new Set([sourceId]));
    setSpreadCount(1);
    setSpreadTotal(nodes.length);
    setSpreadUnreached(unreachable.length);

    const timers: ReturnType<typeof setTimeout>[] = [];
    reachable.forEach(({ nodeId, delayMs }) => {
      timers.push(setTimeout(() => {
        if (spreadCancelRef.current) return;
        setInformedNodes(prev => {
          const next = new Set(prev);
          next.add(nodeId);
          setSpreadCount(next.size);
          return next;
        });
      }, delayMs));
    });

    return () => {
      spreadCancelRef.current = true;
      timers.forEach(clearTimeout);
    };
  }, [overlay.type]);

  // --- V3: Fix Gaps (auto-correction) ---
  const EMAIL_SUBJECTS: Record<string, string> = {
    'p-sophie': 'Urgent: Acme Corp pricing update & Q1 strategy changes',
    'p-omar': 'Action Required: GraphQL migration — shared retry logic',
    'p-wei': 'FYI: APAC launch timeline confirmed + competitive intel',
  };
  const EMAIL_BODIES: Record<string, string> = {
    'p-sophie': 'Hi Sophie,\n\nNexus detected you were not included in today\'s critical updates:\n• Acme Corp pricing conflict ($20 vs $15/seat)\n• Q1 strategy realignment affecting EMEA ops\n\nPlease review the attached briefing.\n\n— NEXUS Auto-Dispatch',
    'p-omar': 'Hi Omar,\n\nNexus detected you were not included in today\'s critical updates:\n• GraphQL migration for Payments (affects shared retry logic)\n• 83% code overlap with your EMEA billing work\n\nPlease sync with Priya Sharma.\n\n— NEXUS Auto-Dispatch',
    'p-wei': 'Hi Wei,\n\nNexus detected you were not included in today\'s critical updates:\n• APAC market-entry timeline finalized for Q2\n• New competitive landscape data from Catherine Moore\n\nPlease review before Monday sync.\n\n— NEXUS Auto-Dispatch',
  };

  const fixGaps = useCallback(() => {
    if (spreadCorrecting) return;
    setSpreadCorrecting(true);
    const unreachedIds = Array.from(SPREAD_SKIP_NODES);
    unreachedIds.forEach((nodeId, i) => {
      setTimeout(() => {
        setShowEmailPreview(nodeId);
      }, i * 2000);
      setTimeout(() => {
        setCorrectedNodes(prev => {
          const next = new Set(prev);
          next.add(nodeId);
          return next;
        });
        setInformedNodes(prev => {
          const next = new Set(prev);
          next.add(nodeId);
          setSpreadCount(next.size);
          return next;
        });
        if (i === unreachedIds.length - 1) {
          setTimeout(() => {
            setShowEmailPreview(null);
            setSpreadCorrecting(false);
            setSpreadUnreached(0);
          }, 1500);
        }
      }, i * 2000 + 1200);
    });
  }, [spreadCorrecting]);

  // --- V3: Feedback handler ---
  const handleFeedback = useCallback((nodeId: string, type: 'useful' | 'not-useful' | 'request-info') => {
    const node = nodes.find(n => n.id === nodeId);
    const name = node?.label.split(' ')[0] || 'Node';

    // Find an edge connecting to this node (preferring CEO)
    const edge = edges.find(e => e.target === nodeId || e.source === nodeId);
    if (edge) {
      setFeedbackEdges(prev => [...prev, {
        source: edge.source,
        target: edge.target,
        type,
        expiresAt: Date.now() + 3000,
      }]);
      // Clean up expired edges after 3.5s
      setTimeout(() => {
        setFeedbackEdges(prev => prev.filter(fe => fe.expiresAt > Date.now()));
      }, 3500);
    }

    const messages: Record<string, string> = {
      'useful': `Nexus noted: ${name} finds current comms valuable. Strengthening this channel.`,
      'not-useful': `Nexus adapting: Rerouting ${name}'s information flow for higher relevance.`,
      'request-info': `Nexus queued: Sending ${name} a targeted knowledge packet.`,
    };
    setFeedbackToast(messages[type]);
    setTimeout(() => setFeedbackToast(null), 3000);
  }, []);

  // --- Proactive toast handler ---
  const handleToastAction = useCallback((action: string) => {
    if (action === 'trace') runContradictionTrace();
    else if (action === 'select-catherine') {
      const catherine = nodes.find(n => n.id === 'p-catherine');
      if (catherine) setSelectedNode(catherine);
    }
    else if (action === 'silo') setOverlay({ type: 'silo' });
  }, [runContradictionTrace]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const node of nodes) {
      const pos = nodePositionsRef.current.get(node.id);
      if (!pos) continue;
      if (Math.sqrt((mx - pos.x) ** 2 + (my - pos.y) ** 2) < 20) {
        setSelectedNode(node);
        return;
      }
    }
    setSelectedNode(null);
  }, []);

  // --- Reset all state ---
  const resetAll = useCallback(() => {
    setOverlay({ type: null });
    setSelectedNode(null);
    setTraceSteps([]); setVisibleTraceSteps(0);
    setHighlightedPaths([]); setAgentMessages([]); setActiveAgentId(null);
    setAgentMeshStatus({ 'Coordinator': 'idle', 'Memory': 'idle', 'Critic': 'idle', 'Router': 'idle' });
    setRemovedNodeId(null);
    setSpreadActive(false); setInformedNodes(null); setSpreadCount(0);
    spreadCancelRef.current = true;
    setSpreadCorrecting(false); setCorrectedNodes(new Set()); setShowEmailPreview(null);
    setFeedbackEdges([]); setFeedbackToast(null);
    setOrgRisk(75200);
  }, []);

  const buttons = [
    { icon: AlertTriangle, label: 'Contradiction', color: 'nexus-red', action: () => { if (overlay.type === 'trace') { setOverlay({ type: null }); setTraceSteps([]); setVisibleTraceSteps(0); } else { runContradictionTrace(); } } },
    { icon: UserMinus, label: 'What If?', color: 'nexus-red', action: runWhatIf },
    { icon: Waves, label: 'Spread', color: 'nexus-cyan', action: runSpread },
    { icon: Clock, label: 'Timeline', color: 'primary', action: () => setOverlay({ type: overlay.type === 'timeline' ? null : 'timeline' }) },
    { icon: Zap, label: 'Briefing', color: 'primary', action: () => setOverlay({ type: overlay.type === 'briefing' ? null : 'briefing' }) },
    { icon: Users, label: 'New Joiner', color: 'nexus-green', action: () => setOverlay({ type: overlay.type === 'onboarding' ? null : 'onboarding' }) },
    { icon: RotateCcw, label: 'Reset', color: 'foreground', action: resetAll },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" onClick={handleCanvasClick} />

      {/* Proactive Toasts */}
      <ProactiveToasts onAction={handleToastAction} suppressRef={overlayActiveRef} />

      {/* Floating Nav Bubble */}
      <div className="absolute top-4 right-4 z-30">
        <motion.button
          onClick={() => setNavOpen(!navOpen)}
          className="w-12 h-12 rounded-full glass-strong flex items-center justify-center text-primary hover:scale-105 transition-transform glow-primary"
          whileTap={{ scale: 0.95 }}
        >
          {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>
        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute top-14 right-0 glass-strong rounded-xl p-2 space-y-1 min-w-[160px]"
            >
              {[
                { icon: Radio, label: 'Overview', path: '/demo', active: true },
                { icon: Activity, label: 'Pulse', path: '/pulse', active: false },
                { icon: Shield, label: 'Alerts', path: '/alerts', active: false },
                { icon: Sparkles, label: 'Ask NEXUS', path: '/ask', active: false },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setNavOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all ${
                    item.active ? 'bg-primary/15 text-primary' : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-mono text-lg font-bold tracking-wider text-foreground">NEXUS</span>
          <span className="text-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Organizational Nervous System</span>
        </div>
        <div className="flex items-center gap-6 text-mono text-xs text-muted-foreground mr-16">
          <span><strong className="text-foreground">24</strong> NODES</span>
          <span><strong className="text-foreground">34</strong> PATHWAYS</span>
          <span><strong className="text-primary">4</strong> AI AGENTS</span>
          {/* V2: Dollar counter */}
          <span className={`transition-colors duration-500 ${orgRisk > 500000 ? 'text-nexus-red' : orgRisk > 100000 ? 'text-nexus-yellow' : 'text-nexus-yellow'}`}>
            <strong className={orgRisk > 500000 ? 'text-nexus-red' : 'text-nexus-yellow'}>{formatDollars(animatedRisk)}</strong> ORG RISK
          </span>
        </div>
      </div>

      {/* Agent Mesh Status Bar */}
      <div className="absolute top-14 left-6 z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-mono text-muted-foreground tracking-wider">AGENT MESH</span>
          {Object.entries(agentMeshStatus).map(([agent, status]) => (
            <div key={agent} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                status === 'active' ? 'bg-primary animate-pulse shadow-[0_0_6px_rgba(78,205,196,0.8)]' : 'bg-muted-foreground/30'
              }`} />
              <span className={`text-[9px] text-mono transition-colors duration-300 ${
                status === 'active' ? 'text-primary' : 'text-muted-foreground/50'
              }`}>{agent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Understanding Spread Counter */}
      <AnimatePresence>
        {spreadActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 inset-x-0 mx-auto w-fit z-10 glass-strong rounded-xl px-5 py-2.5 flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-primary" />
              <span className="text-mono text-xs font-bold text-primary tracking-wider">KNOWLEDGE PROPAGATION</span>
            </div>
            <div className="text-mono text-sm font-bold text-foreground">
              <span className="text-primary">{spreadCount}</span>
              <span className="text-muted-foreground">/{spreadTotal}</span>
              <span className="text-[10px] text-muted-foreground ml-2">INFORMED</span>
            </div>
            {spreadCount >= spreadTotal - spreadUnreached && spreadUnreached > 0 && !spreadCorrecting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <span className="text-[10px] text-mono text-nexus-yellow font-bold">
                  {spreadUnreached} UNREACHED — GAP DETECTED
                </span>
                <button
                  onClick={fixGaps}
                  className="text-[10px] text-mono font-bold bg-nexus-green/20 text-nexus-green px-3 py-1 rounded-full hover:bg-nexus-green/30 transition-colors"
                >
                  Fix Gaps
                </button>
              </motion.div>
            )}
            {spreadCorrecting && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-[10px] text-mono text-nexus-green font-bold"
              >
                AUTO-CORRECTING...
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Preview Panel (auto-correction) */}
      <AnimatePresence>
        {showEmailPreview && (() => {
          const targetNode = nodes.find(n => n.id === showEmailPreview);
          return (
            <motion.div
              key={showEmailPreview}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-32 left-1/2 -translate-x-1/2 w-[420px] glass-strong rounded-2xl p-5 z-20 space-y-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-nexus-green" />
                <span className="text-mono text-[10px] font-bold text-nexus-green tracking-wider">AUTO-DISPATCH EMAIL</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <span className="text-muted-foreground text-mono text-[10px] w-12">To:</span>
                  <span className="text-foreground">{targetNode?.label} &lt;{targetNode?.label.split(' ')[0].toLowerCase()}@meridian.io&gt;</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground text-mono text-[10px] w-12">Subject:</span>
                  <span className="text-foreground font-medium">{EMAIL_SUBJECTS[showEmailPreview] || 'Critical update'}</span>
                </div>
                <div className="h-px bg-muted my-2" />
                <pre className="text-[11px] text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">{EMAIL_BODIES[showEmailPreview] || ''}</pre>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-nexus-green animate-pulse" />
                <span className="text-[9px] text-mono text-nexus-green">Sending...</span>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 glass-strong rounded-xl px-5 py-3 max-w-md"
          >
            <span className="text-xs text-foreground/90">{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Buttons */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className="glass glass-strong rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-mono text-foreground/80 hover:text-foreground transition-all hover:scale-105 active:scale-95"
          >
            <btn.icon className="w-3.5 h-3.5" style={{ color: `hsl(var(--${btn.color}))` }} />
            {btn.label}
          </button>
        ))}
      </div>

      {/* Reasoning Trace Panel */}
      <AnimatePresence>
        {overlay.type === 'trace' && traceSteps.length > 0 && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-20 left-4 w-[380px] glass-strong rounded-2xl p-5 z-20 space-y-3 max-h-[70vh] overflow-y-auto"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-mono text-xs font-bold text-primary tracking-wider">MULTI-AGENT REASONING</span>
            </div>
            {traceSteps.slice(0, visibleTraceSteps).map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-background" style={{ backgroundColor: step.agentColor }}>{i + 1}</div>
                  {i < visibleTraceSteps - 1 && <div className="w-px h-6 mt-1" style={{ backgroundColor: step.agentColor + '40' }} />}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-mono font-bold" style={{ color: step.agentColor }}>{step.agent.toUpperCase()}</span>
                    {step.confidence && <span className="text-[9px] text-mono text-muted-foreground">{step.confidence}%</span>}
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{step.action}</p>
                </div>
              </motion.div>
            ))}
            {visibleTraceSteps < traceSteps.length && (
              <div className="flex items-center gap-2 py-1">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground text-mono">Processing...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contradiction Panel */}
      <AnimatePresence>
        {overlay.type === 'contradiction' && <ContradictionPanel />}
      </AnimatePresence>

      {/* Briefing Panel */}
      <AnimatePresence>
        {overlay.type === 'briefing' && <BriefingPanel active={overlay.type === 'briefing'} onClose={() => setOverlay({ type: null })} />}
      </AnimatePresence>

      {/* What-If Panel */}
      <AnimatePresence>
        {overlay.type === 'whatif' && (
          <WhatIfPanel
            onClose={() => { setOverlay({ type: null }); setRemovedNodeId(null); setOrgRisk(75200); }}
            onRiskChange={setOrgRisk}
          />
        )}
      </AnimatePresence>

      {/* Decision Timeline */}
      <AnimatePresence>
        {overlay.type === 'timeline' && <DecisionTimeline onClose={() => setOverlay({ type: null })} />}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {overlay.type === 'onboarding' && <OnboardingModal onClose={() => setOverlay({ type: null })} />}
      </AnimatePresence>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} onFeedback={handleFeedback} />}
      </AnimatePresence>
    </div>
  );
};

export default DemoView;

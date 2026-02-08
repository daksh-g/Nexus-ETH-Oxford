import { useRef, useEffect, useState, useCallback } from 'react';
import { nodes, edges, DIVISION_COLORS, AGENT_TYPE_COLORS, type NexusNode } from '@/data/mockData';
import { classifyInfoDrop, type InfoDropClassification } from '@/lib/openai';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceMicButton from '@/components/VoiceMicButton';
import { AlertTriangle, ArrowRight, Zap } from 'lucide-react';

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface InfoParticle {
  targetNodeId: string;
  progress: number;
  color: string;
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  fact: 'bg-primary/20 text-primary',
  decision: 'bg-primary/20 text-primary',
  question: 'bg-blue-500/20 text-blue-400',
  escalation: 'bg-orange-500/20 text-orange-400',
  contradiction: 'bg-red-500/20 text-red-400',
};

const TYPE_PARTICLE_COLORS: Record<string, string> = {
  fact: '#4ecdc4',
  decision: '#4ecdc4',
  question: '#3b82f6',
  escalation: '#f97316',
  contradiction: '#ff6b6b',
};

const URGENCY_COLORS: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-nexus-yellow',
  high: 'text-orange-400',
  critical: 'text-nexus-red',
};

const PulseView = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const [selectedNode, setSelectedNode] = useState<NexusNode | null>(null);
  const positionsRef = useRef<Map<string, NodePosition>>(new Map());
  const [infoDrop, setInfoDrop] = useState('');
  const [classifying, setClassifying] = useState(false);
  const [classification, setClassification] = useState<InfoDropClassification | null>(null);
  const [infoParticles, setInfoParticles] = useState<InfoParticle[]>([]);
  const [glowingNodes, setGlowingNodes] = useState<Set<string>>(new Set());
  const infoParticlesRef = useRef<InfoParticle[]>([]);
  const glowingNodesRef = useRef<Set<string>>(new Set());
  infoParticlesRef.current = infoParticles;
  glowingNodesRef.current = glowingNodes;

  // Info Drop widget position for particle origin
  const infoPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = containerRef.current?.clientWidth || 800;
    const h = containerRef.current?.clientHeight || 600;
    const cx = w / 2;
    const cy = h / 2;
    const spread = Math.min(w, h) * 0.3;

    const clusterCenters = {
      HQ: { x: cx, y: cy - spread * 0.6 },
      NA: { x: cx - spread, y: cy + spread * 0.15 },
      EMEA: { x: cx + spread, y: cy + spread * 0.15 },
      APAC: { x: cx, y: cy + spread * 0.8 },
    };

    const divNodes: Record<string, NexusNode[]> = { HQ: [], NA: [], EMEA: [], APAC: [] };
    nodes.forEach(n => divNodes[n.division].push(n));

    Object.entries(divNodes).forEach(([div, dns]) => {
      const center = clusterCenters[div as keyof typeof clusterCenters];
      dns.forEach((node, i) => {
        const angle = (i / dns.length) * Math.PI * 2 - Math.PI / 2;
        const r = spread * 0.3 * (0.6 + Math.random() * 0.4);
        positionsRef.current.set(node.id, {
          x: center.x + Math.cos(angle) * r,
          y: center.y + Math.sin(angle) * r,
          vx: 0,
          vy: 0,
        });
      });
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      time += 0.016;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = 'hsl(228, 47%, 5%)';
      ctx.fillRect(0, 0, w, h);

      const positions = positionsRef.current;
      positions.forEach((pos, id) => {
        const phase = id.charCodeAt(2) * 0.7;
        pos.x += Math.sin(time * 0.3 + phase) * 0.3;
        pos.y += Math.cos(time * 0.25 + phase * 1.2) * 0.3;
      });

      // Draw edges
      edges.forEach(edge => {
        const s = positions.get(edge.source);
        const t = positions.get(edge.target);
        if (!s || !t) return;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);

        if (edge.interactionType === 'human-ai') {
          ctx.strokeStyle = 'rgba(78, 205, 196, 0.15)';
        } else if (edge.interactionType === 'ai-ai') {
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        }
        ctx.lineWidth = 0.5 + edge.weight * 2;
        ctx.stroke();
      });

      // Draw info routing particles
      const currentParticles = infoParticlesRef.current;
      const currentGlowing = glowingNodesRef.current;
      if (currentParticles.length > 0) {
        // Origin: bottom-left corner (Info Drop position)
        const originX = 160;
        const originY = h - 60;

        currentParticles.forEach(p => {
          const targetPos = positions.get(p.targetNodeId);
          if (!targetPos) return;

          const px = originX + (targetPos.x - originX) * p.progress;
          const py = originY + (targetPos.y - originY) * p.progress;

          // Glow trail
          const trailGrad = ctx.createRadialGradient(px, py, 0, px, py, 20);
          trailGrad.addColorStop(0, p.color + 'aa');
          trailGrad.addColorStop(0.5, p.color + '30');
          trailGrad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(px, py, 20, 0, Math.PI * 2);
          ctx.fillStyle = trailGrad;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // White center
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
      }

      // Draw nodes
      nodes.forEach(node => {
        const pos = positions.get(node.id);
        if (!pos) return;

        const isGlowing = currentGlowing.has(node.id);
        const color = node.type === 'agent' ? '#06b6d4' : DIVISION_COLORS[node.division];
        const r = node.type === 'agent' ? 10 : 8 + (node.cognitiveLoad || 50) * 0.03;
        const pulse = Math.sin(time * 2 + node.id.charCodeAt(2)) * 0.15 + 0.85;
        const radius = r * pulse * (isGlowing ? 1.4 : 1);

        // Glow
        const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * (isGlowing ? 5 : 3));
        if (isGlowing) {
          grad.addColorStop(0, color + '60');
          grad.addColorStop(0.5, color + '20');
        } else {
          grad.addColorStop(0, color + '30');
        }
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius * (isGlowing ? 5 : 3), 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        if (node.type === 'agent') {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const px = pos.x + Math.cos(a) * radius;
            const py = pos.y + Math.sin(a) * radius;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = isGlowing ? '#22d3ee' : color;
          ctx.fill();
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = isGlowing ? 2.5 : 1;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          if (isGlowing) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Label
        ctx.font = '9px Inter';
        ctx.fillStyle = isGlowing ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label.split(' ').pop() || '', pos.x, pos.y + radius + 12);
        if (node.role) {
          ctx.font = '7px Inter';
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillText(node.role, pos.x, pos.y + radius + 21);
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const node of nodes) {
      const pos = positionsRef.current.get(node.id);
      if (!pos) continue;
      if (Math.sqrt((mx - pos.x) ** 2 + (my - pos.y) ** 2) < 18) {
        setSelectedNode(node);
        return;
      }
    }
    setSelectedNode(null);
  }, []);

  const handleInfoDrop = async () => {
    if (!infoDrop.trim() || classifying) return;
    const text = infoDrop;
    setInfoDrop('');
    setClassifying(true);
    setClassification(null);

    try {
      const result = await classifyInfoDrop(text);
      setClassification(result);
      setClassifying(false);

      // Animate routing particles
      const particleColor = TYPE_PARTICLE_COLORS[result.type] || '#4ecdc4';
      const targetIds = result.targetNodes.map(n => n.id);

      // Stagger particle launches
      targetIds.forEach((nodeId, i) => {
        setTimeout(() => {
          const newParticle: InfoParticle = {
            targetNodeId: nodeId,
            progress: 0,
            color: particleColor,
          };

          setInfoParticles(prev => [...prev, newParticle]);

          // Animate progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += 0.02;
            if (progress >= 1) {
              clearInterval(interval);
              // Node arrives — glow the target
              setGlowingNodes(prev => {
                const next = new Set(prev);
                next.add(nodeId);
                return next;
              });
              // Remove particle
              setInfoParticles(prev => prev.filter(p => p.targetNodeId !== nodeId || p.progress < 0.99));

              // Stop glowing after 3s
              setTimeout(() => {
                setGlowingNodes(prev => {
                  const next = new Set(prev);
                  next.delete(nodeId);
                  return next;
                });
              }, 3000);
              return;
            }
            setInfoParticles(prev =>
              prev.map(p => p.targetNodeId === nodeId ? { ...p, progress } : p)
            );
          }, 16);
        }, i * 400); // Stagger by 400ms
      });

      // Clear classification after 8s
      setTimeout(() => setClassification(null), 8000);
    } catch {
      setClassifying(false);
      setClassification({
        type: 'fact',
        topic: text.slice(0, 50),
        urgency: 'medium',
        targetNodes: [{ id: 'p-alex', reason: 'Default routing' }],
        reasoning: 'Classification unavailable. Routed to leadership.',
      });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[calc(100vh-3rem)]">
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" onClick={handleCanvasClick} />

      {/* InfoDrop */}
      <div ref={infoPanelRef} className="absolute bottom-4 left-4 w-80 z-10">
        <div className="glass-strong rounded-xl p-3 space-y-2">
          <div className="text-[10px] text-mono text-primary tracking-wider">INFO DROP</div>
          <textarea
            value={infoDrop}
            onChange={e => setInfoDrop(e.target.value)}
            placeholder="Paste any message, email, or update — NEXUS will route it to the right people"
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none"
            rows={3}
            onKeyDown={e => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleInfoDrop();
            }}
          />
          <div className="flex items-center gap-2">
            <VoiceMicButton onTranscript={(text) => setInfoDrop(text)} />
            <button
              onClick={handleInfoDrop}
              disabled={!infoDrop.trim() || classifying}
              className="flex-1 py-1.5 rounded-lg bg-primary/15 text-primary text-[10px] text-mono hover:bg-primary/25 transition-colors disabled:opacity-30"
            >
              {classifying ? 'Classifying...' : 'Route Information'}
            </button>
          </div>

          {/* Pre-written quick-paste buttons */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { label: 'Budget Update', text: 'CFO just approved 15% budget increase for Q2 engineering headcount across all divisions' },
              { label: 'Price Conflict', text: 'Nova-Sales just sent a revised proposal to Acme Corp at $12/seat' },
              { label: 'APAC Delay', text: 'APAC team reports 2-week delay on market entry due to regulatory review' },
            ].map(q => (
              <button
                key={q.label}
                onClick={() => setInfoDrop(q.text)}
                className="px-2 py-1 rounded text-[8px] text-mono text-muted-foreground/70 hover:text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Classification Result Card */}
        <AnimatePresence>
          {classifying && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 glass-strong rounded-xl p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
                <span className="text-[10px] text-mono text-muted-foreground">NEXUS is classifying and routing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {classification && !classifying && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 glass-strong rounded-xl p-3 space-y-2.5"
            >
              {/* Type + Urgency */}
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-2 py-0.5 rounded-full text-mono font-bold uppercase ${TYPE_BADGE_COLORS[classification.type] || 'bg-muted text-muted-foreground'}`}>
                  {classification.type}
                </span>
                <span className={`text-[9px] text-mono ${URGENCY_COLORS[classification.urgency]}`}>
                  {classification.urgency.toUpperCase()} URGENCY
                </span>
                {classification.contradicts && (
                  <AlertTriangle className="w-3 h-3 text-nexus-red" />
                )}
              </div>

              {/* Topic */}
              <div className="text-xs text-foreground/80">{classification.topic}</div>

              {/* Contradiction diff */}
              {classification.contradicts && (
                <div className="rounded-lg border border-nexus-red/30 bg-nexus-red/5 p-2 space-y-1">
                  <div className="text-[9px] text-mono text-nexus-red font-bold">CONTRADICTION DETECTED</div>
                  <div className="text-[10px] text-foreground/60 line-through">{classification.contradicts.existingFact}</div>
                  <div className="flex items-center gap-1">
                    <ArrowRight className="w-2.5 h-2.5 text-nexus-red" />
                    <span className="text-[10px] text-foreground/80 font-semibold">{classification.contradicts.newFact}</span>
                  </div>
                </div>
              )}

              {/* Target nodes */}
              <div className="space-y-1.5">
                <div className="text-[9px] text-mono text-primary tracking-wider">ROUTED TO</div>
                {classification.targetNodes.map(tn => {
                  const node = nodes.find(n => n.id === tn.id);
                  return (
                    <div key={tn.id} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] text-foreground font-semibold">{node?.label || tn.id}</span>
                        {node?.role && <span className="text-[9px] text-muted-foreground ml-1">({node.role})</span>}
                        <p className="text-[9px] text-muted-foreground">{tn.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reasoning */}
              <div className="text-[9px] text-muted-foreground/70 border-t border-border/30 pt-2 italic">
                {classification.reasoning}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Node detail */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-4 right-4 w-[280px] glass-strong rounded-2xl p-4 z-10 space-y-3"
          >
            <button onClick={() => setSelectedNode(null)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-xs">✕</button>
            <h3 className="text-sm font-bold text-foreground">{selectedNode.label}</h3>
            <p className="text-[11px] text-muted-foreground">{selectedNode.role}</p>
            <div className="flex gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full text-mono" style={{ background: DIVISION_COLORS[selectedNode.division] + '20', color: DIVISION_COLORS[selectedNode.division] }}>{selectedNode.division}</span>
              {selectedNode.type === 'agent' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary text-mono">AI</span>}
            </div>
            {selectedNode.cognitiveLoad !== undefined && (
              <div>
                <div className="flex justify-between text-[10px] text-mono mb-1">
                  <span className="text-muted-foreground">Workload</span>
                  <span className={selectedNode.cognitiveLoad > 80 ? 'text-nexus-red' : selectedNode.cognitiveLoad > 60 ? 'text-nexus-yellow' : 'text-primary'}>
                    {selectedNode.cognitiveLoad}% {selectedNode.cognitiveLoad > 80 ? '— OVERLOADED' : ''}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${selectedNode.cognitiveLoad}%`,
                    backgroundColor: selectedNode.cognitiveLoad > 80 ? 'hsl(var(--nexus-red))' : selectedNode.cognitiveLoad > 60 ? 'hsl(var(--nexus-yellow))' : 'hsl(var(--primary))',
                  }} />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PulseView;

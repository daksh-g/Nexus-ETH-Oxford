import { motion } from 'framer-motion';
import { X, Shield, Clock, AlertTriangle, CheckCircle, ArrowUpRight, RefreshCw, FileText } from 'lucide-react';

interface DecisionTimelineProps {
  onClose: () => void;
}

type DecisionType = 'decision' | 'contradiction' | 'resolution' | 'context_update' | 'escalation';

interface Decision {
  version: number;
  date: string;
  type: DecisionType;
  text: string;
  author: string;
  affected: string[];
}

const TYPE_COLORS: Record<DecisionType, { solid: string; bg: string; border: string; line: string }> = {
  decision: {
    solid: 'hsl(var(--primary))',
    bg: 'hsl(var(--primary) / 0.1)',
    border: 'hsl(var(--primary) / 0.2)',
    line: 'hsl(var(--primary) / 0.2)',
  },
  contradiction: {
    solid: 'hsl(var(--nexus-red))',
    bg: 'hsl(var(--nexus-red) / 0.1)',
    border: 'hsl(var(--nexus-red) / 0.2)',
    line: 'hsl(var(--nexus-red) / 0.2)',
  },
  resolution: {
    solid: '#4ade80',
    bg: 'rgba(74, 222, 128, 0.1)',
    border: 'rgba(74, 222, 128, 0.2)',
    line: 'rgba(74, 222, 128, 0.2)',
  },
  context_update: {
    solid: 'hsl(var(--nexus-yellow))',
    bg: 'hsl(var(--nexus-yellow) / 0.1)',
    border: 'hsl(var(--nexus-yellow) / 0.2)',
    line: 'hsl(var(--nexus-yellow) / 0.2)',
  },
  escalation: {
    solid: '#f97316',
    bg: 'rgba(249, 115, 22, 0.1)',
    border: 'rgba(249, 115, 22, 0.2)',
    line: 'rgba(249, 115, 22, 0.2)',
  },
};

const TYPE_LABELS: Record<DecisionType, string> = {
  decision: 'DECISION',
  contradiction: 'CONTRADICTION',
  resolution: 'RESOLUTION',
  context_update: 'CONTEXT UPDATE',
  escalation: 'ESCALATION',
};

const TYPE_ICONS: Record<DecisionType, typeof FileText> = {
  decision: FileText,
  contradiction: AlertTriangle,
  resolution: CheckCircle,
  context_update: RefreshCw,
  escalation: ArrowUpRight,
};

const decisions: Decision[] = [
  { version: 12, date: 'Feb 7 10:30', type: 'contradiction', text: 'CONTRADICTION: Nova-Sales sent $15/seat to Acme (conflicts v8)', author: 'NEXUS Auto-Detect', affected: ['p-sarah', 'a-nova', 'p-tom'] },
  { version: 11, date: 'Feb 7 09:00', type: 'context_update', text: 'Atlas-Code context refresh scheduled for GraphQL migration', author: 'Marcus Rivera', affected: ['a-atlas', 'p-priya'] },
  { version: 10, date: 'Feb 5 14:00', type: 'escalation', text: 'Nova-Sales trust level downgraded to review_required', author: 'Sarah Chen', affected: ['a-nova'] },
  { version: 9, date: 'Feb 5 11:00', type: 'resolution', text: 'Q1 hiring plan approved for EMEA (+3 engineers)', author: 'Catherine Moore', affected: ['p-henrik', 'p-elena'] },
  { version: 8, date: 'Feb 3 16:00', type: 'decision', text: 'Enterprise pricing confirmed: $20/seat for Acme Corp', author: 'Sarah Chen', affected: ['p-sarah', 'p-tom', 'a-nova'] },
  { version: 7, date: 'Feb 3 10:00', type: 'decision', text: 'APAC market entry timeline finalized: Q2 launch', author: 'Catherine Moore', affected: ['p-yuki', 'p-wei'] },
  { version: 6, date: 'Feb 1 15:00', type: 'decision', text: 'Billing API migration from REST v3 to GraphQL approved', author: 'Marcus Rivera', affected: ['p-priya', 'p-james', 'a-atlas'] },
  { version: 5, date: 'Jan 28 09:00', type: 'context_update', text: 'APAC regulatory review initiated', author: 'Yuki Tanaka', affected: ['p-yuki'] },
  { version: 4, date: 'Jan 20 11:00', type: 'decision', text: 'EMEA headcount expanded by 3 engineers', author: 'Henrik Johansson', affected: ['p-henrik', 'p-omar'] },
  { version: 3, date: 'Jan 15 14:00', type: 'decision', text: 'Unified data platform migration approved', author: 'Alex Reeves', affected: ['p-marcus', 'p-henrik'] },
  { version: 2, date: 'Jan 10 10:00', type: 'resolution', text: 'Q4 objectives review completed', author: 'Alex Reeves', affected: ['p-alex', 'p-catherine'] },
  { version: 1, date: 'Jan 5 09:00', type: 'decision', text: 'Meridian Technologies 2026 strategy approved', author: 'Alex Reeves', affected: ['p-alex'] },
];

const DecisionTimeline = ({ onClose }: DecisionTimelineProps) => {
  return (
    <motion.div
      initial={{ x: -420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -420, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute top-20 left-4 w-[380px] glass-strong rounded-2xl p-5 z-20 max-h-[70vh] overflow-y-auto"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-xs transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Truth Snapshot Card */}
      <div className="glass rounded-lg p-4 mb-5 nexus-border-glow">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-mono text-[10px] font-bold text-primary tracking-wider">TRUTH SNAPSHOT</span>
        </div>
        <p className="text-xs text-foreground/90 font-medium mb-2">
          Organizational Truth v12 — Last updated 3h ago
        </p>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground text-mono">
            4 active alerts · 2 pending resolutions · 12 decisions this week
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/25">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-mono font-bold text-primary">94% alignment</span>
        </div>
      </div>

      {/* Timeline header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-mono text-xs font-bold text-foreground tracking-wider">DECISION TIMELINE</span>
      </div>

      {/* Timeline entries */}
      <div className="space-y-0">
        {decisions.map((decision, i) => {
          const colors = TYPE_COLORS[decision.type];
          const label = TYPE_LABELS[decision.type];
          const Icon = TYPE_ICONS[decision.type];

          return (
            <motion.div
              key={decision.version}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex gap-3 items-start"
            >
              {/* Version circle + connector */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
                  style={{
                    borderColor: colors.solid,
                    color: colors.solid,
                    backgroundColor: colors.bg,
                  }}
                >
                  {decision.version}
                </div>
                {i < decisions.length - 1 && (
                  <div
                    className="w-px flex-1 min-h-[24px]"
                    style={{ backgroundColor: colors.line }}
                  />
                )}
              </div>

              {/* Entry content card */}
              <div className="flex-1 pb-4">
                <div className="glass rounded-lg p-3 border" style={{ borderColor: colors.border }}>
                  {/* Type badge + date */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3" style={{ color: colors.solid }} />
                      <span
                        className="text-[9px] text-mono font-bold tracking-wider"
                        style={{ color: colors.solid }}
                      >
                        {label}
                      </span>
                    </div>
                    <span className="text-[10px] text-mono text-muted-foreground">
                      {decision.date}
                    </span>
                  </div>

                  {/* Decision text */}
                  <p className="text-xs text-foreground/80 leading-relaxed mb-1.5">
                    {decision.text}
                  </p>

                  {/* Contradiction diff indicator */}
                  {decision.type === 'contradiction' && (
                    <div className="rounded px-2 py-1.5 mb-1.5" style={{ backgroundColor: 'hsl(var(--nexus-red) / 0.08)' }}>
                      <span className="text-[10px] text-mono text-foreground/70">
                        Pricing: <span className="line-through text-foreground/40">$15/seat</span>
                        <span className="text-foreground/50 mx-1">{'->'}</span>
                        <span style={{ color: 'hsl(var(--nexus-red))' }} className="font-bold">$20/seat</span>
                      </span>
                    </div>
                  )}

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      by <span className="text-foreground/60">{decision.author}</span>
                    </span>
                    <span className="text-[9px] text-mono text-muted-foreground/60">
                      {decision.affected.length} affected
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DecisionTimeline;

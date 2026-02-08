import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserMinus, AlertTriangle, TrendingUp, Shield } from 'lucide-react';

interface WhatIfPanelProps {
  onClose: () => void;
  onRiskChange: (amount: number) => void;
}

interface CascadeItem {
  label: string;
  detail: string;
  severity: 'critical' | 'warning' | 'info';
}

const CASCADE_DATA: CascadeItem[] = [
  { label: '6 workstreams stalled', detail: 'Strategic pricing, APAC market entry, Q1 board prep, EMEA expansion, unified data platform, AI governance', severity: 'critical' },
  { label: '3 divisions lose coordination', detail: 'HQ, NA, and EMEA — she bridges all three as the only cross-division executive below CEO', severity: 'critical' },
  { label: 'Sarah Chen → 95% load', detail: 'Inherits Acme pricing resolution + client portfolio oversight. Was already at 78%.', severity: 'warning' },
  { label: 'Marcus Rivera → 88% load', detail: 'Takes on strategic technical decisions previously escalated to CSO. Was at 75%.', severity: 'warning' },
  { label: 'Nova-Sales loses oversight', detail: 'Already at review_required trust level. No human supervisor for automated proposals.', severity: 'critical' },
  { label: 'APAC launch delayed 2 quarters', detail: 'Yuki Tanaka has no executive sponsor for regulatory approval. $1.8M revenue delay.', severity: 'warning' },
];

const RECOVERY_SUGGESTIONS = [
  { person: 'Sarah Chen', action: 'Takes client-facing strategic decisions', load: '78% → 95%' },
  { person: 'Alex Reeves (CEO)', action: 'Direct oversight of cross-division coordination', load: '+15% capacity' },
  { person: 'Yuki Tanaka', action: 'Interim APAC executive sponsor (promote)', load: '45% → 70%' },
];

const SEVERITY_COLORS = {
  critical: 'border-red-500/30 bg-red-500/5',
  warning: 'border-orange-500/30 bg-orange-500/5',
  info: 'border-primary/30 bg-primary/5',
};

const WhatIfPanel = ({ onClose, onRiskChange }: WhatIfPanelProps) => {
  const [visibleItems, setVisibleItems] = useState(0);
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    CASCADE_DATA.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleItems(i + 1), (i + 1) * 400));
    });
    timers.push(setTimeout(() => setShowRecovery(true), CASCADE_DATA.length * 400 + 600));

    // Animate risk counter
    timers.push(setTimeout(() => onRiskChange(420000), 200));
    timers.push(setTimeout(() => onRiskChange(1200000), 800));
    timers.push(setTimeout(() => onRiskChange(2400000), 1600));

    return () => timers.forEach(clearTimeout);
  }, [onRiskChange]);

  return (
    <motion.div
      initial={{ x: -420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -420, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute top-20 left-4 w-[400px] glass-strong rounded-2xl p-5 z-20 max-h-[75vh] overflow-y-auto"
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-xs">
        ✕
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <UserMinus className="w-4 h-4 text-nexus-red" />
        <span className="text-mono text-[10px] font-bold text-nexus-red tracking-wider">WHAT-IF SIMULATION</span>
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">Catherine Moore (CSO) Departs</h3>
      <p className="text-[11px] text-muted-foreground mb-4">Simulating organizational impact of losing a key executive...</p>

      {/* Impact summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="glass rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-nexus-red text-mono">$2.4M</div>
          <div className="text-[9px] text-muted-foreground">Revenue at risk</div>
        </div>
        <div className="glass rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-orange-400 text-mono">6</div>
          <div className="text-[9px] text-muted-foreground">Stalled workstreams</div>
        </div>
        <div className="glass rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-nexus-yellow text-mono">3</div>
          <div className="text-[9px] text-muted-foreground">Divisions affected</div>
        </div>
      </div>

      {/* Cascade items */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-3 h-3 text-nexus-red" />
          <span className="text-mono text-[10px] font-bold text-foreground tracking-wider">CASCADE ANALYSIS</span>
        </div>
        {CASCADE_DATA.slice(0, visibleItems).map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className={`rounded-lg border p-2.5 ${SEVERITY_COLORS[item.severity]}`}
          >
            <div className="text-xs font-semibold text-foreground/90">{item.label}</div>
            <div className="text-[10px] text-foreground/60 mt-0.5">{item.detail}</div>
          </motion.div>
        ))}
        {visibleItems < CASCADE_DATA.length && (
          <div className="flex items-center gap-2 py-1">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-nexus-red/60 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground text-mono">Analyzing cascade...</span>
          </div>
        )}
      </div>

      {/* Recovery suggestions */}
      {showRecovery && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-mono text-[10px] font-bold text-primary tracking-wider">RECOVERY PLAN</span>
          </div>
          {RECOVERY_SUGGESTIONS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-2.5 mb-2">
              <div className="flex-1">
                <div className="text-xs font-semibold text-foreground/90">{s.person}</div>
                <div className="text-[10px] text-foreground/60">{s.action}</div>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-nexus-yellow" />
                <span className="text-[9px] text-mono text-nexus-yellow">{s.load}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default WhatIfPanel;

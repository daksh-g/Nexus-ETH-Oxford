import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const ContradictionPanel = () => (
  <motion.div
    initial={{ x: -400, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -400, opacity: 0 }}
    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    className="absolute top-20 left-4 w-[360px] glass-strong rounded-2xl p-5 z-20 space-y-4"
  >
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-nexus-red animate-pulse-glow" />
      <span className="text-mono text-xs font-bold text-nexus-red tracking-wider">CONTRADICTION DETECTED</span>
    </div>
    <h3 className="text-sm font-semibold text-foreground">Conflicting Pricing Sent to Acme Corp</h3>
    <div className="space-y-3">
      <div className="rounded-lg border border-nexus-red/30 bg-nexus-red/5 p-3">
        <div className="text-[10px] text-mono text-nexus-red mb-1">HUMAN — Sarah Chen</div>
        <p className="text-xs text-foreground/80">VP Sarah Chen verbally committed $20/seat to Acme Corp (500 seats, $120K ARR)</p>
        <p className="text-[10px] text-muted-foreground mt-1">Source: Client Call, Feb 3</p>
      </div>
      <div className="flex justify-center">
        <Zap className="w-4 h-4 text-nexus-yellow" />
      </div>
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="text-[10px] text-mono text-primary mb-1">AI AGENT — Nova-Sales</div>
        <p className="text-xs text-foreground/80">Nova-Sales sent automated proposal at $15/seat using outdated Q3 pricing sheet</p>
        <p className="text-[10px] text-muted-foreground mt-1">Source: Auto-Proposal, Feb 7 09:30</p>
      </div>
    </div>
    <div className="space-y-2">
      <div className="text-[10px] text-mono text-nexus-red">DOWNSTREAM IMPACT</div>
      {['Acme Corp enterprise deal ($120K ARR)', 'SEC quarterly filing accuracy', 'Nova-Sales pricing database audit'].map(item => (
        <div key={item} className="text-xs text-foreground/70 border-l-2 border-nexus-red/40 pl-3">{item}</div>
      ))}
    </div>
    <div className="text-xs text-foreground/60 border-t border-border pt-3">
      <strong className="text-foreground/80">Resolution:</strong> Sarah Chen must contact Acme Corp to confirm $20/seat
    </div>
  </motion.div>
);

export default ContradictionPanel;

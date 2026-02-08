import { useState } from 'react';
import { alerts, AGENT_TYPE_COLORS, type NexusAlert } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, CheckCircle2, ExternalLink, Globe, MapPin } from 'lucide-react';

const FILTER_TABS = ['All', 'Contradictions', 'Staleness', 'Silos', 'Overload', 'Drift', 'Coordination', 'Resolved'] as const;

const agentTypeFromFilter = (filter: string): string | null => {
  const map: Record<string, string> = {
    Contradictions: 'contradiction',
    Staleness: 'staleness',
    Silos: 'silo',
    Overload: 'overload',
    Drift: 'drift',
    Coordination: 'coordination',
  };
  return map[filter] || null;
};

const AlertsView = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const filteredAlerts = alerts.filter(a => {
    const isResolved = resolvedIds.has(a.id);
    if (activeFilter === 'Resolved') return isResolved;
    if (activeFilter === 'All') return !isResolved;
    return !isResolved && a.agentType === agentTypeFromFilter(activeFilter);
  });

  const resolveAlert = (id: string) => {
    setResolvedIds(prev => new Set([...prev, id]));
    setExpandedId(null);
  };

  return (
    <div className="min-h-screen p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-mono text-foreground">Immune System</h1>
          <p className="text-xs text-muted-foreground">
            {alerts.length - resolvedIds.size} active alerts across the organization
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs text-mono transition-all ${
              activeFilter === tab
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              expanded={expandedId === alert.id}
              onToggle={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
              onResolve={() => resolveAlert(alert.id)}
            />
          ))}
        </AnimatePresence>
        {filteredAlerts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {activeFilter === 'Resolved' ? 'No resolved alerts yet' : 'No active alerts in this category'}
          </div>
        )}
      </div>
    </div>
  );
};

const AlertCard = ({
  alert,
  expanded,
  onToggle,
  onResolve,
}: {
  alert: NexusAlert;
  expanded: boolean;
  onToggle: () => void;
  onResolve: () => void;
}) => {
  const agentColor = AGENT_TYPE_COLORS[alert.agentType];
  const sevDot = alert.severity === 'critical' ? 'bg-nexus-red' : alert.severity === 'warning' ? 'bg-nexus-yellow' : 'bg-primary';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass rounded-xl overflow-hidden"
    >
      <button onClick={onToggle} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <div className={`w-2 h-2 rounded-full ${sevDot} shrink-0`} />

        <span
          className="text-[10px] px-2 py-0.5 rounded-md text-mono font-medium shrink-0"
          style={{ background: agentColor + '20', color: agentColor }}
        >
          {alert.agentType}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {alert.scope === 'Cross-division' ? <Globe className="w-3 h-3 text-muted-foreground" /> : <MapPin className="w-3 h-3 text-muted-foreground" />}
          <span className="text-[10px] text-muted-foreground text-mono">{alert.scope}</span>
        </div>

        <span className="text-xs text-foreground/90 flex-1 truncate">{alert.headline}</span>

        <span className="text-[10px] text-muted-foreground text-mono shrink-0">{alert.timestamp}</span>

        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-3">
              <p className="text-xs text-foreground/70 leading-relaxed">{alert.detail}</p>

              {alert.affectedNodes.length > 0 && (
                <div>
                  <div className="text-[10px] text-mono text-muted-foreground mb-1.5">AFFECTED NODES</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {alert.affectedNodes.map(n => (
                      <span key={n} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-foreground/70 text-mono">{n}</span>
                    ))}
                  </div>
                </div>
              )}

              {alert.estimatedCost && (
                <div className="inline-block text-[10px] text-mono px-2.5 py-1 rounded-md bg-nexus-orange/10 text-nexus-orange border border-nexus-orange/20">
                  {alert.estimatedCost}
                </div>
              )}

              {alert.resolution && (
                <div>
                  <div className="text-[10px] text-mono text-muted-foreground mb-1">RESOLUTION</div>
                  <p className="text-xs text-foreground/80">
                    <strong className="text-foreground/90">{alert.authority}</strong> — {alert.resolution}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onResolve(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nexus-green/10 text-nexus-green text-xs text-mono border border-nexus-green/20 hover:border-nexus-green/40 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Resolve
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs text-mono border border-primary/20 hover:border-primary/40 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  Trace Decision Chain
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AlertsView;

import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { DIVISION_COLORS, TASKS_BY_NODE, type NexusNode } from '@/data/mockData';

interface NodeDetailPanelProps {
  node: NexusNode;
  onClose: () => void;
  onFeedback?: (nodeId: string, type: 'useful' | 'not-useful' | 'request-info') => void;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-primary/20', text: 'text-primary', label: 'ACTIVE' },
  blocked: { bg: 'bg-nexus-red/20', text: 'text-nexus-red', label: 'BLOCKED' },
  done: { bg: 'bg-nexus-green/20', text: 'text-nexus-green', label: 'DONE' },
};

const NodeDetailPanel = ({ node, onClose, onFeedback }: NodeDetailPanelProps) => {
  const tasks = TASKS_BY_NODE[node.id] || [];

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute top-20 right-4 w-[300px] glass-strong rounded-2xl p-5 z-20 space-y-4 max-h-[75vh] overflow-y-auto"
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-xs">✕</button>
      <div>
        <h3 className="text-sm font-bold text-foreground">{node.label}</h3>
        <p className="text-xs text-muted-foreground">{node.role}</p>
      </div>
      <div className="flex gap-2">
        <span className="text-[10px] px-2 py-0.5 rounded-full text-mono" style={{ background: DIVISION_COLORS[node.division] + '20', color: DIVISION_COLORS[node.division] }}>
          {node.division}
        </span>
        {node.type === 'agent' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary text-mono">AI Agent</span>
        )}
      </div>
      {node.cognitiveLoad !== undefined && (
        <div>
          <div className="flex justify-between text-[10px] text-mono mb-1">
            <span className="text-muted-foreground">Workload</span>
            <span className={node.cognitiveLoad > 80 ? 'text-nexus-red' : node.cognitiveLoad > 60 ? 'text-nexus-yellow' : 'text-primary'}>
              {node.cognitiveLoad}% {node.cognitiveLoad > 80 ? '— OVERLOADED' : node.cognitiveLoad > 60 ? '— elevated' : ''}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${node.cognitiveLoad}%`,
                backgroundColor: node.cognitiveLoad > 80 ? 'hsl(var(--nexus-red))' : node.cognitiveLoad > 60 ? 'hsl(var(--nexus-yellow))' : 'hsl(var(--primary))',
              }}
            />
          </div>
        </div>
      )}
      {node.trustLevel && (
        <div className="text-xs">
          <span className="text-muted-foreground text-mono text-[10px]">Trust Level: </span>
          <span className={`text-mono text-[10px] ${node.trustLevel === 'autonomous' ? 'text-nexus-green' : node.trustLevel === 'supervised' ? 'text-nexus-yellow' : 'text-nexus-red'}`}>
            {node.trustLevel === 'autonomous' ? 'Autonomous — full independence' :
             node.trustLevel === 'supervised' ? 'Supervised — periodic review' :
             'Review Required — all actions need approval'}
          </span>
        </div>
      )}

      {/* Active Workstreams */}
      {tasks.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-muted" />
            <span className="text-[9px] text-mono text-muted-foreground tracking-wider">ACTIVE WORKSTREAMS</span>
            <div className="h-px flex-1 bg-muted" />
          </div>
          {tasks.map(task => {
            const badge = STATUS_BADGE[task.status];
            return (
              <div key={task.id} className="rounded-lg bg-muted/30 px-3 py-2 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] text-foreground/90 leading-tight">{task.title}</span>
                  <span className={`text-[8px] text-mono px-1.5 py-0.5 rounded-full whitespace-nowrap ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                {task.progress !== undefined && (
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${task.progress}%`,
                        backgroundColor: task.status === 'blocked' ? 'hsl(var(--nexus-red))' : 'hsl(var(--primary))',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Communication Feedback */}
      {node.type === 'person' && onFeedback && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-muted" />
            <span className="text-[9px] text-mono text-muted-foreground tracking-wider">COMMUNICATION FEEDBACK</span>
            <div className="h-px flex-1 bg-muted" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onFeedback(node.id, 'useful')}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] text-mono bg-nexus-green/10 text-nexus-green hover:bg-nexus-green/20 transition-colors"
            >
              <ThumbsUp className="w-3 h-3" /> Useful
            </button>
            <button
              onClick={() => onFeedback(node.id, 'not-useful')}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] text-mono bg-nexus-red/10 text-nexus-red hover:bg-nexus-red/20 transition-colors"
            >
              <ThumbsDown className="w-3 h-3" /> Not Useful
            </button>
            <button
              onClick={() => onFeedback(node.id, 'request-info')}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] text-mono bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            >
              <MessageSquare className="w-3 h-3" /> Need More
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NodeDetailPanel;

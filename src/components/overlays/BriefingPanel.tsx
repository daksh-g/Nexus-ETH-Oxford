import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ThumbsUp, ThumbsDown, CheckCircle, ArrowLeft } from 'lucide-react';

interface BriefingPanelProps {
  active: boolean;
  onClose?: () => void;
}

const FULL_TEXT = `Three things need your attention.\n\nFirst — a critical contradiction. Sarah Chen quoted Acme Corp $20 per seat, but Nova-Sales sent them $15 per seat three hours later using an outdated pricing sheet. The customer now has two conflicting proposals. $30K in annual revenue at stake.\n\nSecond — a knowledge silo. NA Payments and EMEA Billing both independently built retry logic for failed transactions. 83% code overlap, zero communication between the teams. That's roughly $45K in duplicated engineering effort.\n\nThird — strategic drift. Atlas-Code is still generating REST v3 code, but the Payments team switched to GraphQL two days ago. Every commit Atlas-Code makes is technical debt.`;

const FEEDBACK_REASONS = [
  { id: 'not-relevant', label: 'Not relevant to my role', description: 'These updates don\'t affect my work' },
  { id: 'too-detailed', label: 'Too much detail', description: 'I need a shorter summary' },
  { id: 'not-enough', label: 'Not enough context', description: 'I need deeper analysis or data' },
  { id: 'already-knew', label: 'Already knew this', description: 'No new information for me' },
  { id: 'wrong-priority', label: 'Wrong priority order', description: 'The most important item isn\'t first' },
  { id: 'missing-info', label: 'Missing something critical', description: 'A key issue was left out' },
];

const BriefingPanel = ({ active, onClose }: BriefingPanelProps) => {
  const [text, setText] = useState('');
  const [complete, setComplete] = useState(false);
  const [view, setView] = useState<'briefing' | 'feedback' | 'submitted'>('briefing');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  useEffect(() => {
    if (!active) { setText(''); setComplete(false); setView('briefing'); setSelectedReason(null); return; }
    let i = 0;
    const interval = setInterval(() => {
      i += 2;
      setText(FULL_TEXT.slice(0, i));
      if (i >= FULL_TEXT.length) { clearInterval(interval); setComplete(true); }
    }, 18);
    return () => clearInterval(interval);
  }, [active]);

  const handleUseful = () => {
    onClose?.();
  };

  const handleNotUseful = () => {
    setView('feedback');
  };

  const handleSubmitFeedback = () => {
    setView('submitted');
    setTimeout(() => {
      onClose?.();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute top-20 right-4 w-[380px] glass-strong rounded-2xl p-5 z-20"
    >
      <AnimatePresence mode="wait">
        {/* === Main Briefing View === */}
        {view === 'briefing' && (
          <motion.div
            key="briefing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-mono text-xs font-bold text-foreground tracking-wider">What changed today?</span>
            </div>
            <div className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line min-h-[200px]">
              {text}
              {!complete && <span className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 animate-pulse" />}
            </div>
            {complete && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex gap-2">
                  <button className="flex-1 glass rounded-lg px-3 py-2 text-[10px] text-mono text-nexus-red border border-nexus-red/20 hover:border-nexus-red/40 transition-colors">
                    Resolve Contradiction →
                  </button>
                  <button className="flex-1 glass rounded-lg px-3 py-2 text-[10px] text-mono text-primary border border-primary/20 hover:border-primary/40 transition-colors">
                    Update Atlas-Code →
                  </button>
                </div>

                {/* Feedback row */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-px flex-1 bg-muted" />
                  <span className="text-[9px] text-mono text-muted-foreground tracking-wider">WAS THIS USEFUL?</span>
                  <div className="h-px flex-1 bg-muted" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUseful}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[10px] text-mono bg-nexus-green/10 text-nexus-green border border-nexus-green/20 hover:bg-nexus-green/20 hover:border-nexus-green/40 transition-all active:scale-95"
                  >
                    <ThumbsUp className="w-3 h-3" /> Useful
                  </button>
                  <button
                    onClick={handleNotUseful}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[10px] text-mono bg-nexus-red/10 text-nexus-red border border-nexus-red/20 hover:bg-nexus-red/20 hover:border-nexus-red/40 transition-all active:scale-95"
                  >
                    <ThumbsDown className="w-3 h-3" /> Not Useful
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* === Feedback Reason View === */}
        {view === 'feedback' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setView('briefing'); setSelectedReason(null); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <ThumbsDown className="w-4 h-4 text-nexus-red" />
              <span className="text-mono text-xs font-bold text-foreground tracking-wider">What could be better?</span>
            </div>

            <p className="text-[10px] text-muted-foreground">
              Help NEXUS adapt. Select the reason that best describes why this briefing wasn't useful for you.
            </p>

            <div className="space-y-1.5">
              {FEEDBACK_REASONS.map(reason => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`w-full text-left rounded-lg px-3.5 py-2.5 transition-all ${
                    selectedReason === reason.id
                      ? 'bg-primary/15 border border-primary/40 ring-1 ring-primary/20'
                      : 'bg-muted/30 border border-transparent hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedReason === reason.id ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    }`}>
                      {selectedReason === reason.id && (
                        <div className="w-1 h-1 rounded-full bg-background" />
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-foreground">{reason.label}</div>
                      <div className="text-[9px] text-muted-foreground">{reason.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmitFeedback}
              disabled={!selectedReason}
              className={`w-full rounded-lg py-2.5 text-[10px] text-mono font-bold transition-all ${
                selectedReason
                  ? 'bg-primary text-background hover:bg-primary/90 active:scale-[0.98]'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Submit Feedback
            </button>
          </motion.div>
        )}

        {/* === Submitted Confirmation View === */}
        {view === 'submitted' && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="flex flex-col items-center justify-center py-10 space-y-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
            >
              <CheckCircle className="w-10 h-10 text-nexus-green" />
            </motion.div>
            <span className="text-mono text-xs font-bold text-foreground tracking-wider">Feedback Received</span>
            <p className="text-[10px] text-muted-foreground text-center max-w-[240px]">
              NEXUS will adapt future briefings to better match your preferences.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BriefingPanel;

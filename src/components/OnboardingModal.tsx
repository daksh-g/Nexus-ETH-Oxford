import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { generateJoinerBrief, type JoinerBrief } from '@/lib/openai';

interface OnboardingModalProps {
  onClose: () => void;
}

const OnboardingModal = ({ onClose }: OnboardingModalProps) => {
  const [step, setStep] = useState(0);
  const [joinerInfo, setJoinerInfo] = useState({
    name: 'Jordan Mitchell',
    role: 'Senior Software Engineer',
    team: 'NA Engineering',
    focus: 'Backend API development, payments integration, and cross-team collaboration with EMEA Engineering on the unified data platform migration.',
  });
  const [brief, setBrief] = useState<JoinerBrief | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-generate brief in background while user fills form
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (joinerInfo.name && joinerInfo.role && joinerInfo.team) {
        try {
          const result = await generateJoinerBrief(joinerInfo);
          if (!cancelled) setBrief(result);
        } catch { /* will use fallback */ }
      }
    }, 2000); // Wait 2s after last form change
    return () => { cancelled = true; clearTimeout(timer); };
  }, [joinerInfo]);

  const handleNext = async () => {
    if (step === 0 && !brief) {
      setLoading(true);
      try {
        const result = await generateJoinerBrief(joinerInfo);
        setBrief(result);
      } catch { /* fallback handled in generateJoinerBrief */ }
      setLoading(false);
    }
    setStep(step + 1);
  };

  const formStep = {
    title: 'Tell Us About Yourself',
    content: (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          NEXUS will use this context to personalize your onboarding and surface the most relevant information for your role.
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-mono text-primary tracking-wider">FULL NAME</label>
            <input
              type="text"
              value={joinerInfo.name}
              onChange={(e) => setJoinerInfo({ ...joinerInfo, name: e.target.value })}
              className="w-full glass rounded-lg px-3 py-2 text-xs text-foreground bg-transparent border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-mono text-primary tracking-wider">ROLE / TITLE</label>
            <input
              type="text"
              value={joinerInfo.role}
              onChange={(e) => setJoinerInfo({ ...joinerInfo, role: e.target.value })}
              className="w-full glass rounded-lg px-3 py-2 text-xs text-foreground bg-transparent border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
              placeholder="Your role"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-mono text-primary tracking-wider">TEAM / DIVISION</label>
            <input
              type="text"
              value={joinerInfo.team}
              onChange={(e) => setJoinerInfo({ ...joinerInfo, team: e.target.value })}
              className="w-full glass rounded-lg px-3 py-2 text-xs text-foreground bg-transparent border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
              placeholder="Your team"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-mono text-primary tracking-wider">FOCUS AREAS</label>
            <textarea
              value={joinerInfo.focus}
              onChange={(e) => setJoinerInfo({ ...joinerInfo, focus: e.target.value })}
              className="w-full glass rounded-lg px-3 py-2 text-xs text-foreground bg-transparent border border-border/50 focus:border-primary/50 focus:outline-none transition-colors resize-none"
              rows={3}
              placeholder="What will you be working on?"
            />
          </div>
        </div>
      </div>
    ),
  };

  const loadingStep = {
    title: 'Analyzing Your Context...',
    content: (
      <div className="flex flex-col items-center justify-center min-h-[220px] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-t-primary animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs text-foreground/80 text-mono">NEXUS is analyzing your organizational context</p>
          <p className="text-[10px] text-muted-foreground">Scanning knowledge graph, decisions, and dependencies...</p>
        </div>
      </div>
    ),
  };

  const b = brief; // shorthand

  const dynamicSteps = b ? [
    {
      title: 'The World You\'re Joining',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-foreground/80 leading-relaxed">{b.teamContext}</p>
          <div className="grid grid-cols-3 gap-3">
            {b.stats.map(s => (
              <div key={s.label} className="glass rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-primary text-mono">{s.value}</div>
                <div className="text-[9px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '5 Decisions That Shape Your Work',
      content: (
        <div className="space-y-3">
          {b.decisions.map(d => (
            <div key={d.date} className="flex gap-3 items-start">
              <span className="text-[10px] text-mono text-primary whitespace-nowrap mt-0.5">{d.date}</span>
              <div className="w-px h-full bg-border" />
              <p className="text-xs text-foreground/80">{d.text}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'People & AI You Need to Know',
      content: (
        <div className="grid grid-cols-2 gap-2">
          {b.people.map(p => (
            <div key={p.name} className="glass rounded-lg p-2.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold text-foreground">{p.name}</span>
                {p.ai && <span className="text-[8px] px-1 py-0.5 rounded bg-primary/20 text-primary text-mono">AI</span>}
              </div>
              <div className="text-[9px] text-muted-foreground">{p.role}</div>
              <div className="text-[9px] text-primary/80 mt-1">{p.note}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Open Tensions',
      content: (
        <div className="space-y-3">
          {b.tensions.map(a => {
            const color = a.severity === 'Critical' ? 'nexus-red' : a.severity === 'Warning' ? 'nexus-yellow' : 'muted-foreground';
            return (
              <div key={a.text} className="rounded-lg border p-3" style={{ borderColor: `hsl(var(--${color}) / 0.3)` }}>
                <div className="text-[10px] text-mono font-bold mb-1" style={{ color: `hsl(var(--${color}))` }}>{a.severity}</div>
                <p className="text-xs text-foreground/80">{a.text}</p>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: `Welcome, ${joinerInfo.name.split(' ')[0]}!`,
      content: (
        <div className="space-y-3">
          <p className="text-xs text-foreground/80 leading-relaxed">
            As <strong>{joinerInfo.role}</strong> on the <strong>{joinerInfo.team}</strong> team, here's what's expected of you:
          </p>
          {b.priorities.map((obj, i) => (
            <div key={i} className="glass rounded-lg p-3">
              <p className="text-xs text-foreground/80">{obj}</p>
            </div>
          ))}
          <div className="glass rounded-lg p-3 text-center border border-primary/20">
            <p className="text-xs text-primary text-mono">Estimated time to full context: <strong>5 minutes</strong></p>
            <p className="text-[9px] text-muted-foreground">vs. industry average: 3–6 months</p>
          </div>
        </div>
      ),
    },
  ] : [];

  const allSteps = step === 0
    ? [formStep]
    : loading && !brief
    ? [formStep, loadingStep]
    : [formStep, ...dynamicSteps];

  const currentStep = allSteps[Math.min(step, allSteps.length - 1)];
  const totalSteps = 1 + (dynamicSteps.length || 5);
  const isLastStep = step >= totalSteps - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-[520px] glass-strong rounded-2xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <div className="text-[10px] text-mono text-primary tracking-[0.3em] mb-1">TIME MACHINE · ONBOARDING</div>
          <h2 className="text-sm font-bold text-foreground">{currentStep?.title}</h2>
        </div>

        {/* Progress */}
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="min-h-[220px]">{currentStep?.content}</div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
            disabled={step === 0 || loading}
          >
            ← Previous
          </button>
          <span className="text-[10px] text-muted-foreground text-mono">{step + 1} / {totalSteps}</span>
          {!isLastStep ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className="text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Next →'}
            </button>
          ) : (
            <button onClick={onClose} className="text-xs text-primary hover:text-primary/80 transition-colors">
              Start Working →
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingModal;

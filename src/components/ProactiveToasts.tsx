import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ProactiveToastsProps {
  onAction: (action: string) => void;
  suppressRef: React.RefObject<boolean>;
}

interface Toast {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  action: string;
  borderColor: string;
  textColor: string;
}

// Module-level flag for once-per-session behavior
let triggered = false;

const TOASTS: Toast[] = [
  {
    id: 'toast-1',
    severity: 'CRITICAL',
    title: 'Contradiction Detected',
    description:
      "Nova-Sales sent $15/seat to Acme Corp. Conflicts with Sarah Chen's $20/seat commitment. $30K ARR at risk.",
    action: 'trace',
    borderColor: 'border-l-red-400',
    textColor: 'text-red-400',
  },
  {
    id: 'toast-2',
    severity: 'WARNING',
    title: 'Overload Risk',
    description:
      'Catherine Moore at 88% cognitive load — single point of failure for 6 active workstreams across 3 divisions.',
    action: 'select-catherine',
    borderColor: 'border-l-orange-400',
    textColor: 'text-orange-400',
  },
  {
    id: 'toast-3',
    severity: 'INFO',
    title: 'Silo Detected',
    description:
      'NA Payments × EMEA Billing: 83% code overlap, zero communication. ~$45K duplicated effort.',
    action: 'silo',
    borderColor: 'border-l-yellow-400',
    textColor: 'text-yellow-400',
  },
];

export default function ProactiveToasts({
  onAction,
  suppressRef,
}: ProactiveToastsProps) {
  const [visibleToasts, setVisibleToasts] = useState<string[]>([]);
  const [dismissedToasts, setDismissedToasts] = useState<Set<string>>(
    new Set()
  );
  const hasInteracted = useRef(false);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // If already triggered in this session, don't run again
    if (triggered) return;

    const handleFirstMouseMove = () => {
      if (hasInteracted.current || suppressRef.current) return;

      hasInteracted.current = true;
      triggered = true;

      // Start stagger sequence: Toast 1 at +0s, Toast 2 at +2s, Toast 3 at +4s
      TOASTS.forEach((toast, index) => {
        const showTimeout = setTimeout(() => {
          if (suppressRef.current) return;

          setVisibleToasts((prev) => [...prev, toast.id]);

          // Auto-dismiss after 10 seconds
          const dismissTimeout = setTimeout(() => {
            setVisibleToasts((prev) => prev.filter((id) => id !== toast.id));
          }, 10000);

          timeoutRefs.current.push(dismissTimeout);
        }, index * 2000);

        timeoutRefs.current.push(showTimeout);
      });

      // Remove event listener after first interaction
      document.removeEventListener('mousemove', handleFirstMouseMove);
    };

    document.addEventListener('mousemove', handleFirstMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleFirstMouseMove);
      // Clear all timeouts on unmount
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current = [];
    };
  }, [suppressRef]);

  const handleDismiss = (toastId: string) => {
    setVisibleToasts((prev) => prev.filter((id) => id !== toastId));
    setDismissedToasts((prev) => new Set(prev).add(toastId));
  };

  const handleAction = (action: string, toastId: string) => {
    onAction(action);
    handleDismiss(toastId);
  };

  // Filter out dismissed toasts and respect suppressRef
  const activeToasts = TOASTS.filter(
    (toast) =>
      visibleToasts.includes(toast.id) &&
      !dismissedToasts.has(toast.id) &&
      !suppressRef.current
  );

  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {activeToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className={`w-[340px] glass-strong rounded-xl border-l-[3px] ${toast.borderColor} p-4 pr-8 relative pointer-events-auto`}
          >
            {/* Dismiss button */}
            <button
              onClick={() => handleDismiss(toast.id)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Severity badge */}
            <div className={`text-mono text-[10px] ${toast.textColor} mb-1.5`}>
              {toast.severity}
            </div>

            {/* Title */}
            <h3 className="text-xs font-semibold text-foreground mb-1.5">
              {toast.title}
            </h3>

            {/* Description */}
            <p className="text-[11px] text-foreground/70 leading-relaxed mb-3">
              {toast.description}
            </p>

            {/* Action button */}
            <div className="flex justify-end">
              <button
                onClick={() => handleAction(toast.action, toast.id)}
                className="text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
              >
                View →
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

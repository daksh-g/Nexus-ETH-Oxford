import { useState, useRef, useEffect } from 'react';
import { suggestedQueries } from '@/data/mockData';
import { askNexus, initPreCache } from '@/lib/openai';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowUp } from 'lucide-react';
import VoiceMicButton from '@/components/VoiceMicButton';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AskNexusView = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Pre-cache on mount
  useEffect(() => {
    initPreCache();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayedText]);

  const submitQuery = async (q: string) => {
    if (!q.trim() || typing) return;
    const userMsg: Message = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setTyping(true);
    setDisplayedText('');

    // Cancel any previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let finalText = '';
      for await (const text of askNexus(q, controller.signal)) {
        if (controller.signal.aborted) return;
        setDisplayedText(text);
        finalText = text;
      }
      if (!controller.signal.aborted) {
        setMessages(prev => [...prev, { role: 'assistant', content: finalText }]);
        setDisplayedText('');
        setTyping(false);
      }
    } catch {
      if (!controller.signal.aborted) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Unable to reach NEXUS. Please try again.' }]);
        setDisplayedText('');
        setTyping(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery(query);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8 pt-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-mono text-foreground">Ask NEXUS</h1>
        </div>
        <p className="text-xs text-muted-foreground">Query your organizational knowledge graph in natural language</p>
      </div>

      {/* Suggested queries */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          {suggestedQueries.map(q => (
            <button
              key={q}
              onClick={() => submitQuery(q)}
              className="glass rounded-lg px-3.5 py-2 text-xs text-foreground/70 hover:text-foreground hover:border-primary/30 transition-all"
            >
              {q}
            </button>
          ))}
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 mb-6">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary/15 text-foreground border border-primary/20'
                  : 'glass text-foreground/85'
              }`}>
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {typing && displayedText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] glass rounded-xl px-4 py-3 text-xs leading-relaxed text-foreground/85">
              <pre className="whitespace-pre-wrap font-sans">
                {displayedText}
                <span className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 animate-pulse" />
              </pre>
            </div>
          </motion.div>
        )}

        {typing && !displayedText && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass rounded-xl px-4 py-3 flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="sticky bottom-6">
        <div className="glass-strong rounded-xl flex items-center gap-3 px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything about your organization..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <VoiceMicButton onTranscript={(text) => setQuery(text)} />
          <button
            type="submit"
            disabled={!query.trim() || typing}
            className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary hover:bg-primary/25 transition-colors disabled:opacity-30"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskNexusView;

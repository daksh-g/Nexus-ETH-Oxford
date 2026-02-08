import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

type VoiceState = 'idle' | 'recording' | 'processing';

interface VoiceMicButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

const VoiceMicButton = ({ onTranscript, className = '' }: VoiceMicButtonProps) => {
  const [state, setState] = useState<VoiceState>('idle');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    if (state === 'recording') {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setState('processing');
      const transcript = event.results[event.resultIndex][0].transcript;
      onTranscript(transcript);
    };

    recognition.onend = () => {
      setState('idle');
    };

    recognition.onerror = () => {
      setState('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState('recording');
  }, [SpeechRecognitionAPI, state, onTranscript]);

  // Feature detection: render nothing if unsupported
  if (!SpeechRecognitionAPI) return null;

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
        state === 'recording'
          ? 'bg-red-500/20 text-red-400'
          : 'bg-primary/15 text-primary hover:bg-primary/25'
      } ${className}`}
      aria-label={state === 'recording' ? 'Stop recording' : 'Start voice input'}
    >
      {/* Pulsing ring when recording */}
      {state === 'recording' && (
        <span className="absolute inset-0 rounded-lg border-2 border-red-500 animate-ping opacity-50" />
      )}
      {state === 'recording' ? (
        <MicOff className="w-4 h-4 relative z-10" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};

export default VoiceMicButton;

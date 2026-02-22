import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hello! I\'m the PS3 Compliance AI Assistant. I can help with AML rules, regulatory questions, risk analysis, and platform guidance. Ask me anything in any language! 🌍' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    let assistantSoFar = '';
    const allMessages = [...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0), userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, mode: 'chat' }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Failed to connect' }));
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${err.error || 'Service unavailable. Please try again.'}` }]);
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > 1) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch { /* partial JSON */ }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Network error. Please check your connection.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] flex flex-col bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold gradient-text">PS3 Compliance AI</h3>
                <p className="text-[10px] text-muted-foreground">Powered by Gemini • Multilingual</p>
              </div>
              <span className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && <Bot className="w-5 h-5 text-primary mt-1 shrink-0" />}
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary/15 text-foreground'
                      : 'bg-muted/50 text-foreground'
                  }`}>
                    {m.role === 'assistant' ? (
                      <div className="prose prose-xs prose-invert max-w-none [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_pre]:my-1 [&_code]:text-accent [&_strong]:text-primary">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                  {m.role === 'user' && <User className="w-5 h-5 text-accent mt-1 shrink-0" />}
                </div>
              ))}
              {loading && !messages[messages.length - 1]?.content && (
                <div className="flex gap-2">
                  <Bot className="w-5 h-5 text-primary mt-1 shrink-0" />
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about AML, rules, compliance..."
                  className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

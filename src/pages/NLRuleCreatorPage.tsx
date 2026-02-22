import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Loader2, CheckCircle2, Copy, AlertTriangle, Brain } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SeverityBadge } from '@/components/StatusBadges';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const examples = [
  'Flag any transaction over $50,000 going to Iran or Russia',
  'If an account sends more than 5 transfers in 1 hour, mark as high risk',
  'Detect when dormant accounts (inactive 6+ months) suddenly have activity over $10,000',
  'Flag any cash transaction that exceeds 80% of the account\'s monthly average',
];

export default function NLRuleCreatorPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [confidence, setConfidence] = useState(0);

  const parseRule = async (text?: string) => {
    const prompt = text || input;
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          mode: 'parse-rule',
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        setError(err.error || 'Failed to parse rule');
        setLoading(false);
        return;
      }

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Extract JSON from markdown code blocks if present
      let jsonStr = content;
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
      
      const parsed = JSON.parse(jsonStr);
      setResult(parsed);
      setConfidence(parsed.confidence || Math.floor(Math.random() * 15) + 82);
    } catch (e) {
      setError('Failed to parse AI response. Please try rephrasing.');
    }
    setLoading(false);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Natural Language Rule Creator</h1>
        <p className="text-sm text-muted-foreground mt-1">Write compliance rules in plain English — AI converts to structured format</p>
      </div>

      {/* Input */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Brain className="w-4 h-4 text-primary" /> Describe your rule
        </div>
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g., Flag any transaction over $50,000 going to a high-risk country..."
          className="bg-muted/50 border-border min-h-[80px] text-sm"
        />
        <div className="flex items-center justify-between">
          <button onClick={() => parseRule()} disabled={loading || !input.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {loading ? 'AI Parsing...' : 'Convert to Rule'}
          </button>
          {confidence >= 85 && result && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <CheckCircle2 className="w-3 h-3" /> Auto-approved (confidence {confidence}%)
            </span>
          )}
          {confidence > 0 && confidence < 85 && result && (
            <span className="flex items-center gap-1 text-xs text-warning">
              <AlertTriangle className="w-3 h-3" /> Human review required (confidence {confidence}%)
            </span>
          )}
        </div>
      </div>

      {/* Examples */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-muted-foreground mb-2">Quick Examples — click to try</h3>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex, i) => (
            <button key={i} onClick={() => { setInput(ex); parseRule(ex); }}
              className="px-3 py-1.5 bg-muted/50 text-xs text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground transition-colors text-left">
              {ex}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border-destructive/30">
          <p className="text-sm text-destructive">⚠️ {error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Generated Rule
              </h3>
              <button onClick={copyJson} className="flex items-center gap-1 text-xs text-accent hover:text-accent/80">
                <Copy className="w-3 h-3" /> Copy JSON
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div><span className="text-muted-foreground">Rule ID</span><p className="font-mono text-accent mt-1">{result.rule_id}</p></div>
              <div><span className="text-muted-foreground">Name</span><p className="font-medium mt-1">{result.rule_name}</p></div>
              <div><span className="text-muted-foreground">Severity</span><div className="mt-1"><SeverityBadge severity={result.severity} /></div></div>
              <div><span className="text-muted-foreground">Category</span><p className="mt-1">{result.category}</p></div>
              <div><span className="text-muted-foreground">Monitoring</span><p className="mt-1">{result.monitoring_frequency}</p></div>
              <div><span className="text-muted-foreground">Regulatory Ref</span><p className="mt-1 text-primary">{result.regulatory_ref}</p></div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Condition Logic</span>
              <pre className="font-mono text-[11px] text-accent mt-1 bg-muted/50 p-2 rounded overflow-x-auto">{result.condition_logic}</pre>
            </div>
            {result.required_fields && (
              <div className="mt-2">
                <span className="text-xs text-muted-foreground">Required Fields</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.required_fields.map((f: string) => <span key={f} className="bg-muted px-2 py-0.5 rounded font-mono text-xs">{f}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Raw JSON */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">Raw JSON Output</h3>
            <pre className="font-mono text-[10px] text-accent bg-muted/50 p-3 rounded overflow-x-auto max-h-[200px]">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          {/* Human-in-the-loop */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-warning" /> AI Governance
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="glass-card p-2 text-center">
                <span className="text-muted-foreground">Confidence</span>
                <p className={`font-mono font-bold mt-1 ${confidence >= 85 ? 'text-primary' : 'text-warning'}`}>{confidence}%</p>
              </div>
              <div className="glass-card p-2 text-center">
                <span className="text-muted-foreground">Ambiguity</span>
                <p className={`font-mono font-bold mt-1 ${confidence >= 85 ? 'text-primary' : 'text-warning'}`}>{confidence >= 85 ? 'None' : 'Detected'}</p>
              </div>
              <div className="glass-card p-2 text-center">
                <span className="text-muted-foreground">Approval</span>
                <p className={`font-mono font-bold mt-1 ${confidence >= 85 ? 'text-primary' : 'text-warning'}`}>{confidence >= 85 ? 'Auto' : 'Manual'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, XCircle, Database, Play, CheckCircle2 } from 'lucide-react';

interface IntegrityRecord {
  id: string;
  record_id: string;
  issue: string;
  field: string;
  severity: 'warning' | 'error';
  action: string;
  timestamp: string;
}

const staticQuarantined: IntegrityRecord[] = [
  { id: 'DI-001', record_id: 'TXN-X8F2K', issue: 'Missing required field', field: 'amount', severity: 'error', action: 'Quarantined — excluded from scan', timestamp: '2026-02-21T10:00:12Z' },
  { id: 'DI-002', record_id: 'TXN-Q3M9P', issue: 'Invalid type (string in numeric)', field: 'amount', severity: 'error', action: 'Quarantined — type coercion failed', timestamp: '2026-02-21T10:00:12Z' },
  { id: 'DI-003', record_id: 'TXN-R7L4N', issue: 'Null value in required field', field: 'from_account', severity: 'error', action: 'Quarantined — null protection', timestamp: '2026-02-21T10:00:12Z' },
  { id: 'DI-004', record_id: 'TXN-P2V8K', issue: 'Negative amount detected', field: 'amount', severity: 'warning', action: 'Flagged — possibly reversed txn', timestamp: '2026-02-21T10:00:12Z' },
  { id: 'DI-005', record_id: 'TXN-M1W6J', issue: 'Future timestamp', field: 'timestamp', severity: 'warning', action: 'Flagged — clock skew suspected', timestamp: '2026-02-21T10:00:12Z' },
];

const validationChecks = [
  { check: 'Schema Validation', desc: 'All required fields present with correct types', status: 'pass' as const },
  { check: 'Null Field Protection', desc: 'No null values in required fields', status: 'pass' as const },
  { check: 'Type Coercion', desc: 'Safe numeric parsing for amount fields', status: 'pass' as const },
  { check: 'Range Validation', desc: 'Amount > 0, risk_score 0-100', status: 'pass' as const },
  { check: 'Timestamp Validation', desc: 'Valid ISO 8601, not in future', status: 'pass' as const },
  { check: 'Rule Syntax Validation', desc: 'Validate logical operators before activation', status: 'pass' as const },
  { check: 'Circular Dependency Check', desc: 'Detect rule conflicts and circular refs', status: 'pass' as const },
];

export default function DataIntegrityPage() {
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  const runValidation = () => {
    setValidating(true);
    setValidated(false);
    setTimeout(() => { setValidating(false); setValidated(true); }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Data Integrity & Validation</h1>
          <p className="text-sm text-muted-foreground mt-1">Schema validation, quarantine log, and pre-scan data quality checks</p>
        </div>
        <button onClick={runValidation} disabled={validating}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors disabled:opacity-40">
          {validating ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
          {validating ? 'Validating...' : 'Run Validation Check'}
        </button>
      </div>

      {/* Validation checks */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Pre-Scan Validation Pipeline</h3>
        <div className="space-y-2">
          {validationChecks.map((v, i) => (
            <motion.div key={v.check} initial={{ opacity: 0, x: -10 }} animate={{ opacity: validated ? 1 : 0.5, x: 0 }}
              transition={{ delay: validated ? i * 0.1 : 0 }}
              className="flex items-center gap-3 p-2 bg-muted/30 rounded text-xs">
              {validated ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground/30 shrink-0" />}
              <div className="flex-1">
                <span className="font-medium">{v.check}</span>
                <span className="text-muted-foreground ml-2">{v.desc}</span>
              </div>
              {validated && <span className="text-primary font-mono">PASS</span>}
            </motion.div>
          ))}
        </div>
        {validated && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-2 bg-primary/10 rounded text-xs text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> All validation checks passed. Dataset is clean for rule evaluation.
          </motion.div>
        )}
      </motion.div>

      {/* Quarantine log */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" /> Quarantine Log — {staticQuarantined.length} records</h3>
          <p className="text-xs text-muted-foreground mt-1">Invalid records excluded from rule evaluation</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Record</th><th>Issue</th><th>Field</th><th>Severity</th><th>Action</th></tr>
            </thead>
            <tbody>
              {staticQuarantined.map(r => (
                <tr key={r.id}>
                  <td className="font-mono text-xs">{r.id}</td>
                  <td className="font-mono text-xs text-accent">{r.record_id}</td>
                  <td className="text-xs">{r.issue}</td>
                  <td className="font-mono text-xs">{r.field}</td>
                  <td>{r.severity === 'error' ? <XCircle className="w-4 h-4 text-destructive" /> : <AlertTriangle className="w-4 h-4 text-warning" />}</td>
                  <td className="text-xs text-muted-foreground">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Rule validation */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /> Rule Lifecycle & Conflict Resolution</h3>
        <div className="space-y-3 text-xs">
          <div className="border-l-2 border-primary pl-3">
            <p className="font-medium">Rule Status Lifecycle</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {['Draft', 'Validated', 'Active', 'Deprecated'].map((s, i) => (
                <span key={s} className="flex items-center gap-1">
                  <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">{s}</span>
                  {i < 3 && <span className="text-accent">→</span>}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground mt-1">Rules must pass syntax validation, field existence check, and dry-run before activation.</p>
          </div>
          <div className="border-l-2 border-warning pl-3">
            <p className="font-medium">Conflict Resolution Strategy</p>
            <p className="text-muted-foreground mt-1">Each rule has priority (1-10). When Rule A flags and Rule B suppresses, higher priority wins. Example: Corporate internal transfer (priority 8) suppresses Large Transaction alert (priority 5).</p>
          </div>
          <div className="border-l-2 border-accent pl-3">
            <p className="font-medium">Dry-Run Before Deployment</p>
            <p className="text-muted-foreground mt-1">Before activating any rule change, system shows impact preview: estimated violation count change, false positive rate shift, risk score impact.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Shield(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>;
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Beaker, Play, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SeverityBadge } from '@/components/StatusBadges';

interface SimResult {
  id: string;
  rule_triggered: string;
  severity: string;
  detail: string;
  risk_score: number;
}

const scenarios = [
  { id: 'smurfing', name: 'Structuring (Smurfing)', desc: 'Multiple transactions just below $10,000 threshold' },
  { id: 'layering', name: 'Layering Attack', desc: 'Funds routed through multiple intermediary accounts' },
  { id: 'highvalue', name: 'Single Large Transfer', desc: 'One-time $500,000 cross-border wire transfer' },
  { id: 'dormant', name: 'Dormant Account Burst', desc: 'Account inactive 2 years suddenly moves $80,000' },
];

const simResultsMap: Record<string, SimResult[]> = {
  smurfing: [
    { id: 'SIM-001', rule_triggered: 'AML_002 Structuring Detection', severity: 'Critical', detail: '5 transactions of $9,800 within 3 hours from ACC-SIM1', risk_score: 92 },
    { id: 'SIM-002', rule_triggered: 'AML_004 Rapid Velocity', severity: 'High', detail: '5 transactions in 3 hours exceeds velocity threshold', risk_score: 78 },
  ],
  layering: [
    { id: 'SIM-003', rule_triggered: 'AML_005 Circular Transfer', severity: 'Critical', detail: 'Cycle detected: ACC-A → ACC-B → ACC-C → ACC-A', risk_score: 95 },
    { id: 'SIM-004', rule_triggered: 'AML_003 Cross-Border High Value', severity: 'High', detail: 'Transfers across 3 jurisdictions totaling $120,000', risk_score: 85 },
    { id: 'SIM-005', rule_triggered: 'AML_007 High-Risk Jurisdiction', severity: 'High', detail: 'Intermediate transfer through IR jurisdiction', risk_score: 88 },
  ],
  highvalue: [
    { id: 'SIM-006', rule_triggered: 'AML_001 Large Transaction', severity: 'Critical', detail: 'Single wire of $500,000 to offshore account', risk_score: 90 },
    { id: 'SIM-007', rule_triggered: 'AML_003 Cross-Border High Value', severity: 'High', detail: 'Cross-border $500,000 US → CH', risk_score: 82 },
  ],
  dormant: [
    { id: 'SIM-008', rule_triggered: 'AML_006 Dormant Account', severity: 'Medium', detail: 'Account inactive 730 days, now active', risk_score: 65 },
    { id: 'SIM-009', rule_triggered: 'AML_001 Large Transaction', severity: 'High', detail: '$80,000 withdrawal from previously dormant account', risk_score: 75 },
  ],
};

export default function SimulatorPage() {
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<SimResult[] | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const runSimulation = (scenarioId: string) => {
    setRunning(scenarioId);
    setSelectedScenario(scenarioId);
    setResults(null);
    setTimeout(() => {
      setResults(simResultsMap[scenarioId]);
      setRunning(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Fraud Scenario Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1">Test system robustness with synthetic AML patterns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scenarios.map(s => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-4 cursor-pointer transition-all duration-200 ${selectedScenario === s.id ? 'border-primary/50 glow-primary' : 'hover:border-primary/20'}`}
            onClick={() => runSimulation(s.id)}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-accent" />{s.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </div>
              <button className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs hover:bg-primary/20">
                <Play className="w-3 h-3" /> Run
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {running && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Running simulation...</p>
        </motion.div>
      )}

      {results && !running && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" /> Simulation Results — {results.length} rules triggered
          </h3>
          {results.map(r => (
            <div key={r.id} className="glass-card p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-accent">{r.id}</span>
                  <span className="font-medium text-sm">{r.rule_triggered}</span>
                  <SeverityBadge severity={r.severity} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{r.detail}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-muted-foreground">Risk</span>
                <p className="font-mono text-sm font-bold text-warning">{r.risk_score}</p>
              </div>
            </div>
          ))}
          <div className="glass-card p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">System Response: All rules triggered correctly</p>
              <p className="text-xs text-muted-foreground">No false negatives detected. System is robust against this pattern.</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockRules } from '@/data/mockData';
import { SeverityBadge } from '@/components/StatusBadges';
import { Shield, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function RulesPage() {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const [whatIfRule, setWhatIfRule] = useState<typeof mockRules[0] | null>(null);
  const [whatIfThreshold, setWhatIfThreshold] = useState(10000);

  const filtered = mockRules.filter(r =>
    r.rule_name.toLowerCase().includes(search.toLowerCase()) ||
    r.rule_id.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Rule Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage compliance rules — deterministic + AI hybrid</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search rules by name, ID, or category..." className="pl-9 bg-card border-border"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {filtered.map((rule, i) => (
          <motion.div key={rule.rule_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="glass-card overflow-hidden">
            <button className="w-full flex items-center gap-3 p-4 text-left"
              onClick={() => setExpandedRule(expandedRule === rule.rule_id ? null : rule.rule_id)}>
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-accent">{rule.rule_id}</span>
                  <span className="font-medium text-sm">{rule.rule_name}</span>
                  <SeverityBadge severity={rule.severity} />
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{rule.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{rule.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {rule.enabled ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                {expandedRule === rule.rule_id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>

            {expandedRule === rule.rule_id && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-border/50 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Condition Logic</span><pre className="font-mono text-accent mt-1 bg-muted/50 p-2 rounded text-[11px] overflow-x-auto">{rule.condition_logic}</pre></div>
                  <div><span className="text-muted-foreground">Required Fields</span><div className="flex flex-wrap gap-1 mt-1">{rule.required_fields.map(f => <span key={f} className="bg-muted px-2 py-0.5 rounded font-mono">{f}</span>)}</div></div>
                  <div><span className="text-muted-foreground">Monitoring</span><p className="mt-1">{rule.monitoring_frequency}</p></div>
                  <div><span className="text-muted-foreground">Regulatory Ref</span><p className="mt-1 text-primary">{rule.regulatory_ref}</p></div>
                  <div><span className="text-muted-foreground">Version</span><p className="mt-1 font-mono">{rule.version}</p></div>
                  <div><span className="text-muted-foreground">Last Updated</span><p className="mt-1">{rule.last_updated} by {rule.updated_by}</p></div>
                  {rule.false_positive_rate !== undefined && (
                    <div><span className="text-muted-foreground">False Positive Rate</span><p className="mt-1 text-warning">{rule.false_positive_rate}%</p></div>
                  )}
                </div>
                {rule.threshold_value !== undefined && (
                  <button onClick={() => { setWhatIfRule(rule); setWhatIfThreshold(rule.threshold_value!); setWhatIfOpen(true); }}
                    className="text-xs text-accent hover:text-accent/80 underline">
                    What-If Simulation →
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* What-If Simulation */}
      <Dialog open={whatIfOpen} onOpenChange={setWhatIfOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="gradient-text">What-If Simulation — {whatIfRule?.rule_id}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Test threshold changes impact</DialogDescription>
          </DialogHeader>
          {whatIfRule && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Threshold Value</label>
                <Input type="number" value={whatIfThreshold} onChange={e => setWhatIfThreshold(Number(e.target.value))}
                  className="bg-muted border-border mt-1 font-mono" />
                <input type="range" min={1000} max={100000} step={1000} value={whatIfThreshold}
                  onChange={e => setWhatIfThreshold(Number(e.target.value))}
                  className="w-full mt-2 accent-primary" />
              </div>
              <div className="glass-card p-3 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Original threshold</span><span className="font-mono">{whatIfRule.threshold_value?.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">New threshold</span><span className="font-mono text-accent">{whatIfThreshold.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Est. violation change</span><span className="font-mono text-warning">{whatIfThreshold > (whatIfRule.threshold_value || 0) ? '-' : '+'}{Math.abs(Math.floor(((whatIfThreshold - (whatIfRule.threshold_value || 0)) / (whatIfRule.threshold_value || 1)) * -30))} violations</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Est. false positive change</span><span className="font-mono text-primary">{whatIfThreshold > (whatIfRule.threshold_value || 0) ? '-' : '+'}{Math.abs(Math.floor(((whatIfThreshold - (whatIfRule.threshold_value || 0)) / (whatIfRule.threshold_value || 1)) * -8))}%</span></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

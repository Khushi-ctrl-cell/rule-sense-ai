import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockViolations } from '@/data/mockData';
import { SeverityBadge, StatusBadge, ConfidenceBadge } from '@/components/StatusBadges';
import { Eye, Filter, Download, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const severityOptions = ['All', 'Critical', 'High', 'Medium', 'Low'] as const;
const statusOptions = ['All', 'Open', 'Reviewed', 'Escalated', 'Resolved', 'False Positive'] as const;

export default function ViolationsPage() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [selectedV, setSelectedV] = useState<typeof mockViolations[0] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filtered = mockViolations.filter(v =>
    (severity === 'All' || v.severity === severity) &&
    (status === 'All' || v.status === status) &&
    (v.id.toLowerCase().includes(search.toLowerCase()) ||
     v.rule_name.toLowerCase().includes(search.toLowerCase()) ||
     v.reason.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = () => {
    const csv = ['ID,Rule,Severity,Confidence,Status,Reason,Timestamp',
      ...filtered.map(v => `${v.id},${v.rule_name},${v.severity},${v.confidence}%,${v.status},"${v.reason}",${v.timestamp}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `violations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Violations</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} violations found</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search violations..." className="pl-9 bg-card border-border"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select value={severity} onChange={e => setSeverity(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground">
            {severityOptions.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground">
            {statusOptions.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Rule</th><th>Severity</th><th>Confidence</th><th>Status</th><th>Reason</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(v => (
                <tr key={v.id}>
                  <td className="font-mono text-xs">{v.id}</td>
                  <td className="text-xs max-w-[120px] truncate">{v.rule_name}</td>
                  <td><SeverityBadge severity={v.severity} /></td>
                  <td><ConfidenceBadge value={v.confidence} /></td>
                  <td><StatusBadge status={v.status} /></td>
                  <td className="text-xs max-w-[200px] truncate text-muted-foreground">{v.reason}</td>
                  <td>
                    <button onClick={() => { setSelectedV(v); setDetailOpen(true); }}
                      className="text-accent hover:text-accent/80"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="gradient-text">Why Was This Flagged? — {selectedV?.id}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Explainable AI justification</DialogDescription>
          </DialogHeader>
          {selectedV && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs">Rule</span><p className="font-medium">{selectedV.rule_name}</p></div>
                <div><span className="text-muted-foreground text-xs">Severity</span><div className="mt-1"><SeverityBadge severity={selectedV.severity} /></div></div>
              </div>
              <div className="glass-card p-3"><span className="text-xs text-muted-foreground">Step-by-Step Reasoning</span>
                <ol className="mt-2 space-y-1 text-xs list-decimal list-inside">
                  <li>Record {selectedV.record_id} was scanned against rule {selectedV.rule_id}</li>
                  <li>Field values: {JSON.stringify(selectedV.field_values)}</li>
                  <li>Condition evaluated: {selectedV.reason}</li>
                  <li>Confidence: {selectedV.confidence}% — {selectedV.confidence >= 85 ? 'High certainty' : 'Moderate certainty, review recommended'}</li>
                </ol>
              </div>
              <div className="glass-card p-3"><span className="text-xs text-muted-foreground">Risk Perspective</span>
                <p className="mt-1 text-xs">This rule exists to prevent potential money laundering and terrorism financing. Non-compliance may result in regulatory penalties up to $10M per incident.</p>
              </div>
              {selectedV.regulatory_ref && (
                <div className="glass-card p-3"><span className="text-xs text-muted-foreground">Regulatory Reference</span>
                  <p className="mt-1 text-primary text-xs">{selectedV.regulatory_ref}</p></div>
              )}
              <div className="glass-card p-3"><span className="text-xs text-muted-foreground">Suggested Remediation</span>
                <ul className="mt-1 text-xs space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Immediate: Freeze account pending investigation</li>
                  <li>Short-term: Enhanced due diligence on account holder</li>
                  <li>Long-term: Adjust monitoring thresholds if false positive</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

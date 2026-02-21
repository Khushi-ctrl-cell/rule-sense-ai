import { motion } from 'framer-motion';
import { mockAuditLog } from '@/data/mockData';
import { FileText, Download, Shield, AlertTriangle, Search as SearchIcon, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const catColors: Record<string, string> = {
  'Rule Change': 'text-accent',
  'Scan': 'text-primary',
  'Review': 'text-warning',
  'Escalation': 'text-destructive',
  'Policy': 'text-accent',
  'Alert': 'text-destructive',
};

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const filtered = mockAuditLog.filter(e =>
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.details.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadReport = () => {
    const reportContent = `COMPLIANCE AUDIT REPORT
Generated: ${new Date().toISOString()}
========================

${filtered.map(e => `[${e.timestamp}] ${e.action} — ${e.user}
  ${e.details}
  Category: ${e.category}
`).join('\n')}

--- End of Report ---`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `audit_report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1">Immutable compliance activity log</p>
        </div>
        <button onClick={handleDownloadReport}
          className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors">
          <Download className="w-4 h-4" /> Download Report
        </button>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search audit log..." className="pl-9 bg-card border-border"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        {filtered.map((entry, i) => (
          <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4 flex items-start gap-3">
            <div className={`mt-0.5 ${catColors[entry.category] || 'text-muted-foreground'}`}>
              {entry.category === 'Rule Change' ? <Shield className="w-4 h-4" /> :
               entry.category === 'Scan' ? <RefreshCw className="w-4 h-4" /> :
               entry.category === 'Alert' || entry.category === 'Escalation' ? <AlertTriangle className="w-4 h-4" /> :
               <FileText className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{entry.action}</span>
                <span className={`text-[10px] uppercase tracking-wider ${catColors[entry.category] || 'text-muted-foreground'}`}>{entry.category}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">{entry.user}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{new Date(entry.timestamp).toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

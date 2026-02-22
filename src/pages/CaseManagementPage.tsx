import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { mockViolations } from '@/data/mockData';
import { SeverityBadge, StatusBadge } from '@/components/StatusBadges';
import { Briefcase, Plus, Clock, User, MessageSquare, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Case {
  id: string;
  title: string;
  violation_ids: string[];
  assignee: string;
  status: 'Open' | 'In Progress' | 'Under Review' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  created_at: string;
  notes: { author: string; text: string; timestamp: string }[];
  resolution?: string;
  sla_hours: number;
}

const investigators = ['Sarah Chen', 'James Wilson', 'Priya Sharma', 'Michael Rodriguez', 'Emma Thompson'];

const initialCases: Case[] = [
  {
    id: 'CASE-001', title: 'Structuring Pattern — ACC-3847', violation_ids: ['VIO-0001', 'VIO-0003'],
    assignee: 'Sarah Chen', status: 'In Progress', priority: 'Critical', created_at: '2026-02-21T08:00:00Z', sla_hours: 24,
    notes: [
      { author: 'System', text: 'Auto-created from structuring detection. 5 transactions of ~$9,800 in 2 hours.', timestamp: '2026-02-21T08:00:00Z' },
      { author: 'Sarah Chen', text: 'Reviewing account history. Requesting enhanced due diligence.', timestamp: '2026-02-21T09:30:00Z' },
    ],
  },
  {
    id: 'CASE-002', title: 'High-Risk Jurisdiction Transfer', violation_ids: ['VIO-0005'],
    assignee: 'James Wilson', status: 'Open', priority: 'High', created_at: '2026-02-21T10:00:00Z', sla_hours: 48,
    notes: [{ author: 'System', text: 'Cross-border wire to IR jurisdiction flagged by AML_007.', timestamp: '2026-02-21T10:00:00Z' }],
  },
  {
    id: 'CASE-003', title: 'Circular Transfer Ring', violation_ids: ['VIO-0010', 'VIO-0012'],
    assignee: 'Priya Sharma', status: 'Under Review', priority: 'Critical', created_at: '2026-02-20T14:00:00Z', sla_hours: 24,
    notes: [
      { author: 'System', text: 'Circular funds flow detected across 3 accounts.', timestamp: '2026-02-20T14:00:00Z' },
      { author: 'Priya Sharma', text: 'Confirmed laundering pattern. Escalating to senior compliance.', timestamp: '2026-02-20T16:00:00Z' },
    ],
  },
  {
    id: 'CASE-004', title: 'Dormant Account Activation', violation_ids: ['VIO-0015'],
    assignee: 'Emma Thompson', status: 'Closed', priority: 'Medium', created_at: '2026-02-19T09:00:00Z', sla_hours: 72,
    notes: [{ author: 'Emma Thompson', text: 'Account holder verified. Legitimate business transaction.', timestamp: '2026-02-19T15:00:00Z' }],
    resolution: 'False positive — account holder provided supporting documentation.',
  },
];

const statusColors: Record<string, string> = {
  'Open': 'bg-warning/15 text-warning', 'In Progress': 'bg-accent/15 text-accent',
  'Under Review': 'bg-primary/15 text-primary', 'Closed': 'bg-muted text-muted-foreground',
};

export default function CaseManagementPage() {
  const [cases, setCases] = useState(initialCases);
  const [filter, setFilter] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailCase, setDetailCase] = useState<Case | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newCase, setNewCase] = useState({ title: '', violation_ids: '', assignee: investigators[0], priority: 'High' as Case['priority'] });

  const filtered = filter === 'All' ? cases : cases.filter(c => c.status === filter);

  const slaRemaining = (c: Case) => {
    const created = new Date(c.created_at).getTime();
    const deadline = created + c.sla_hours * 3600000;
    const remaining = deadline - Date.now();
    if (remaining < 0) return { text: 'OVERDUE', overdue: true };
    const hours = Math.floor(remaining / 3600000);
    return { text: `${hours}h remaining`, overdue: false };
  };

  const handleCreate = () => {
    const c: Case = {
      id: `CASE-${String(cases.length + 1).padStart(3, '0')}`,
      title: newCase.title, violation_ids: newCase.violation_ids.split(',').map(s => s.trim()).filter(Boolean),
      assignee: newCase.assignee, status: 'Open', priority: newCase.priority,
      created_at: new Date().toISOString(), sla_hours: newCase.priority === 'Critical' ? 24 : newCase.priority === 'High' ? 48 : 72,
      notes: [{ author: 'System', text: `Case created manually.`, timestamp: new Date().toISOString() }],
    };
    setCases(prev => [c, ...prev]);
    setCreateOpen(false);
    setNewCase({ title: '', violation_ids: '', assignee: investigators[0], priority: 'High' });
  };

  const addNote = () => {
    if (!newNote.trim() || !detailCase) return;
    const note = { author: 'You', text: newNote.trim(), timestamp: new Date().toISOString() };
    setCases(prev => prev.map(c => c.id === detailCase.id ? { ...c, notes: [...c.notes, note] } : c));
    setDetailCase(prev => prev ? { ...prev, notes: [...prev.notes, note] } : null);
    setNewNote('');
  };

  const updateStatus = (id: string, status: Case['status']) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setDetailCase(prev => prev && prev.id === id ? { ...prev, status } : prev);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Case Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Investigation workflow — assign, track, resolve</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors">
          <Plus className="w-4 h-4" /> New Case
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Open', 'In Progress', 'Under Review', 'Closed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-primary/15 text-primary' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
            {s} {s !== 'All' && `(${cases.filter(c => c.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Case cards */}
      <div className="space-y-3">
        {filtered.map((c, i) => {
          const sla = slaRemaining(c);
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4 cursor-pointer hover:border-primary/30 transition-all" onClick={() => setDetailCase(c)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-accent">{c.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[c.status]}`}>{c.status}</span>
                    <SeverityBadge severity={c.priority} />
                  </div>
                  <h3 className="font-medium text-sm mt-1">{c.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{c.assignee}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{c.notes.length} notes</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{c.violation_ids.length} violations</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`flex items-center gap-1 text-xs ${sla.overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <Clock className="w-3 h-3" />{sla.text}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Case Detail Dialog */}
      <Dialog open={!!detailCase} onOpenChange={open => !open && setDetailCase(null)}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="gradient-text">{detailCase?.id} — {detailCase?.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Investigation details and timeline</DialogDescription>
          </DialogHeader>
          {detailCase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">Assignee</span><p className="font-medium mt-1">{detailCase.assignee}</p></div>
                <div><span className="text-muted-foreground">Priority</span><div className="mt-1"><SeverityBadge severity={detailCase.priority} /></div></div>
                <div><span className="text-muted-foreground">SLA</span>
                  <p className={`mt-1 font-mono ${slaRemaining(detailCase).overdue ? 'text-destructive' : 'text-primary'}`}>{slaRemaining(detailCase).text}</p>
                </div>
                <div><span className="text-muted-foreground">Violations</span><p className="mt-1 font-mono text-accent">{detailCase.violation_ids.join(', ')}</p></div>
              </div>

              {/* Status actions */}
              <div className="flex gap-2 flex-wrap">
                {(['Open', 'In Progress', 'Under Review', 'Closed'] as Case['status'][]).map(s => (
                  <button key={s} onClick={() => updateStatus(detailCase.id, s)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${detailCase.status === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    {s}
                  </button>
                ))}
              </div>

              {detailCase.resolution && (
                <div className="glass-card p-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" />Resolution</span>
                  <p className="text-xs mt-1">{detailCase.resolution}</p>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Investigation Timeline</h4>
                {detailCase.notes.map((n, i) => (
                  <div key={i} className="glass-card p-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium text-foreground">{n.author}</span>
                      <span>•</span>
                      <span>{new Date(n.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="mt-1">{n.text}</p>
                  </div>
                ))}
              </div>

              {/* Add note */}
              <div className="flex gap-2">
                <Input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add investigation note..."
                  className="bg-muted border-border text-xs" onKeyDown={e => e.key === 'Enter' && addNote()} />
                <button onClick={addNote} className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs hover:bg-primary/20">Add</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Case Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="gradient-text">Create New Case</DialogTitle>
            <DialogDescription className="text-muted-foreground">Open an investigation case</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Case Title</label>
              <Input value={newCase.title} onChange={e => setNewCase(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Suspicious layering pattern on ACC-1234" className="bg-muted border-border mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Violation IDs (comma separated)</label>
              <Input value={newCase.violation_ids} onChange={e => setNewCase(p => ({ ...p, violation_ids: e.target.value }))}
                placeholder="VIO-0001, VIO-0002" className="bg-muted border-border mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Assignee</label>
                <select value={newCase.assignee} onChange={e => setNewCase(p => ({ ...p, assignee: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground mt-1">
                  {investigators.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Priority</label>
                <select value={newCase.priority} onChange={e => setNewCase(p => ({ ...p, priority: e.target.value as Case['priority'] }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground mt-1">
                  {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleCreate} disabled={!newCase.title.trim()}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              Create Case
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

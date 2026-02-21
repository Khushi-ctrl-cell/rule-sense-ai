import { useState } from 'react';
import { motion } from 'framer-motion';
import MetricCard from '@/components/MetricCard';
import { SeverityBadge, StatusBadge, RiskScoreBar } from '@/components/StatusBadges';
import { mockViolations, mockTransactions, mockAccountRisks, mockRules, mockScanResults } from '@/data/mockData';
import {
  ShieldCheck, AlertTriangle, TrendingUp, Activity, Database,
  Clock, BarChart3, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
mockViolations.forEach(v => { if (v.severity in severityCounts) severityCounts[v.severity as keyof typeof severityCounts]++; });
const pieData = Object.entries(severityCounts).map(([name, value]) => ({ name, value }));
const PIE_COLORS = ['hsl(0,72%,51%)', 'hsl(0,72%,51%)', 'hsl(38,92%,50%)', 'hsl(160,84%,39%)'];

const ruleViolationData = mockRules.map(r => ({
  name: r.rule_id,
  violations: mockViolations.filter(v => v.rule_id === r.rule_id).length,
})).sort((a, b) => b.violations - a.violations).slice(0, 6);

const trendData = [
  { day: 'Sat', violations: 28, score: 78 },
  { day: 'Sun', violations: 35, score: 72 },
  { day: 'Mon', violations: 42, score: 74 },
  { day: 'Tue', violations: 31, score: 80 },
  { day: 'Wed', violations: 38, score: 76 },
  { day: 'Thu', violations: 45, score: 71 },
  { day: 'Fri', violations: 33, score: 77 },
];

const totalExposure = mockViolations.reduce((s, v) => s + (v.estimated_exposure || 0), 0);
const complianceScore = mockScanResults[0]?.compliance_score || 75;
const highRiskAccounts = mockAccountRisks.filter(a => a.risk_level === 'Critical' || a.risk_level === 'High');

export default function DashboardPage() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<typeof mockViolations[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Compliance Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time AML policy monitoring — IBM AML Dataset</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">Live Monitoring</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Compliance Score" value={`${complianceScore}%`} icon={<ShieldCheck className="w-5 h-5" />}
          variant="success" trend={{ value: -3, label: 'vs last scan' }} subtitle="Overall compliance" />
        <MetricCard title="Active Violations" value={mockViolations.filter(v => v.status === 'Open').length}
          icon={<AlertTriangle className="w-5 h-5" />} variant="danger"
          trend={{ value: 5, label: 'vs yesterday' }} subtitle="Require attention" />
        <MetricCard title="Records Scanned" value={mockTransactions.length.toLocaleString()}
          icon={<Database className="w-5 h-5" />} subtitle="Last scan: 2 min ago" />
        <MetricCard title="Capital Exposure" value={`$${(totalExposure / 1000000).toFixed(1)}M`}
          icon={<TrendingUp className="w-5 h-5" />} variant="warning" subtitle="Estimated risk exposure" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" /> Violation Trend (7 days)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradVio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0,72%,51%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0,72%,51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, fontSize: 12, color: 'hsl(210,40%,92%)' }} />
              <Area type="monotone" dataKey="violations" stroke="hsl(0,72%,51%)" fill="url(#gradVio)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, fontSize: 12, color: 'hsl(210,40%,92%)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />{d.name}: {d.value}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top violated rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" /> Top Violated Rules
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ruleViolationData} layout="vertical">
              <XAxis type="number" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, fontSize: 12, color: 'hsl(210,40%,92%)' }} />
              <Bar dataKey="violations" fill="hsl(199,89%,48%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* High risk accounts */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> High-Risk Accounts
          </h3>
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {highRiskAccounts.slice(0, 8).map(acc => (
              <div key={acc.account_id} className="flex items-center gap-3">
                <span className="font-mono text-xs text-foreground w-20">{acc.account_id}</span>
                <RiskScoreBar score={acc.risk_score} />
                <SeverityBadge severity={acc.risk_level} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent violations table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" /> Recent Violations
          </h3>
          <span className="text-xs text-muted-foreground">{mockViolations.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Rule</th><th>Severity</th><th>Confidence</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockViolations.slice(0, 10).map(v => (
                <tr key={v.id}>
                  <td className="font-mono text-xs">{v.id}</td>
                  <td className="text-xs">{v.rule_name}</td>
                  <td><SeverityBadge severity={v.severity} /></td>
                  <td className="font-mono text-xs">{v.confidence}%</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td>
                    <button onClick={() => { setSelectedViolation(v); setDetailOpen(true); }}
                      className="text-accent hover:text-accent/80 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Violation detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="gradient-text">Violation Detail — {selectedViolation?.id}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Explainable justification for this flag</DialogDescription>
          </DialogHeader>
          {selectedViolation && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs">Rule</span><p className="font-medium">{selectedViolation.rule_name}</p></div>
                <div><span className="text-muted-foreground text-xs">Record</span><p className="font-mono">{selectedViolation.record_id}</p></div>
                <div><span className="text-muted-foreground text-xs">Severity</span><div className="mt-1"><SeverityBadge severity={selectedViolation.severity} /></div></div>
                <div><span className="text-muted-foreground text-xs">Confidence</span><p className="font-mono">{selectedViolation.confidence}%</p></div>
              </div>
              <div className="glass-card p-3">
                <span className="text-xs text-muted-foreground">Reason</span>
                <p className="mt-1">{selectedViolation.reason}</p>
              </div>
              <div className="glass-card p-3">
                <span className="text-xs text-muted-foreground">Field Values</span>
                <pre className="text-xs font-mono mt-1 text-accent">{JSON.stringify(selectedViolation.field_values, null, 2)}</pre>
              </div>
              {selectedViolation.regulatory_ref && (
                <div className="glass-card p-3">
                  <span className="text-xs text-muted-foreground">Regulatory Reference</span>
                  <p className="mt-1 text-primary">{selectedViolation.regulatory_ref}</p>
                </div>
              )}
              {selectedViolation.estimated_exposure && (
                <div className="glass-card p-3">
                  <span className="text-xs text-muted-foreground">Estimated Exposure</span>
                  <p className="mt-1 font-mono text-warning">${selectedViolation.estimated_exposure.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

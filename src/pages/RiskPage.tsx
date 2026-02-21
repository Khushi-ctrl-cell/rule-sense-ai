import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockAccountRisks } from '@/data/mockData';
import { SeverityBadge, RiskScoreBar } from '@/components/StatusBadges';
import { Search, TrendingUp, TrendingDown, Minus, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import MetricCard from '@/components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';

const riskDistribution = [
  { level: 'Low', count: mockAccountRisks.filter(a => a.risk_level === 'Low').length, fill: 'hsl(160,84%,39%)' },
  { level: 'Medium', count: mockAccountRisks.filter(a => a.risk_level === 'Medium').length, fill: 'hsl(38,92%,50%)' },
  { level: 'High', count: mockAccountRisks.filter(a => a.risk_level === 'High').length, fill: 'hsl(0,72%,51%)' },
  { level: 'Critical', count: mockAccountRisks.filter(a => a.risk_level === 'Critical').length, fill: 'hsl(0,72%,65%)' },
];

const trendIcons = { up: TrendingUp, down: TrendingDown, stable: Minus };

export default function RiskPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'violations'>('score');

  const filtered = mockAccountRisks
    .filter(a => a.account_id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'score' ? b.risk_score - a.risk_score : b.violation_count - a.violation_count);

  const avgScore = Math.round(mockAccountRisks.reduce((s, a) => s + a.risk_score, 0) / mockAccountRisks.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Risk Scoring Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">Account-level risk intelligence</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Avg Risk Score" value={avgScore} icon={<TrendingUp className="w-5 h-5" />}
          variant={avgScore > 50 ? 'warning' : 'success'} />
        <MetricCard title="Critical Accounts" value={mockAccountRisks.filter(a => a.risk_level === 'Critical').length}
          icon={<TrendingUp className="w-5 h-5" />} variant="danger" />
        <MetricCard title="Structuring Detected" value={mockAccountRisks.filter(a => a.structuring_detected).length}
          icon={<TrendingUp className="w-5 h-5" />} variant="warning" />
        <MetricCard title="Total Accounts" value={mockAccountRisks.length} icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-3">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={riskDistribution}>
              <XAxis dataKey="level" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, fontSize: 12, color: 'hsl(210,40%,92%)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {riskDistribution.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-3">Score vs Violations</h3>
          <ResponsiveContainer width="100%" height={180}>
            <ScatterChart>
              <XAxis dataKey="violation_count" name="Violations" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="risk_score" name="Risk Score" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, fontSize: 12, color: 'hsl(210,40%,92%)' }} />
              <Scatter data={filtered.slice(0, 30)}>
                {filtered.slice(0, 30).map((a, i) => (
                  <Cell key={i} fill={a.risk_level === 'Critical' ? 'hsl(0,72%,51%)' : a.risk_level === 'High' ? 'hsl(38,92%,50%)' : 'hsl(199,89%,48%)'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search accounts..." className="pl-9 bg-card border-border"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setSortBy(sortBy === 'score' ? 'violations' : 'score')}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-3 py-2 bg-card border border-border rounded-lg">
          <ArrowUpDown className="w-3 h-3" /> Sort: {sortBy === 'score' ? 'Risk Score' : 'Violations'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Account</th><th>Risk Score</th><th>Level</th><th>Violations</th><th>Structuring</th><th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 30).map(a => {
                const TrendIcon = trendIcons[a.trend];
                return (
                  <tr key={a.account_id}>
                    <td className="font-mono text-xs">{a.account_id}</td>
                    <td className="min-w-[120px]"><RiskScoreBar score={a.risk_score} /></td>
                    <td><SeverityBadge severity={a.risk_level} /></td>
                    <td className="font-mono text-xs">{a.violation_count}</td>
                    <td>{a.structuring_detected ? <span className="text-warning text-xs">⚠ Yes</span> : <span className="text-muted-foreground text-xs">No</span>}</td>
                    <td><TrendIcon className={`w-4 h-4 ${a.trend === 'up' ? 'text-destructive' : a.trend === 'down' ? 'text-primary' : 'text-muted-foreground'}`} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

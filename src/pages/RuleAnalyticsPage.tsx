import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { mockRules, mockViolations } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react';
import MetricCard from '@/components/MetricCard';

const COLORS = ['hsl(160,84%,39%)', 'hsl(199,89%,48%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)', 'hsl(262,83%,58%)', 'hsl(280,60%,50%)', 'hsl(120,60%,40%)', 'hsl(30,80%,55%)'];
const tooltipStyle = { background: 'hsl(222,47%,9%)', border: '1px solid hsl(217,33%,17%)', borderRadius: 8, fontSize: 12, color: 'hsl(210,40%,92%)' };

export default function RuleAnalyticsPage() {
  const analytics = useMemo(() => {
    const ruleStats = mockRules.map(r => {
      const violations = mockViolations.filter(v => v.rule_id === r.rule_id);
      const avgConfidence = violations.length ? Math.round(violations.reduce((s, v) => s + v.confidence, 0) / violations.length) : 0;
      const openCount = violations.filter(v => v.status === 'Open').length;
      const fpCount = violations.filter(v => v.status === 'False Positive').length;
      const fpRate = violations.length ? Math.round((fpCount / violations.length) * 100) : 0;
      return { ...r, violations: violations.length, avgConfidence, openCount, fpCount, fpRate, effectiveness: 100 - fpRate };
    });

    const totalViolations = mockViolations.length;
    const avgConfidence = Math.round(mockViolations.reduce((s, v) => s + v.confidence, 0) / totalViolations);
    const overallFpRate = Math.round((mockViolations.filter(v => v.status === 'False Positive').length / totalViolations) * 100);

    const categoryData = Object.entries(
      ruleStats.reduce((acc, r) => { acc[r.category] = (acc[r.category] || 0) + r.violations; return acc; }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    const trendData = Array.from({ length: 7 }, (_, i) => {
      const day = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i];
      const base = 20 + i * 3;
      return { day, violations: base + (i % 2 === 0 ? 5 : -3), fpRate: 12 + (i % 3) * 2 };
    });

    return { ruleStats: ruleStats.sort((a, b) => b.violations - a.violations), totalViolations, avgConfidence, overallFpRate, categoryData, trendData };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Rule Analytics & Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Performance metrics and optimization opportunities</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Triggers" value={analytics.totalViolations} icon={<Zap className="w-5 h-5" />} subtitle="Across all rules" />
        <MetricCard title="Avg Confidence" value={`${analytics.avgConfidence}%`} icon={<Target className="w-5 h-5" />} variant="success" subtitle="Detection certainty" />
        <MetricCard title="False Positive Rate" value={`${analytics.overallFpRate}%`} icon={<BarChart3 className="w-5 h-5" />} variant="warning" subtitle="Needs optimization" />
        <MetricCard title="Active Rules" value={mockRules.filter(r => r.enabled).length} icon={<TrendingUp className="w-5 h-5" />} subtitle={`of ${mockRules.length} total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-accent" /> Triggers per Rule</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.ruleStats}>
              <XAxis dataKey="rule_id" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="violations" fill="hsl(199,89%,48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-3">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={analytics.categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                {analytics.categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> Weekly Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={analytics.trendData}>
            <XAxis dataKey="day" tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215,20%,55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="violations" stroke="hsl(199,89%,48%)" strokeWidth={2} dot={{ fill: 'hsl(199,89%,48%)', r: 3 }} />
            <Line type="monotone" dataKey="fpRate" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={{ fill: 'hsl(38,92%,50%)', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-accent inline-block" />Violations</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-warning inline-block" />FP Rate %</span>
        </div>
      </motion.div>

      {/* Rule effectiveness table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold">Rule Effectiveness Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Rule</th><th>Name</th><th>Triggers</th><th>Avg Confidence</th><th>FP Rate</th><th>Effectiveness</th><th>AI Suggestion</th></tr></thead>
            <tbody>
              {analytics.ruleStats.map(r => (
                <tr key={r.rule_id}>
                  <td className="font-mono text-xs text-accent">{r.rule_id}</td>
                  <td className="text-xs">{r.rule_name}</td>
                  <td className="font-mono text-xs">{r.violations}</td>
                  <td className="font-mono text-xs">{r.avgConfidence}%</td>
                  <td className={`font-mono text-xs ${r.fpRate > 25 ? 'text-destructive' : r.fpRate > 15 ? 'text-warning' : 'text-primary'}`}>{r.fpRate}%</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${r.effectiveness}%`, background: r.effectiveness > 80 ? 'hsl(160,84%,39%)' : r.effectiveness > 60 ? 'hsl(38,92%,50%)' : 'hsl(0,72%,51%)' }} />
                      </div>
                      <span className="text-xs font-mono">{r.effectiveness}%</span>
                    </div>
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {r.fpRate > 25 ? '⚠️ Consider raising threshold' : r.fpRate > 15 ? '💡 Review edge cases' : '✅ Well calibrated'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

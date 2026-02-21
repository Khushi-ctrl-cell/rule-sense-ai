import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Database, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const [realTime, setRealTime] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoEscalate, setAutoEscalate] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">System configuration & preferences</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-accent" /> Monitoring</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm">Real-time Scanning</p><p className="text-xs text-muted-foreground">Continuously monitor incoming transactions</p></div>
              <Switch checked={realTime} onCheckedChange={setRealTime} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm">Auto-Escalation</p><p className="text-xs text-muted-foreground">Automatically escalate critical violations</p></div>
              <Switch checked={autoEscalate} onCheckedChange={setAutoEscalate} />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-accent" /> Notifications</h3>
          <div className="flex items-center justify-between">
            <div><p className="text-sm">Email Alerts</p><p className="text-xs text-muted-foreground">Send alerts for high/critical violations</p></div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-accent" /> Data Source</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Dataset</span><span>IBM AML Transactions</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Records</span><span>500 (demo)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Sync</span><span>2026-02-21 10:00 UTC</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="text-accent">Kaggle IBM AML</span></div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-accent" /> Regulatory Coverage</h3>
          <div className="space-y-2">
            {[
              { name: 'FATF Recommendations', coverage: 78 },
              { name: 'RBI AML Guidelines', coverage: 65 },
              { name: 'Basel Committee', coverage: 52 },
            ].map(r => (
              <div key={r.name}>
                <div className="flex justify-between text-xs mb-1"><span>{r.name}</span><span className="text-primary">{r.coverage}%</span></div>
                <div className="h-1.5 bg-muted rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${r.coverage}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

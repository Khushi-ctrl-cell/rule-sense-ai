import { motion } from 'framer-motion';
import { useState } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface GraphNode { id: string; x: number; y: number; risk: 'low' | 'medium' | 'high'; }
interface GraphEdge { from: string; to: string; amount: number; suspicious: boolean; }

const nodes: GraphNode[] = [
  { id: 'ACC-3201', x: 300, y: 80, risk: 'high' },
  { id: 'ACC-4521', x: 150, y: 200, risk: 'high' },
  { id: 'ACC-1893', x: 450, y: 200, risk: 'medium' },
  { id: 'ACC-7744', x: 80, y: 340, risk: 'low' },
  { id: 'ACC-2288', x: 300, y: 320, risk: 'high' },
  { id: 'ACC-5519', x: 500, y: 340, risk: 'medium' },
  { id: 'ACC-6600', x: 200, y: 440, risk: 'low' },
  { id: 'ACC-9100', x: 420, y: 440, risk: 'high' },
];

const edges: GraphEdge[] = [
  { from: 'ACC-3201', to: 'ACC-4521', amount: 49000, suspicious: true },
  { from: 'ACC-4521', to: 'ACC-2288', amount: 47500, suspicious: true },
  { from: 'ACC-2288', to: 'ACC-3201', amount: 45000, suspicious: true },
  { from: 'ACC-3201', to: 'ACC-1893', amount: 12000, suspicious: false },
  { from: 'ACC-1893', to: 'ACC-5519', amount: 8000, suspicious: false },
  { from: 'ACC-7744', to: 'ACC-4521', amount: 3000, suspicious: false },
  { from: 'ACC-2288', to: 'ACC-9100', amount: 38000, suspicious: true },
  { from: 'ACC-9100', to: 'ACC-6600', amount: 15000, suspicious: false },
  { from: 'ACC-6600', to: 'ACC-4521', amount: 14000, suspicious: true },
];

const riskColors = { low: 'hsl(160,84%,39%)', medium: 'hsl(38,92%,50%)', high: 'hsl(0,72%,51%)' };

export default function NetworkPage() {
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Network Graph Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">Detect circular transfers, layering & suspicious clusters</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-2 glass-card hover:border-primary/30"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 glass-card hover:border-primary/30"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={() => { setZoom(1); setSelected(null); }} className="p-2 glass-card hover:border-primary/30"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 lg:col-span-2 overflow-hidden">
          <svg width="100%" viewBox={`0 0 600 520`} style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }} className="transition-transform duration-300">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="hsl(215,20%,55%)" /></marker>
              <marker id="arrow-sus" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="hsl(0,72%,51%)" /></marker>
            </defs>

            {edges.map((e, i) => {
              const from = nodeMap[e.from]; const to = nodeMap[e.to];
              if (!from || !to) return null;
              const highlighted = selected === e.from || selected === e.to;
              return (
                <g key={i}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={e.suspicious ? 'hsl(0,72%,51%)' : 'hsl(215,20%,35%)'}
                    strokeWidth={highlighted ? 3 : e.suspicious ? 2 : 1}
                    opacity={selected && !highlighted ? 0.15 : e.suspicious ? 0.8 : 0.4}
                    strokeDasharray={e.suspicious ? '' : '4 4'}
                    markerEnd={e.suspicious ? 'url(#arrow-sus)' : 'url(#arrow)'} />
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6}
                    fontSize="9" fill={e.suspicious ? 'hsl(0,72%,51%)' : 'hsl(215,20%,55%)'}
                    textAnchor="middle" opacity={selected && !highlighted ? 0.15 : 0.8}>
                    ${(e.amount / 1000).toFixed(0)}k
                  </text>
                </g>
              );
            })}

            {nodes.map(n => {
              const highlighted = !selected || selected === n.id || edges.some(e => (e.from === selected && e.to === n.id) || (e.to === selected && e.from === n.id));
              return (
                <g key={n.id} onClick={() => setSelected(selected === n.id ? null : n.id)} className="cursor-pointer">
                  <circle cx={n.x} cy={n.y} r={22} fill="hsl(222,47%,9%)" stroke={riskColors[n.risk]}
                    strokeWidth={selected === n.id ? 3 : 2} opacity={highlighted ? 1 : 0.2} />
                  {n.risk === 'high' && <circle cx={n.x} cy={n.y} r={26} fill="none" stroke={riskColors[n.risk]} strokeWidth={1} opacity={highlighted ? 0.3 : 0} className="animate-pulse" />}
                  <text x={n.x} y={n.y + 3} fontSize="8" fill="hsl(210,40%,92%)" textAnchor="middle" fontFamily="monospace" opacity={highlighted ? 1 : 0.2}>
                    {n.id.split('-')[1]}
                  </text>
                  <text x={n.x} y={n.y + 38} fontSize="8" fill="hsl(215,20%,55%)" textAnchor="middle" opacity={highlighted ? 0.7 : 0.1}>{n.id}</text>
                </g>
              );
            })}
          </svg>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Network className="w-4 h-4 text-accent" /> Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: riskColors.high }} /> High Risk</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: riskColors.medium }} /> Medium Risk</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: riskColors.low }} /> Low Risk</div>
              <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-destructive" /> Suspicious Flow</div>
              <div className="flex items-center gap-2"><span className="w-6 h-0.5 border-t border-dashed border-muted-foreground" /> Normal Flow</div>
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3">Detected Patterns</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-destructive/10 border border-destructive/20 rounded">
                <p className="font-medium text-destructive">🔄 Circular Transfer</p>
                <p className="text-muted-foreground mt-0.5">ACC-3201 → ACC-4521 → ACC-2288 → ACC-3201</p>
              </div>
              <div className="p-2 bg-warning/10 border border-warning/20 rounded">
                <p className="font-medium text-warning">📊 Layering Suspected</p>
                <p className="text-muted-foreground mt-0.5">ACC-2288 → ACC-9100 → ACC-6600 → ACC-4521</p>
              </div>
            </div>
          </div>

          {selected && (
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-2">Account: {selected}</h3>
              <div className="space-y-1 text-xs">
                <p>Risk: <span className="capitalize" style={{ color: riskColors[nodeMap[selected]?.risk || 'low'] }}>{nodeMap[selected]?.risk}</span></p>
                <p>Outgoing: {edges.filter(e => e.from === selected).length} transfers</p>
                <p>Incoming: {edges.filter(e => e.to === selected).length} transfers</p>
                <p>Suspicious links: {edges.filter(e => (e.from === selected || e.to === selected) && e.suspicious).length}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

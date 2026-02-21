import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'border-border/50',
  success: 'border-primary/30',
  warning: 'border-warning/30',
  danger: 'border-destructive/30',
};

const iconVariants = {
  default: 'text-accent',
  success: 'text-primary',
  warning: 'text-warning',
  danger: 'text-destructive',
};

export default function MetricCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`metric-card ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={iconVariants[variant]}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-foreground font-mono">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
      {trend && (
        <div className={`text-xs mt-2 font-medium ${trend.value >= 0 ? 'text-destructive' : 'text-primary'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </motion.div>
  );
}

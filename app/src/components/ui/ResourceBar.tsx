import { motion } from 'framer-motion';

interface ResourceBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  showValue?: boolean;
  formatValue?: (v: number) => string;
}

export function ResourceBar({
  label,
  value,
  max,
  color,
  showValue = true,
  formatValue,
}: ResourceBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const displayValue = formatValue ? formatValue(value) : value.toFixed(0);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-ivory-muted font-display tracking-wider uppercase">
          {label}
        </span>
        {showValue && (
          <span className="font-tabular text-ivory" style={{ color }}>
            {displayValue}
          </span>
        )}
      </div>
      <div className="h-1.5 bg-navy rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

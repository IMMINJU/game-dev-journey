import { motion } from 'framer-motion';

interface ProgressBarProps {
  label: string;
  value: number; // 0-100
  maxValue?: number;
  icon?: string;
}

export const ProgressBar = ({ label, value, maxValue = 100, icon }: ProgressBarProps) => {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs font-pixel">
        <span className="flex items-center gap-1 text-[#5fcde4]">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span className="text-[#8b6eca]">{Math.round(value)}</span>
      </div>
      <div className="h-2 bg-[#1a1a2e] border border-[#5fcde4]">
        <motion.div
          className="h-full bg-[#5fcde4]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

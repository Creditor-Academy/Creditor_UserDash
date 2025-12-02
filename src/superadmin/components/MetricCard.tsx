import { LucideIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: MetricCardProps) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <div
      className="rounded-3xl p-4 md:p-6 relative overflow-hidden transition-all duration-300"
      style={{
        backgroundColor:
          theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${colors.border}`,
        boxShadow:
          theme === 'dark'
            ? '0 12px 32px rgba(0,0,0,0.4)'
            : '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <div
        className="w-12 md:w-14 h-12 md:h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
        style={{
          backgroundColor: `${color}15`,
          boxShadow: `0 0 24px ${color}40`,
        }}
      >
        <Icon size={24} style={{ color }} />
      </div>

      <p
        className="text-xs md:text-sm font-medium mb-2 transition-colors duration-300"
        style={{ color: colors.text.secondary }}
      >
        {label}
      </p>

      <p
        className="text-2xl md:text-4xl font-bold mb-4 transition-colors duration-300"
        style={{ color: colors.text.primary }}
      >
        {value}
      </p>

      <div
        className="h-1 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color}, transparent)`,
          boxShadow: `0 0 12px ${color}60`,
        }}
      ></div>
    </div>
  );
}

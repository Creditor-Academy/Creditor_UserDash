import { TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

export default function SalesCard() {
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
      <div className="flex items-start justify-between mb-4">
        <div>
          <p
            className="text-xs md:text-sm font-medium mb-2 transition-colors duration-300"
            style={{ color: colors.text.secondary }}
          >
            Latest Sales
          </p>
          <p
            className="text-2xl md:text-4xl font-bold transition-colors duration-300"
            style={{ color: colors.accent.green }}
          >
            $12,485
          </p>
        </div>
        <div
          className="w-10 md:w-12 h-10 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            backgroundColor: `${colors.accent.green}15`,
            boxShadow: `0 0 20px ${colors.accent.green}30`,
          }}
        >
          <TrendingUp size={20} style={{ color: colors.accent.green }} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <span
          className="text-xs md:text-sm font-semibold transition-colors duration-300"
          style={{ color: colors.accent.green }}
        >
          +24.5%
        </span>
        <span
          className="text-xs md:text-sm transition-colors duration-300"
          style={{ color: colors.text.tertiary }}
        >
          vs last month
        </span>
      </div>

      <div className="relative h-16 mb-4">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 50"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="salesGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: '#F4D444', stopOpacity: 0.3 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: '#F4D444', stopOpacity: 0 }}
              />
            </linearGradient>
          </defs>

          <path
            d="M 0 40 Q 50 25, 100 30 T 200 15 L 200 50 L 0 50 Z"
            fill="url(#salesGradient)"
          />

          <path
            d="M 0 40 Q 50 25, 100 30 T 200 15"
            stroke="#F4D444"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative">
        <div
          className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 0 40px rgba(77,112,255,0.4)',
            transform: 'rotate(-12deg)',
          }}
        >
          <img
            src="https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400"
            alt="Product"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

export default function ActiveUsersChart() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const dataPoints = [
    { x: 0, y1: 30, y2: 20 },
    { x: 1, y1: 45, y2: 35 },
    { x: 2, y1: 35, y2: 50 },
    { x: 3, y1: 60, y2: 45 },
    { x: 4, y1: 55, y2: 60 },
    { x: 5, y1: 75, y2: 55 },
    { x: 6, y1: 70, y2: 70 },
  ];

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const createPath = yKey => {
    const points = dataPoints
      .map((point, i) => {
        const x = (i / (dataPoints.length - 1)) * 280;
        const y = 100 - point[yKey];
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
    return points;
  };

  return (
    <div
      className="rounded-3xl p-4 md:p-6 transition-all duration-300"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <h3
          className="text-lg md:text-xl font-semibold transition-colors duration-300"
          style={{ color: colors.text.primary }}
        >
          Active Users
        </h3>

        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors.accent.yellow }}
            ></div>
            <span
              className="text-xs md:text-sm transition-colors duration-300"
              style={{ color: colors.text.secondary }}
            >
              This Week
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors.text.tertiary }}
            ></div>
            <span
              className="text-xs md:text-sm transition-colors duration-300"
              style={{ color: colors.text.secondary }}
            >
              Last Week
            </span>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: '140px', minHeight: '120px' }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 280 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: '#F4D444', stopOpacity: 0.3 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: '#F4D444', stopOpacity: 0 }}
              />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={`${createPath('y1')} L 280 100 L 0 100 Z`}
            fill="url(#gradient1)"
          />

          <path
            d={createPath('y2')}
            stroke="#C3C3C5"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />

          <path
            d={createPath('y1')}
            stroke="#F4D444"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {dataPoints.map((point, i) => {
            const x = (i / (dataPoints.length - 1)) * 280;
            const y = 100 - point.y1;

            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#FFFFFF"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(244,212,68,0.8))',
                }}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between mt-4">
        {labels.map((label, i) => (
          <span
            key={i}
            className="text-xs transition-colors duration-300"
            style={{ color: colors.text.tertiary }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

// Simple Catmull-Rom to Bezier for a smooth SVG path
const buildSmoothPath = (points, width, height, maxValue) => {
  const toCoords = (p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - (p.value / maxValue) * height;
    return { x, y };
  };

  const coords = points.map(toCoords);
  if (coords.length < 2) return '';

  let path = `M ${coords[0].x} ${coords[0].y}`;

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? i : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

export default function ActiveUsersChart() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const data = [
    { month: 'JAN', thisYear: 900, lastYear: 700 },
    { month: 'FEB', thisYear: 1500, lastYear: 1200 },
    { month: 'MAR', thisYear: 2600, lastYear: 1600 },
    { month: 'APR', thisYear: 2200, lastYear: 1800 },
    { month: 'MAY', thisYear: 1400, lastYear: 1700 },
    { month: 'JUN', thisYear: 1800, lastYear: 2100 },
    { month: 'JUL', thisYear: 1950, lastYear: 1600 },
    { month: 'AUG', thisYear: 1200, lastYear: 1400 },
    { month: 'SEP', thisYear: 1700, lastYear: 1200 },
    { month: 'OCT', thisYear: 1100, lastYear: 900 },
    { month: 'NOV', thisYear: 1300, lastYear: 2000 },
    { month: 'DEC', thisYear: 1000, lastYear: 2200 },
  ];

  const maxValue = 3000;
  const viewWidth = 360;
  const viewHeight = 220;
  const highlightIndex = 6; // JUL point

  const thisYearPath = buildSmoothPath(
    data.map(d => ({ value: d.thisYear })),
    viewWidth,
    viewHeight,
    maxValue
  );

  const lastYearPath = buildSmoothPath(
    data.map(d => ({ value: d.lastYear })),
    viewWidth,
    viewHeight,
    maxValue
  );

  const getCoord = (value, idx) => {
    const x = (idx / (data.length - 1)) * viewWidth;
    const y = viewHeight - (value / maxValue) * viewHeight;
    return { x, y };
  };

  const highlight = getCoord(data[highlightIndex].thisYear, highlightIndex);

  return (
    <div
      className="rounded-3xl p-5 md:p-6 transition-all duration-300"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <p
            className="text-xs uppercase font-semibold tracking-wide mb-1"
            style={{ color: colors.text.secondary }}
          >
            engagement
          </p>
          <h3
            className="text-lg md:text-xl font-semibold transition-colors duration-300"
            style={{ color: colors.text.primary }}
          >
            Active Users
          </h3>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex w-3 h-3 rounded-full"
              style={{ backgroundColor: '#3b82f6' }}
            />
            <span
              className="text-xs md:text-sm transition-colors duration-300"
              style={{ color: colors.text.secondary }}
            >
              This Year
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex w-3 h-3 rounded-full"
              style={{ backgroundColor: '#f97316' }}
            />
            <span
              className="text-xs md:text-sm transition-colors duration-300"
              style={{ color: colors.text.secondary }}
            >
              Last Year
            </span>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: `${viewHeight + 30}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewWidth} ${viewHeight + 30}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="blueFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="orangeFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 500, 1000, 1500, 2000, 2500, 3000].map(v => {
            const y = (1 - v / maxValue) * viewHeight;
            return (
              <line
                key={v}
                x1={0}
                x2={viewWidth}
                y1={y}
                y2={y}
                stroke={colors.border}
                strokeDasharray="4 6"
                strokeWidth="0.8"
                opacity="0.7"
              />
            );
          })}

          <path
            d={`${thisYearPath} L ${viewWidth} ${viewHeight} L 0 ${viewHeight} Z`}
            fill="url(#blueFill)"
            opacity="0.9"
          />
          <path
            d={`${lastYearPath} L ${viewWidth} ${viewHeight} L 0 ${viewHeight} Z`}
            fill="url(#orangeFill)"
            opacity="0.7"
          />

          <path
            d={lastYearPath}
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={thisYearPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.35))' }}
          />

          {data.map((d, i) => {
            const { x, y } = getCoord(d.thisYear, i);
            return (
              <circle
                key={`dot-${d.month}`}
                cx={x}
                cy={y}
                r="4.5"
                fill="#fff"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            );
          })}

          <g transform={`translate(${highlight.x}, ${highlight.y - 10})`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            <g transform="translate(-16, -30)">
              <rect
                x="0"
                y="0"
                rx="12"
                ry="12"
                width="48"
                height="24"
                fill="#3b82f6"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(59,130,246,0.35))',
                }}
              />
              <text
                x="24"
                y="16"
                textAnchor="middle"
                fontSize="11"
                fill="#fff"
                fontWeight="600"
              >
                {`${(data[highlightIndex].thisYear / 1000).toFixed(1)}K`}
              </text>
            </g>
          </g>
        </svg>

        <div
          className="absolute left-0 right-0 bottom-0 grid grid-cols-12 text-[11px] font-semibold text-center uppercase tracking-wide mt-2"
          style={{ color: colors.text.tertiary }}
        >
          {data.map(d => (
            <span key={d.month}>{d.month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

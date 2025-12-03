import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

export default function HeroPanel({ onAddOrganization }) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <div
      className="w-full rounded-3xl overflow-hidden relative transition-all duration-300"
      style={{
        background:
          theme === 'dark'
            ? 'linear-gradient(180deg, #2C2C33 0%, #1D1D21 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${colors.border}`,
        boxShadow:
          theme === 'dark'
            ? '0 22px 40px rgba(0,0,0,0.55), inset 0 -12px 20px rgba(0,0,0,0.35)'
            : '0 8px 32px rgba(0,0,0,0.08), inset 0 -4px 12px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between p-6 md:p-12 relative z-10 gap-8 lg:gap-0">
        <div className="flex-1 max-w-md text-center lg:text-left">
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 transition-colors duration-300"
            style={{ color: colors.text.primary }}
          >
            Optimize Your Metrics
          </h1>
          <p
            className="text-base md:text-lg mb-8 leading-relaxed transition-colors duration-300"
            style={{ color: colors.text.secondary }}
          >
            Harness real-time insights to drive growth, engagement, and revenue
            across all your channels.
          </p>
          <button
            onClick={onAddOrganization}
            className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #FF7A3D, #A065F4)',
              boxShadow:
                '0 0 30px rgba(255,122,61,0.25), 0 12px 24px rgba(0,0,0,0.4)',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Organization
          </button>
        </div>

        <div className="relative hidden md:block">
          <div
            className="absolute -left-20 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-50"
            style={{ backgroundColor: 'rgba(255,122,61,0.45)' }}
          ></div>
          <div
            className="absolute -right-20 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-40"
            style={{ backgroundColor: 'rgba(160,101,244,0.35)' }}
          ></div>

          <div
            className="relative w-60 h-60 md:w-80 md:h-80 rounded-full overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,122,61,0.2), rgba(160,101,244,0.2))',
              border: '2px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <img
              src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Analytics Professional"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

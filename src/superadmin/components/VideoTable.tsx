import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

interface Video {
  id: number;
  thumbnail: string;
  title: string;
  category: string;
  views: string;
  duration: string;
}

export default function VideoTable() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const videos: Video[] = [
    {
      id: 1,
      thumbnail:
        'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=300',
      title: 'Advanced Analytics Deep Dive',
      category: 'Tutorial',
      views: '24.5K',
      duration: '12:34',
    },
    {
      id: 2,
      thumbnail:
        'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=300',
      title: 'Marketing Strategy 2024',
      category: 'Business',
      views: '18.2K',
      duration: '8:42',
    },
    {
      id: 3,
      thumbnail:
        'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300',
      title: 'Data Visualization Best Practices',
      category: 'Design',
      views: '32.1K',
      duration: '15:20',
    },
    {
      id: 4,
      thumbnail:
        'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300',
      title: 'Revenue Growth Tactics',
      category: 'Sales',
      views: '41.3K',
      duration: '10:55',
    },
  ];

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
      <h3
        className="text-lg md:text-xl font-semibold mb-4 md:mb-6 transition-colors duration-300"
        style={{ color: colors.text.primary }}
      >
        Your Top Videos
      </h3>

      <div className="space-y-4">
        {videos.map(video => (
          <div
            key={video.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 md:p-4 rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-lg overflow-hidden"
            style={{
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.03)',
              border: `1px solid ${colors.border}`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor =
                theme === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor =
                theme === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.03)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div
              className="w-16 h-16 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0"
              style={{
                boxShadow:
                  theme === 'dark'
                    ? '0 4px 12px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h4
                className="font-semibold mb-2 text-base md:text-lg truncate transition-colors duration-300"
                style={{ color: colors.text.primary }}
              >
                {video.title}
              </h4>
              <span
                className="inline-block px-3 md:px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300"
                style={{
                  backgroundColor: `${colors.accent.orange}15`,
                  color: colors.accent.orange,
                }}
              >
                {video.category}
              </span>
            </div>

            <div className="flex items-center gap-4 md:gap-5 justify-between sm:justify-end flex-shrink-0">
              <div className="text-right">
                <p
                  className="text-xs mb-1 transition-colors duration-300"
                  style={{ color: colors.text.tertiary }}
                >
                  Views
                </p>
                <p
                  className="font-semibold text-sm md:text-base transition-colors duration-300"
                  style={{ color: colors.accent.yellow }}
                >
                  {video.views}
                </p>
              </div>

              <div className="text-right">
                <p
                  className="text-xs mb-1 transition-colors duration-300"
                  style={{ color: colors.text.tertiary }}
                >
                  Duration
                </p>
                <p
                  className="font-semibold text-sm md:text-base transition-colors duration-300"
                  style={{ color: colors.accent.green }}
                >
                  {video.duration}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

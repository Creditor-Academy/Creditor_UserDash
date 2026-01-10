import React from 'react';
import CLogo from '@/assets/C-logo2.png';
import { Snowflake, Sparkles, CloudSnow } from 'lucide-react';

const AthenaHeroBanner = ({ isThemeActive, userName, userProfile }) => {
  // ✅ Safe name resolution (priority-based)
  const displayName =
    userProfile?.name ||
    userName ||
    'Scholar';

  return (
    <section
      className={`athena-hero-banner mb-8 relative overflow-hidden min-h-[400px] rounded-2xl ${
        isThemeActive 
          ? 'border-2 border-blue-200/50 shadow-2xl' 
          : ''
      }`}
    >
      {/* Winter Background Image - Full Background */}
      {isThemeActive && (
        <>
          {/* Winter Background Image */}
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: "url('https://t4.ftcdn.net/jpg/02/18/23/19/240_F_218231965_tPvaUnG2U6Y7g0exxXjmE2aN1UgaDdvw.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Frost Overlay */}
          <div className="absolute inset-0 z-1 bg-gradient-to-b from-blue-100/20 via-transparent to-blue-200/30" />

          {/* Snow Overlay */}
          <div className="absolute inset-0 z-1 bg-white/5" />

          {/* Animated Snowfall - FALLING DOWN */}
          <div className="absolute inset-0 z-2 pointer-events-none overflow-hidden">
  {Array.from({ length: 30 }).map((_, i) => {
    const size = Math.random() * 6 + 3;
    const duration = Math.random() * 4 + 4;
    const delay = Math.random() * -10;
    const drift = Math.random() * 40 - 20;

    return (
      <div
        key={i}
        className="absolute rounded-full bg-white snowflake"
        style={{
          left: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          opacity: Math.random() * 0.6 + 0.3,
          animation: `snowfall ${duration}s linear ${delay}s infinite`,
          '--start-top': '-30px',
          '--end-top': '120vh', // ✅ FIX
          '--drift': `${drift}px`,
          boxShadow: '0 0 8px rgba(255,255,255,0.8)',
        }}
      />
    );
  })}
</div>



          {/* Large Snowflakes */}
          <div className="absolute inset-0 z-3 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 20 + 15}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 10}s`,
                }}
              >
                <Snowflake className="w-8 h-8 text-blue-100/80" />
              </div>
            ))}
          </div>

          {/* Sparkle Effects */}
          <div className="absolute inset-0 z-4 pointer-events-none">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `sparkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                <Sparkles className="w-6 h-6 text-blue-200/70" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Content Container with Glass Effect */}
      <div className={`relative z-10 h-full flex flex-col lg:flex-row items-center justify-between p-8 lg:p-6 ${
        isThemeActive 
          ? 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl lg:p-12' 
          : ''
      }`}>
        <div className="athena-hero-content flex-1 relative z-10">
  <p
    className={`athena-hero-kicker flex items-center gap-2 mb-3 ${
      isThemeActive
        ? 'text-slate-100 font-semibold text-lg tracking-wide drop-shadow-[0_2px_6px_rgba(255,255,255,0.35)]'
        : ''
    }`}
  >
    {isThemeActive && <Snowflake className="w-5 h-5 animate-pulse text-slate-200" />}
    <span className={isThemeActive ? "text-4xl leading-relaxed text-slate-100/95 drop-shadow-[0_2px_12px_rgba(255,255,255,0.35)]" : ""}>
    Welcome Back
    </span>
    {isThemeActive && <Sparkles className="w-4 h-4 text-cyan-200" />}
  </p>

  <h1
    className={`mb-4 ${
      isThemeActive
        ? 'text-slate-100 drop-shadow-[0_4px_16px_rgba(255,255,255,0.35)]'
        : ''
    }`}
  >
    {isThemeActive ? (
      <>
        <span className="font-extrabold tracking-tight text-slate-100">
          Welcome to{' '}
        </span>

        <span className="font-extrabold bg-gradient-to-r from-slate-100 via-white to-slate-200 bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(255,255,255,0.55)]">
          Athena LMS
        </span>

        <span className="text-slate-100 font-semibold">, </span>

        <span className="font-extrabold bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-200 bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(186,230,253,0.6)]">
          {displayName}
        </span>
        <span className="text-slate-100">!</span>
      </>
    ) : (
      `Welcome to Athena LMS, ${displayName}!`
    )}
  </h1>

  <p
  className={`mb-6 max-w-2xl`}
>
  {isThemeActive ? (
    <span className="text-lg leading-relaxed text-slate-100/95 drop-shadow-[0_2px_12px_rgba(255,255,255,0.35)]">
      Embark on a magical winter learning journey through snow-covered peaks
      of knowledge. Track your progress across frosty landscapes, unlock
      sparkling achievements in this educational wonderland, and reach new
      heights in your learning adventure.
    </span>
  ) : (
    'Your journey to knowledge excellence continues. Track your progress, unlock achievements, and reach your learning goals.'
  )}
</p>

</div>


        <div className="athena-hero-visual relative z-10 mt-8 lg:mt-0 lg:ml-8">
          <div className={`relative ${isThemeActive ? 'p-4 bg-gradient-to-br from-white/20 to-blue-100/20 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30' : ''}`}>
            {/* Logo Glow Effect */}
            {isThemeActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-300/10 rounded-2xl blur-xl -z-10" />
            )}

            <img
              src={CLogo}
              alt="Creditor Academy Logo"
              loading="lazy"
              className={`${isThemeActive ? 'w-48 h-48 object-contain filter drop-shadow-2xl' : ''}`}
            />

            {/* Winter Frame */}
            {isThemeActive && (
              <>
                <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none" />
    
                {/* Floating Snowflakes around logo */}
                <div className="absolute -top-6 left-1/4 animate-bounce">
                  <Snowflake className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-6 right-1/4 animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <Snowflake className="w-4 h-4 text-white" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
  @keyframes snowfall {
    0% {
      transform: translateY(var(--start-top, -20px)) translateX(0px);
      opacity: 0;
    }
    10% {
      opacity: 0.8;
    }
    90% {
      opacity: 0.8;
    }
    100% {
      transform: translateY(var(--end-top, 100vh)) translateX(var(--drift, 20px));
      opacity: 0;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
  }

  @keyframes sparkle {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  .snowflake {
    will-change: transform, opacity;
  }

  .athena-hero-banner {
    position: relative;
  }

  .athena-hero-content h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .athena-hero-content h1 {
      font-size: 2rem;
    }
  }

  ${isThemeActive ? `
    .progress-pill:hover, .achievement-pill:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(59, 130, 246, 0.4);
    }
  ` : ''}
`}</style>
    </section>
  );
};

export default AthenaHeroBanner;
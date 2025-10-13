import './CoreValues.css';

const CoreValues = () => {
  const values = [
    {
      title: "Innovation",
      description: "Ahead of the curve.",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      )
    },
    {
      title: "Pedagogy",
      description: "Understandable and actionable.",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 14l9-5-9-5-9 5 9 5z"/>
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
        </svg>
      )
    },
    {
      title: "Accessibility",
      description: "We build for everyone.",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
        </svg>
      )
    },
    {
      title: "Human-Centered Design",
      description: "Empathy is our starting point.",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      )
    }
  ];

  return (
    <section className="core-values">
      <div className="core-values-container">
        {/* Section Header */}
        <h2 className="core-values-header">
          Our Guiding Stars
        </h2>
        <p className="core-values-subtitle">
          These four principles are the bedrock of everything we create. They guide our strategy, design, and delivery.
        </p>

        {/* Values Grid */}
        <div className="core-values-grid">
          {values.map((value, index) => (
            <div
              key={index}
              className="core-values-card"
            >
              <div>
                {/* Icon Container */}
                <div className="core-values-icon-container">
                  <div className="core-values-icon">
                    {value.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="core-values-title">
                  {value.title}
                </h3>
                <p className="core-values-description">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValues;
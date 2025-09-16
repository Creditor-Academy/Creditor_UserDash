import React, { useEffect, useState } from "react";

function ComingSoonPopover() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const features = [
    {
      title: "Private Chat",
      description: "One‑to‑one private chats are launching to enhance direct communication and user interaction.",
      tags: [
        { label: "Private", color: "amber" },
        { label: "Chat", color: "blue" },
        { label: "Direct", color: "indigo" }
      ],
      banner: "https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/P_banner.PNG",
     
    },
    {
      title: "Scenario - Decision Tree Assessment",
      description: "We're launching scenario-decision tree based assessments for better learning experiences.",
      tags: [
        { label: "Scenario Assessment", color: "green" },
        { label: "Learning", color: "purple" }
      ],
      banner: "https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/S_banner.PNG",
     
    }
  ];

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      // Show after scrolling 30% of the page height
      if (scrolled > document.documentElement.scrollHeight * 0.3) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Trigger once in case page already scrolled
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!visible || dismissed) return;
    
    // Change feature every 5 seconds
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        // slight timeout to allow DOM to update before fading in
        setTimeout(() => setIsTransitioning(false), 20);
      }, 250);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [visible, dismissed, features.length]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  if (dismissed) return null;

  const feature = features[currentFeature];

  return (
    <div
      className={
        "fixed right-4 md:right-6 bottom-6 z-50 transition-all duration-500 " +
        (visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none")
      }
      role="dialog"
      aria-live="polite"
      aria-label="Coming soon notification"
    >
      <div className="w-[300px] rounded-2xl shadow-2xl border border-gray-200 bg-white/95 backdrop-blur-sm overflow-hidden">
        <div className={`relative h-28 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>
          <img
            src={feature.banner}
            alt={`${feature.title} preview`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/70 text-white border border-white/30 shadow backdrop-blur-sm">
            Coming Soon
          </span>
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-medium text-white">
            <span className="inline-block w-2 h-2 bg-emerald-300 rounded-full animate-pulse" /> {feature.badge}
          </span>
        </div>

        <div className="p-4">
          <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{feature.title}</h3>
            <p className="text-sm text-gray-600 mb-3">
              {feature.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {feature.tags.map((tag, index) => (
                <span 
                  key={index}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-full bg-${tag.color}-50 text-${tag.color}-700 border border-${tag.color}-100`}
                >
                  {tag.label}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex space-x-1">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (index === currentFeature) return;
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentFeature(index);
                        setTimeout(() => setIsTransitioning(false), 20);
                      }, 250);
                    }}
                    className={`w-2 h-2 rounded-full ${currentFeature === index ? 'bg-blue-600' : 'bg-gray-300'}`}
                    aria-label={`View ${features[index].title}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComingSoonPopover;
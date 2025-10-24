import React from "react";
import { HeroSectionOne } from "../components/WebsiteHero"; // Hero section
import { Carousel, Card } from "../components/apple"; // Carousel section


// ------------------------
// Dummy content for Carousel (more interactive + responsive)
// ------------------------
const DummyContent = () => {
  return (
    <>
      {[...new Array(3).fill(1)].map((_, index) => (
        <div
          key={"dummy-content" + index}
          className="relative overflow-hidden bg-[#F5F5F7] dark:bg-neutral-800 p-6 sm:p-8 md:p-12 rounded-3xl mb-4 shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-200 to-purple-200 opacity-40 blur-3xl dark:from-indigo-900 dark:to-purple-900 dark:opacity-20" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 md:gap-10">
            <div>
              <p className="text-neutral-700 dark:text-neutral-200 text-lg md:text-2xl leading-relaxed">
                <span className="font-extrabold bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                  Beautifully crafted experiences.
                </span>{" "}
                Create, iterate, and launch faster with components built for performance and accessibility. Organize ideas, document progress, and present with confidence.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm md:text-base font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400"
                  aria-label="Explore feature details"
                >
                  Learn more
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 md:h-5 md:w-5">
                    <path fillRule="evenodd" d="M4.5 12a.75.75 0 0 1 .75-.75h11.69l-3.22-3.22a.75.75 0 1 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H5.25A.75.75 0 0 1 4.5 12Z" clipRule="evenodd" />
                  </svg>
                </button>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm md:text-base font-semibold text-neutral-700 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 hover:bg-white/60 dark:hover:bg-white/5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-400"
                >
                  Contact sales
                </a>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://assets.aceternity.com/macbook.png"
                alt="Product mockup on a laptop"
                height="500"
                width="500"
                loading="lazy"
                className="h-full w-full max-h-72 md:max-h-96 object-contain mx-auto drop-shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

// ------------------------
// Carousel data
// ------------------------
const carouselData = [
  {
    category: "Design",
    title: "Custom Website Design & Branding",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent />,
  },
  {
    category: "Performance",
    title: "Fast, Mobile-Responsive Websites",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent />,
  },
  {
    category: "Product",
    title: "Optimized for Search Engines (SEO)",
    src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent />,
  },
  {
    category: "Integrations",
    title: "Seamless Tool & API Integrations",
    src: "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80&w=2515&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent />,
  },
  {
    category: "Security",
    title: "Enterprise-Grade Security & Backups",
    src: "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80&w=2793&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent />,
  },
  {
    category: "Support",
    title: "Ongoing Maintenance & Support",
    src: "https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80&w=2048&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent />,
  },
];


// ------------------------
// CardsCarousel component
// ------------------------
export function CardsCarouselSection() {
  const cards = carouselData.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <section className="relative w-full py-20 sm:py-24 bg-gray-50 dark:bg-neutral-900 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.15]" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-10%] h-80 w-80 rounded-full bg-gradient-to-bl from-pink-300 via-fuchsia-300 to-indigo-300 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
          <span className="bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 dark:from-white dark:via-neutral-200 dark:to-white bg-clip-text text-transparent">
            Explore Our Features
          </span>
        </h2>
        <p className="mt-3 sm:mt-4 text-neutral-700 dark:text-neutral-300 text-base sm:text-lg md:text-xl max-w-3xl">
          Discover how our tools help you build, optimize, and grow faster with delightful UX.
        </p>
      </div>

      <div className="relative mt-10 sm:mt-12">
        <Carousel items={cards} />
      </div>
    </section>
  );
}


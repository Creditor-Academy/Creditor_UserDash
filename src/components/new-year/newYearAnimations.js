// New Year animation utilities
// Minimal, performance-safe animations

export const createSparkles = (count = 20) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    size: 2 + Math.random() * 4,
  }));
};

// One-time confetti effect (only on first login)
export const triggerConfetti = () => {
  // Check if confetti has been shown
  const currentYear = new Date().getFullYear();
  const key = `confettiShown_${currentYear}`;
  const hasShown = localStorage.getItem(key);

  if (hasShown) return;

  // Simple confetti effect using CSS
  const confetti = document.createElement("div");
  confetti.className = "confetti-container";
  confetti.innerHTML = Array.from({ length: 50 }, () => {
    const colors = ["#f5c77a", "#0b1c2d", "#ffffff", "#4a90e2"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `<div class="confetti-piece" style="
      left: ${Math.random() * 100}%;
      background: ${color};
      animation-delay: ${Math.random() * 2}s;
      animation-duration: ${2 + Math.random() * 2}s;
    "></div>`;
  }).join("");

  document.body.appendChild(confetti);

  // Remove after animation
  setTimeout(() => {
    confetti.remove();
    localStorage.setItem(key, "true");
  }, 4000);
};

// Respect prefers-reduced-motion
export const shouldAnimate = () => {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

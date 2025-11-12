import React, { useEffect } from "react";
import { Link } from "react-router-dom"; // Optional: only if using React Router

const Sitemap = () => {
  useEffect(() => {
    document.title = "Sitemap — Athena LMS";
  }, []);

  const sections = [
    {
      title: "Main Pages",
      links: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Platform", href: "/platform/courses" },
        { label: "Pricing", href: "/pricing" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Learning & Solutions",
      links: [
        { label: "Revenue Generation", href: "/revenue_generation" },
        { label: "Customer Training", href: "/customer_training" },
        { label: "Lead Generation", href: "/lead_generation" },
        { label: "Analytics", href: "/platform/analytics" },

      ],
    },
    {
      title: "Legal & Policies",
      links: [
        { label: "Privacy Policy", href: "/privacy-athena" },
        { label: "Terms & Conditions", href: "/term-athena" },
        { label: "Cookies Policy", href: "/cookies" },
        { label: "Sitemap", href: "/sitemap" },
      ],
    },
    {
      title: "Get in Touch",
      links: [
        {
          label: "Email: admin@lmsathena.com",
          href: "mailto:admin@lmsathena.com",
        },
        { label: "Phone: +91 9811773207", href: "tel:+91 9811773207" },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#eaf5ff] text-slate-900 leading-relaxed">
      <section className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-serif leading-tight tracking-tight mb-4 text-sky-900">
            Sitemap
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Explore Athena LMS pages and resources easily through this sitemap.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {sections.map((section, index) => (
            <div key={index}>
              <h2 className="font-semibold text-slate-800 text-lg mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-sky-700 hover:underline text-base"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <footer className="mt-16 text-sm text-slate-700 border-t border-slate-300 pt-6">
          © 2025 Athena LMS. All rights reserved.
        </footer>
      </section>
    </main>
  );
};

export default Sitemap;

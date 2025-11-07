import React, { useEffect, useState } from 'react';

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'what-are-cookies', title: 'What are cookies?' },
  { id: 'types-of-cookies', title: 'Types of cookies we use' },
  { id: 'how-we-use', title: 'How we use cookies' },
  { id: 'third-party', title: 'Third-party cookies' },
  { id: 'manage-cookies', title: 'Managing cookies' },
  { id: 'consent', title: 'Your consent' },
  { id: 'changes', title: 'Changes to this policy' },
  { id: 'contact', title: 'Contact' },
];

const Cookies = () => {
  const lastUpdated = 'November 5, 2025';
  const [activeId, setActiveId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = `Cookies Policy — Athena LMS`;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToId = id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };

  const copyLink = async id => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[#eaf5ff] text-slate-900 leading-relaxed">
      <style>{`
        html { scroll-behavior: smooth; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>

      <section className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content */}
          <header className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-serif leading-tight tracking-tight mb-4 text-sky-900">
              Cookies Policy
            </h1>
            <p className="text-slate-600 mb-6">Last Updated: {lastUpdated}</p>

            <div className="flex flex-wrap gap-3 items-center mb-8 no-print">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-sky-100 hover:bg-sky-200 text-sky-800 px-3 py-2 rounded shadow-sm text-sm"
              >
                Print / Save as PDF
              </button>

              <a
                href="/privacy"
                className="text-sky-700 underline text-sm hover:text-sky-900"
              >
                View Privacy Policy
              </a>

              <a
                href="#contact"
                onClick={e => {
                  e.preventDefault();
                  scrollToId('contact');
                }}
                className="ml-auto text-sm text-sky-700 hover:underline no-print"
              >
                Jump to contact
              </a>
            </div>

            <article className="prose prose-slate max-w-none">
              <section id="overview" className="mb-10 sm:mb-12">
                <p className="text-slate-700">
                  This Cookies Policy explains how Athena LMS uses cookies and
                  similar tracking technologies on our website and services. It
                  describes the types of cookies we use, why we use them, and
                  your choices regarding cookies.
                </p>
              </section>

              <section id="what-are-cookies" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  What are cookies?
                </h2>
                <p className="text-slate-700">
                  Cookies are small text files stored on your device (computer
                  or mobile) when you visit websites. They help the site
                  remember preferences, enable core functionality, and provide
                  analytics.
                </p>
              </section>

              <section id="types-of-cookies" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Types of cookies we use
                </h2>
                <ul className="list-disc pl-6 space-y-3 text-slate-700">
                  <li>
                    <strong>Essential cookies:</strong> Required for core site
                    functions (e.g., authentication, security).
                  </li>
                  <li>
                    <strong>Preference cookies:</strong> Remember choices like
                    language or region.
                  </li>
                  <li>
                    <strong>Performance & analytics cookies:</strong> Help us
                    understand usage and improve the site.
                  </li>
                  <li>
                    <strong>Marketing cookies:</strong> Used to deliver relevant
                    ads and measure campaign effectiveness.
                  </li>
                </ul>
              </section>

              <section id="how-we-use" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  How we use cookies
                </h2>
                <ul className="list-disc pl-6 space-y-3 text-slate-700">
                  <li>
                    Keep you signed in and remember preferences for a smoother
                    experience.
                  </li>
                  <li>
                    Collect anonymous usage data to analyze and optimize the
                    platform.
                  </li>
                  <li>Support security features and fraud prevention.</li>
                  <li>
                    Deliver personalized content and advertising where
                    permitted.
                  </li>
                </ul>
              </section>

              <section id="third-party" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Third-party cookies
                </h2>
                <p className="text-slate-700 mb-3">
                  We may allow trusted third parties (analytics providers, ad
                  networks, payment processors) to set cookies on our site.
                  These third parties have their own policies and you should
                  review them for details.
                </p>
              </section>

              <section id="manage-cookies" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Managing cookies
                </h2>
                <p className="text-slate-700 mb-3">
                  Most browsers let you block or delete cookies via settings.
                  Below are general guidance links (options vary by browser):
                </p>
                <ul className="list-disc pl-6 space-y-3 text-slate-700">
                  <li>
                    Chrome: Settings → Privacy and security → Cookies and other
                    site data.
                  </li>
                  <li>
                    Firefox: Options → Privacy & Security → Cookies and Site
                    Data.
                  </li>
                  <li>Safari: Preferences → Privacy → Manage Website Data.</li>
                  <li>
                    Mobile browsers: check your browser help for cookie
                    controls.
                  </li>
                </ul>
                <p className="text-slate-700 mt-3">
                  Disabling cookies may break certain parts of the site. If you
                  use multiple devices, you will need to manage cookies on each
                  device.
                </p>
              </section>

              <section id="consent" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">Your consent</h2>
                <p className="text-slate-700">
                  By using our website without changing your browser settings,
                  you consent to our use of cookies as described here, unless
                  your browser blocks them. Where required by law we show a
                  consent banner to collect your choice.
                </p>
              </section>

              <section id="changes" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Changes to this policy
                </h2>
                <p className="text-slate-700">
                  We may revise this Cookies Policy periodically. We will post
                  the updated policy on this page and update the “Last Updated”
                  date above.
                </p>
              </section>

              <section id="contact" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">Contact</h2>
                <p className="text-slate-700">
                  If you have questions about our cookies practices, email us at{' '}
                  <a
                    href="mailto:counselor@lmsathena.com"
                    className="underline text-sky-700"
                  >
                    counselor@lmsathena.com
                  </a>
                  .
                </p>

                <address className="not-italic text-slate-700 mt-3">
                  LMSAthena
                  <br />
                  Kirkland, Washington, USA
                  <br />
                  GF-41, Omaxe Square, Jasola District Centre, New Delhi -
                  110025
                </address>

                <div className="mt-6 flex gap-3 items-center no-print">
                  <button
                    onClick={() => copyLink('contact')}
                    className="text-sm px-3 py-2 bg-sky-100 rounded hover:bg-sky-200"
                  >
                    {copied ? 'Link copied!' : 'Copy contact link'}
                  </button>
                  <a
                    href="mailto:counselor@lmsathena.com"
                    className="text-sm underline text-sky-600"
                  >
                    Email support
                  </a>
                </div>
              </section>
            </article>
          </header>

          {/* Sidebar TOC */}
          <aside className="hidden lg:block w-64 sticky top-28 self-start no-print">
            <div className="rounded-md border border-slate-100 p-4 bg-[#f7fbff]/80 backdrop-blur-sm shadow-sm">
              <div className="text-sm font-medium text-slate-800 mb-3">
                On this page
              </div>
              <ul className="space-y-2 text-sm">
                {sections.map(s => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollToId(s.id)}
                      className={`text-left w-full ${
                        activeId === s.id
                          ? 'text-sky-600 font-semibold'
                          : 'text-slate-700'
                      } hover:underline`}
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div>Last updated</div>
                <div className="mt-1 font-medium text-slate-700">
                  {lastUpdated}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Cookies;

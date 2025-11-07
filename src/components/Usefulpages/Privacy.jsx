import React, { useEffect, useState } from 'react';

const sections = [
  { id: 'who-we-are', title: 'Who we are' },
  { id: 'information-we-collect', title: 'Information we collect' },
  { id: 'how-we-use', title: 'How we use your information' },
  { id: 'cookies', title: 'Cookies and similar technologies' },
  { id: 'when-we-share', title: 'When we share information' },
  { id: 'data-security', title: 'Data security' },
  { id: 'your-rights', title: 'Your rights and choices' },
  { id: 'children', title: 'Children’s privacy' },
  { id: 'data-retention', title: 'Data retention' },
  { id: 'international', title: 'International transfers' },
  { id: 'changes', title: 'Changes to this policy' },
  { id: 'contact', title: 'Contact us' },
];

const Privacy = () => {
  const lastUpdated = 'November 5, 2025';
  const [activeId, setActiveId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = `Privacy — Athena LMS`;

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
              Athena LMS Privacy Policy
            </h1>
            <p className="text-slate-600 mb-6">Last Updated: {lastUpdated}</p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 items-center mb-8 no-print">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-sky-100 hover:bg-sky-200 text-sky-800 px-3 py-2 rounded shadow-sm text-sm"
              >
                Print / Save as PDF
              </button>
              <a
                href="/cookies"
                className="text-sky-700 underline text-sm hover:text-sky-900"
              >
                View Cookies page
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

            {/* Content */}
            <article className="prose prose-slate max-w-none">
              <section id="intro" className="mb-10 sm:mb-12">
                <p className="text-slate-700">
                  Athena LMS ("we", "our", "us") respects your privacy and is
                  committed to protecting your personal data. This Privacy
                  Policy explains what information we collect, how we use it,
                  and the choices you have. By using Athena LMS, you agree to
                  the practices described below.
                </p>
              </section>

              <section id="who-we-are" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">Who we are</h2>
                <p className="text-slate-700">
                  Athena LMS is an online learning platform that helps
                  organizations and experts create and analyze learning
                  experiences. For questions, contact us at{' '}
                  <a
                    href="mailto:counselor@lmsathena.com"
                    className="text-sky-700 underline"
                  >
                    counselor@lmsathena.com
                  </a>
                  .
                </p>
              </section>

              <section id="information-we-collect" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Information we collect
                </h2>
                <ul className="list-disc pl-6 space-y-3 text-slate-700">
                  <li>
                    <strong>Account & profile data:</strong> name, email,
                    avatar, organization, preferences.
                  </li>
                  <li>
                    <strong>Learning activity:</strong> enrollments, progress,
                    and course feedback.
                  </li>
                  <li>
                    <strong>Payment data:</strong> billing info handled by
                    secure payment processors.
                  </li>
                  <li>
                    <strong>Usage & device data:</strong> IP address, browser
                    type, and session analytics.
                  </li>
                  <li>
                    <strong>Support communications:</strong> messages and
                    attachments from user support.
                  </li>
                </ul>
              </section>

              <section id="how-we-use" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  How we use your information
                </h2>
                <ul className="list-disc pl-6 space-y-3 text-slate-700">
                  <li>Provide and maintain Athena LMS services.</li>
                  <li>Personalize learning and analytics.</li>
                  <li>Process payments and manage subscriptions.</li>
                  <li>Prevent fraud and ensure platform security.</li>
                  <li>Send important notices and feature updates.</li>
                  <li>Support customers and respond to requests.</li>
                  <li>Comply with legal requirements.</li>
                </ul>
              </section>

              <section id="cookies" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Cookies and similar technologies
                </h2>
                <p className="text-slate-700">
                  We use cookies to enhance experience, remember preferences,
                  and analyze performance. You can manage cookies via browser
                  settings. Essential cookies are required for core functions.
                </p>
              </section>

              <section id="when-we-share" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  When we share information
                </h2>
                <p className="text-slate-700 mb-3">
                  We only share necessary data with:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-slate-700">
                  <li>
                    <strong>Service providers:</strong> hosting, analytics, and
                    secure payment partners.
                  </li>
                  <li>
                    <strong>Organizations:</strong> your company or academy
                    managing your account.
                  </li>
                  <li>
                    <strong>Legal authorities:</strong> if required by law or to
                    protect users.
                  </li>
                </ul>
              </section>

              <section id="data-security" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">Data security</h2>
                <p className="text-slate-700">
                  We apply administrative and technical safeguards to protect
                  data. While no system is completely secure, we continuously
                  enhance our controls and monitoring systems.
                </p>
              </section>

              <section id="your-rights" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Your rights and choices
                </h2>
                <ul className="list-disc pl-6 space-y-3 text-slate-700">
                  <li>Access or correct your data.</li>
                  <li>Request deletion or restriction of processing.</li>
                  <li>Opt out of marketing communications.</li>
                  <li>Request data portability where applicable.</li>
                </ul>
              </section>

              <section id="children" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Children’s privacy
                </h2>
                <p className="text-slate-700">
                  Athena LMS is not designed for users under 16. If we learn
                  such data was collected, we will delete it promptly.
                </p>
              </section>

              <section id="data-retention" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">Data retention</h2>
                <p className="text-slate-700">
                  We retain personal data only as long as necessary to deliver
                  services, comply with laws, and resolve disputes.
                </p>
              </section>

              <section id="international" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  International transfers
                </h2>
                <p className="text-slate-700">
                  We may process data in other countries. All transfers follow
                  legal safeguards and standards.
                </p>
              </section>

              <section id="changes" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Changes to this policy
                </h2>
                <p className="text-slate-700">
                  We may update this Privacy Policy periodically. Revisions will
                  be posted here with a new “Last Updated” date.
                </p>
              </section>

              <section id="contact" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">Contact us</h2>
                <p className="text-slate-700">
                  For any privacy-related questions, contact us at{' '}
                  <a
                    href="mailto:counselor@lmsathena.com"
                    className="underline text-sky-700"
                  >
                    counselor@lmsathena.com
                  </a>{' '}
                  or write to:
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

export default Privacy;

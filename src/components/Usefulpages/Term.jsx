import React, { useEffect, useState } from 'react';

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'acceptance', title: 'Acceptance of terms' },
  { id: 'accounts', title: 'Accounts & registration' },
  { id: 'user-conduct', title: 'User conduct' },
  { id: 'content-ip', title: 'Content & intellectual property' },
  { id: 'payments', title: 'Payments & billing' },
  { id: 'subscriptions', title: 'Subscriptions & cancellations' },
  { id: 'termination', title: 'Termination' },
  { id: 'disclaimer', title: 'Disclaimer of warranties' },
  { id: 'limitation', title: 'Limitation of liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'governing-law', title: 'Governing law' },
  { id: 'changes', title: 'Changes to terms' },
  { id: 'contact', title: 'Contact' },
];

const Terms = () => {
  const lastUpdated = 'November 5, 2025';
  const [activeId, setActiveId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = `Terms & Conditions — Athena LMS`;

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
          {/* Main content */}
          <header className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-serif leading-tight tracking-tight mb-4 text-sky-900">
              Terms & Conditions
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
              <section id="introduction" className="mb-10 sm:mb-12">
                <p className="text-slate-700">
                  These Terms & Conditions ("Terms") govern your access to and
                  use of Athena LMS (the "Service"). By using or accessing the
                  Service, you agree to be bound by these Terms. If you do not
                  agree, please do not use the Service.
                </p>
              </section>

              <section id="acceptance" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Acceptance of terms
                </h2>
                <p className="text-slate-700">
                  By creating an account, subscribing, or otherwise using Athena
                  LMS, you accept and agree to these Terms and any policies
                  referenced herein. If you accept on behalf of an organization,
                  you represent that you have authority to bind it.
                </p>
              </section>

              <section id="accounts" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Accounts & registration
                </h2>
                <ul className="list-disc pl-6 space-y-3 text-slate-700">
                  <li>
                    You are responsible for keeping your account credentials
                    secure and for all activity under your account.
                  </li>
                  <li>
                    You must provide accurate information and update it as
                    needed.
                  </li>
                  <li>
                    Athena LMS may suspend or terminate accounts that violate
                    these Terms.
                  </li>
                </ul>
              </section>

              <section id="user-conduct" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">User conduct</h2>
                <p className="text-slate-700 mb-3">
                  While using the Service, you agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-slate-700">
                  <li>Engage in unlawful or fraudulent activities.</li>
                  <li>
                    Infringe others’ rights, upload harmful or malicious
                    content, or attempt to harm the platform.
                  </li>
                  <li>
                    Bypass technical restrictions or access data you are not
                    authorized to view.
                  </li>
                </ul>
              </section>

              <section id="content-ip" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Content & intellectual property
                </h2>
                <p className="text-slate-700">
                  All Athena LMS content and trademarks are owned by Athena or
                  its licensors. Users retain ownership of their uploaded
                  content but grant Athena a license to host, display, and
                  operate the content as necessary to provide the Service.
                </p>
              </section>

              <section id="payments" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Payments & billing
                </h2>
                <ul className="list-disc pl-6 space-y-3 text-slate-700">
                  <li>
                    Payments are handled by third-party payment processors;
                    Athena does not store full card numbers.
                  </li>
                  <li>
                    Fees are non-refundable except as required by law or as
                    otherwise stated.
                  </li>
                  <li>
                    You are responsible for taxes and accurate billing
                    information.
                  </li>
                </ul>
              </section>

              <section id="subscriptions" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Subscriptions & cancellations
                </h2>
                <p className="text-slate-700 mb-3">
                  Subscription plans, trial periods, and cancellation policies
                  are described at the point of purchase. Cancellation generally
                  takes effect at the end of the current billing period unless
                  otherwise stated.
                </p>
              </section>

              <section id="termination" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">Termination</h2>
                <p className="text-slate-700">
                  Athena may suspend or terminate access for violations of these
                  Terms or for business/technical reasons. Upon termination,
                  your access to the Service will end and Athena may delete or
                  archive your content in accordance with its retention policy.
                </p>
              </section>

              <section id="disclaimer" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Disclaimer of warranties
                </h2>
                <p className="text-slate-700">
                  THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT
                  WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. ATHENA DISCLAIMS
                  WARRANTIES TO THE MAXIMUM EXTENT PERMITTED BY LAW.
                </p>
              </section>

              <section id="limitation" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Limitation of liability
                </h2>
                <p className="text-slate-700">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, ATHENA WILL NOT BE
                  LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL
                  DAMAGES, OR LOSS OF PROFITS, DATA, OR GOODWILL ARISING OUT OF
                  YOUR USE OF THE SERVICE.
                </p>
              </section>

              <section id="indemnification" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Indemnification
                </h2>
                <p className="text-slate-700">
                  You agree to indemnify and hold Athena and its affiliates
                  harmless from any claims, liabilities, losses, and expenses
                  arising from your violation of these Terms or your use of the
                  Service.
                </p>
              </section>

              <section id="governing-law" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">Governing law</h2>
                <p className="text-slate-700">
                  These Terms are governed by the laws of the jurisdiction where
                  Athena is established, without regard to conflict-of-law
                  rules.
                </p>
              </section>

              <section id="changes" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">
                  Changes to terms
                </h2>
                <p className="text-slate-700">
                  We may modify these Terms. If changes are material, we will
                  provide notice via the Service or by other means. Continued
                  use after changes constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section id="contact" className="mt-10 sm:mt-12">
                <h2 className="font-semibold text-slate-800">Contact</h2>
                <p className="text-slate-700">
                  If you have questions about these Terms, please contact us at{' '}
                  <a
                    href="mailto:admin@lmsathena.com"
                    className="underline text-sky-700"
                  >
                    admin@lmsathena.com
                  </a>
                  .
                </p>

                <address className="not-italic text-slate-700 mt-3">
                  LMSAthena
                  <br />
                  Kirkland, Washington, USA
                  <br />
                  GF-20, Omaxe Square, Jasola District Centre, New Delhi -
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
                    href="mailto:admin@lmsathena.com"
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
                      className={`text-left w-full ${activeId === s.id ? 'text-sky-600 font-semibold' : 'text-slate-700'} hover:underline`}
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

export default Terms;

import React from 'react';
import { FaLinkedin, FaInstagram, FaFacebook, FaGithub } from 'react-icons/fa';

/**
 * Redesigned responsive footer:
 * Desktop columns (left → right): [Athena heading] [About] [Address & Phone] [Useful Links]
 * Bottom bar: [Condensed links] [© + Social icons]
 * Palette preserved. Accessibility & small typos fixed.
 */

const styles = {
  footer: {
    background: 'linear-gradient(180deg, #e3f0fc 60%, #e0f2fc 100%)',
    color: '#225e95',
    fontFamily: 'inherit',
    fontSize: '1.03rem',
    borderRadius: '16px 16px 0 0',
    overflow: 'hidden',
  },
  container: {
    display: 'flex',
    gap: 32,
    padding: '40px 64px',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  col: {
    flex: 1,
    minWidth: 200,
  },
  brand: {
    fontSize: '1.9rem',
    fontWeight: 700,
    color: '#225e95',
    marginBottom: 8,
  },
  tagline: {
    color: '#225e95',
    lineHeight: 1.45,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: '1.15rem',
    marginBottom: 10,
    color: '#225e95',
  },
  link: {
    color: '#1890d7',
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: 8,
    fontWeight: 500,
  },
  address: {
    color: '#225e95',
    lineHeight: 1.5,
  },
  bottomBar: {
    borderTop: '1px solid rgba(21,94,149,0.08)',
    padding: '14px 64px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  bottomLeft: {
    display: 'flex',
    gap: 24,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  copyright: {
    color: '#225e95',
    fontSize: '0.96rem',
  },
  socialRow: {
    display: 'flex',
    gap: 14,
    alignItems: 'center',
  },
  socialIcon: {
    color: '#1890d7',
    fontSize: '1.4rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  condensedLinks: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
};

const Footer = () => (
  <footer
    style={styles.footer}
    aria-label="Athena LMS site footer"
    className="athena-footer"
    role="contentinfo"
  >
    <style>{`
      /* Focus & hover styles for accessibility */
      .athena-footer a:focus, .athena-footer a:hover { text-decoration: underline; outline: none; }
      .athena-footer .social-anchor { transition: transform .16s ease, opacity .16s ease; opacity: 0.95; }
      .athena-footer .social-anchor:hover, .athena-footer .social-anchor:focus { transform: translateY(-3px) scale(1.06); opacity: 1; }

      /* Container width adjustments */
      .athena-footer-container { max-width: 1280px; margin: 0 auto; }

      /* Responsive layout: stack columns on small screens */
      @media (max-width: 880px) {
        .athena-footer-container { padding-left: 20px; padding-right: 20px; }
        .athena-footer .columns { padding: 28px 0; gap: 18px; }
        .athena-footer .brand-col { order: -1; }
      }

      @media (max-width: 680px) {
        .athena-footer .columns { flex-direction: column; padding: 18px 0; gap: 14px; }
        .athena-footer .columns > div { flex: 1 1 100% !important; min-width: 0 !important; }
        .athena-footer .brand-col { text-align: left; }
        .athena-footer .bottom { padding: 12px 16px; flex-direction: column-reverse; align-items: stretch; gap: 12px; }
        .athena-footer .bottom .right { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .athena-footer .bottom .left { width: 100%; }
        .athena-footer .social-anchor { font-size: 1.25rem !important; }
        .athena-footer .footer-link { font-size: 0.98rem; }
      }

      @media (max-width: 480px) {
        .athena-footer .brand { font-size: 1.6rem; }
        .athena-footer .condensed-links { flex-direction: column; align-items: flex-start; gap: 8px; }
        .athena-footer .columns { gap: 12px; }
        .athena-footer .sectionTitle { font-size: 1.05rem; }
        .athena-footer a { word-break: break-word; }
      }
    `}</style>

    <div
      className="athena-footer-container"
      style={{ maxWidth: 1280, margin: '0 auto' }}
    >
      <div className="athena-footer columns" style={styles.container}>
        {/* Column 1 - Brand / Athena heading */}
        <div className="brand-col" style={{ ...styles.col, flex: '0 0 260px' }}>
          <div className="brand" style={styles.brand}>
            Athena LMS
          </div>
          <div className="tagline" style={styles.tagline}>
            Transforming education through innovative technology and
            personalized learning experiences.
          </div>
          <div style={{ marginTop: 8 }}>
            <a href="/about" style={styles.link} className="footer-link">
              About Athena
            </a>
          </div>
        </div>

        {/* Column 2 - Office */}
        <div style={styles.col} aria-labelledby="footer-office">
          <div id="footer-office" style={styles.sectionTitle}>
            Office
          </div>
          <address style={styles.address}>
            Athena LMS
            <br />
            Kirkland, Washington, USA
            <br />
            <br />
            GF-20, Omaxe Square, Jasola District
            <br /> Centre, New Delhi - 110025
          </address>

          <div
            style={{ marginTop: 10, fontWeight: 600, pointerEvents: 'auto' }}
          >
            <a
              href="mailto:admin@lmsathena.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#225e95',
                textDecoration: 'none',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            >
              admin@lmsathena.com
            </a>
          </div>

          <div style={{ marginTop: 6, pointerEvents: 'auto' }}>
            <a
              href="tel:+919811773207"
              style={{
                color: '#225e95',
                textDecoration: 'none',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            >
              +91 9811773207
            </a>
          </div>
        </div>

        {/* Column 3 - Links */}
        <div style={styles.col} aria-labelledby="footer-links-main">
          <div id="footer-links-main" style={styles.sectionTitle}>
            Links
          </div>
          <nav aria-label="Main links">
            <div>
              <a
                href="/instructionaldesign"
                style={styles.link}
                className="footer-link"
              >
                Solutions
              </a>
            </div>
            <div>
              <a href="/contact" style={styles.link} className="footer-link">
                Contact
              </a>
            </div>
            <div>
              <a href="/website" style={styles.link} className="footer-link">
                Website
              </a>
            </div>
            <div>
              <a href="/pricing" style={styles.link} className="footer-link">
                Pricing
              </a>
            </div>
          </nav>
        </div>

        {/* Column 4 - Useful Links */}
        <div
          style={{ ...styles.col, flex: '0 0 220px' }}
          aria-labelledby="footer-links"
        >
          <div id="footer-links" style={styles.sectionTitle}>
            Useful Links
          </div>
          <nav aria-label="Useful links">
            <div>
              <a
                href="/term-athena"
                style={styles.link}
                className="footer-link"
              >
                Terms
              </a>
            </div>
            <div>
              <a
                href="/privacy-athena"
                style={styles.link}
                className="footer-link"
              >
                Privacy
              </a>
            </div>
            <div>
              <a href="/cookies" style={styles.link} className="footer-link">
                Cookies
              </a>
            </div>
            <div>
              <a href="/sitemap" style={styles.link} className="footer-link">
                Sitemap
              </a>
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="athena-footer bottom" style={styles.bottomBar}>
        <div style={styles.bottomLeft} className="left">
          <nav
            className="condensed-links"
            aria-label="footer quick links"
            style={styles.condensedLinks}
          >
            <a href="/privacy-athena" style={styles.link}>
              Privacy
            </a>
            <a href="/term-athena" style={styles.link}>
              Terms
            </a>
            <a href="/cookies" style={styles.link}>
              Cookies
            </a>
          </nav>
        </div>

        <div
          className="right"
          style={{ display: 'flex', alignItems: 'center', gap: 18 }}
        >
          <div style={styles.copyright}>
            © 2025 Athena LMS. All rights reserved.
          </div>

          <div style={styles.socialRow} aria-label="social links">
            <a
              className="social-anchor"
              href="https://www.linkedin.com/company/lmsathena/ "
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              style={styles.socialIcon}
            >
              <FaLinkedin />
            </a>
            <a
              className="social-anchor"
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              style={styles.socialIcon}
            >
              <FaInstagram />
            </a>
            <a
              className="social-anchor"
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              style={styles.socialIcon}
            >
              <FaFacebook />
            </a>
            {/* <a
              className="social-anchor"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              style={styles.socialIcon}
            >
              <FaGithub />
            </a> */}
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

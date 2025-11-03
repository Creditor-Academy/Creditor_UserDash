'use client';
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SolutionsDropdown from './SolutionsDropdown';
import PlatformDropdown from './PlatformDropdown';

const Navbar = () => {
  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // Navbar background on scroll
      setIsScrolled(currentScroll > 10);

      // Hide/show navbar on scroll
      if (currentScroll <= 0) {
        setShow(true);
        setLastScroll(0);
        return;
      }

      if (currentScroll > lastScroll && currentScroll > 80) {
        // Scrolling Down
        setShow(false);
      } else {
        // Scrolling Up
        setShow(true);
      }
      setLastScroll(currentScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [drawerOpen]);

  return (
    <>
      <nav
        className="athena-navbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isScrolled ? 'rgba(111, 164, 247, 0.95)' : '#6fa4f7',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          padding: '12px 24px',
          fontFamily: 'inherit',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: 'all 0.3s ease',
          transform: show ? 'translateY(0)' : 'translateY(-130%)',
          opacity: show ? 1 : 0,
          boxShadow: isScrolled
            ? '0 4px 20px rgba(0, 0, 0, 0.1)'
            : '0 4px 16px 0 rgba(0,0,0,0.06)',
          pointerEvents: show ? 'auto' : 'none',
        }}
      >
        <Link
          to="/"
          style={{
            fontWeight: 'bold',
            fontSize: '1.8rem',
            color: '#fff',
            letterSpacing: '0.5px',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          ATHENA LMS
        </Link>

        <button
          aria-label="Menu"
          className="athena-menu-btn"
          onClick={() => setDrawerOpen(true)}
        >
          ☰
        </button>

        <div
          className="athena-links"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
            position: 'relative',
          }}
        >
          <Link to="/about" style={navLinkStyle}>
            About Us
          </Link>
          <SolutionsDropdown />
          <PlatformDropdown />
          <Link to="/website" style={navLinkStyle}>
            Website
          </Link>
          <Link to="/pricing" style={navLinkStyle}>
            Pricing
          </Link>
          <Link to="/contact" style={navLinkStyle}>
            Contact Us
          </Link>
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              navigate('/login');
            }}
            style={{
              background: '#fff',
              color: '#3182f6',
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              textDecoration: 'none',
              marginLeft: '12px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.target.style.background = '#f0f7ff';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.target.style.background = '#fff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Login
          </a>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`athena-drawer ${drawerOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: '20px',
          right: 0,
          bottom: '20px',
          width: 'min(85vw, 300px)',
          maxWidth: '300px',
          minWidth: '280px',
          background: 'linear-gradient(180deg, #7fb3ff 0%, #6fa4f7 100%)',
          boxShadow: '-10px 0 24px rgba(0,0,0,0.12)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          zIndex: 120,
          padding: '16px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          color: '#fff',
          overflowY: 'auto',
          borderRadius: '12px 0 0 12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <div
            style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: 0.5 }}
          >
            Menu
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.25)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: 6,
              padding: '3px 6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              minWidth: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <Link
          to="/about"
          style={drawerLinkStyle}
          onClick={() => setDrawerOpen(false)}
        >
          About Us
        </Link>
        <div style={drawerLinkStyle}>Solutions</div>
        <div style={drawerLinkStyle}>Platform</div>
        <Link
          to="/website"
          style={drawerLinkStyle}
          onClick={() => setDrawerOpen(false)}
        >
          Website
        </Link>
        <Link
          to="/pricing"
          style={drawerLinkStyle}
          onClick={() => setDrawerOpen(false)}
        >
          Pricing
        </Link>
        <Link
          to="/contact"
          style={drawerLinkStyle}
          onClick={() => setDrawerOpen(false)}
        >
          Contact Us
        </Link>

        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            navigate('/login');
            setDrawerOpen(false);
          }}
          style={{
            background: '#fff',
            color: '#3182f6',
            borderRadius: '8px',
            padding: '8px 12px',
            border: 'none',
            marginTop: '8px',
            textAlign: 'center',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '0.95rem',
            display: 'block',
            cursor: 'pointer',
          }}
        >
          Login
        </a>
      </div>

      {/* Backdrop overlay for drawer */}
      {drawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 110,
          }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .athena-navbar { 
            padding: 10px 16px; 
            border-radius: 14px; 
            left: 10px; 
            right: 10px; 
          }
          .athena-links { 
            display: none !important; 
          }
          .athena-menu-btn { 
            display: inline-flex !important; 
          }
        }
        
        @media (max-width: 600px) {
          .athena-navbar { 
            padding: 10px 14px; 
            top: 0 !important; 
            left: 0 !important;
            right: 0 !important;
            border-radius: 0 !important;
          }
          .athena-navbar div:first-child {
            font-size: 1.5rem;
          }
        }
        
        /* Mobile Drawer Responsive Styles */
        @media (max-width: 480px) {
          .athena-drawer {
            width: min(90vw, 280px) !important;
            max-width: 280px !important;
            min-width: 260px !important;
            padding: 14px 10px !important;
            top: 15px !important;
            bottom: 15px !important;
          }
        }
        
        @media (max-width: 360px) {
          .athena-drawer {
            width: min(95vw, 260px) !important;
            max-width: 260px !important;
            min-width: 240px !important;
            padding: 12px 8px !important;
            top: 12px !important;
            bottom: 12px !important;
          }
        }
        
        @media (max-width: 320px) {
          .athena-drawer {
            width: 95vw !important;
            max-width: 95vw !important;
            min-width: 95vw !important;
            padding: 10px 6px !important;
            top: 10px !important;
            bottom: 10px !important;
          }
        }
        
        .athena-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.25);
          border: 1px solid rgba(255,255,255,0.6);
          color: #fff;
          border-radius: 10px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.2s ease;
        }
        
        .athena-menu-btn:hover {
          background: rgba(255,255,255,0.4);
        }
        
        /* Keep navbar fixed on top */
        .athena-navbar {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 1000 !important;
          border-radius: 0 !important;
          overflow: visible !important;
        }
        
        /* Ensure dropdowns can extend beyond navbar */
        .athena-links {
          overflow: visible !important;
        }
        
        /* Allow full-width dropdowns */
        .athena-navbar {
          overflow: visible !important;
        }
        
        /* Drawer content optimization */
        .athena-drawer {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.3) transparent;
        }
        
        .athena-drawer::-webkit-scrollbar {
          width: 4px;
        }
        
        .athena-drawer::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .athena-drawer::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
        }
      `}</style>
    </>
  );
};

const navLinkStyle = {
  color: '#fff',
  fontWeight: '600',
  fontSize: '1.1rem',
  textDecoration: 'none',
  transition: 'all 0.2s ease',
  padding: '6px 0',
  position: 'relative',
};

const drawerLinkStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontWeight: '600',
  padding: '8px 6px',
  borderBottom: '1px solid rgba(255,255,255,0.15)',
  fontSize: '0.95rem',
  transition: 'all 0.2s ease',
  borderRadius: '6px',
  margin: '1px 0',
};

// Add hover effects
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .athena-links a:not(:last-child):hover {
      color: #e0f0ff;
    }
    .athena-links a:not(:last-child)::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: #e0f0ff;
      transition: width 0.3s ease;
    }
    .athena-links a:not(:last-child):hover::after {
      width: 100%;
    }
    .athena-drawer a:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
    }
  `;
  document.head.appendChild(style);
}

export default Navbar;

import React from "react";
import { FaLinkedin, FaInstagram, FaFacebook, FaGithub, FaTiktok } from "react-icons/fa";

const Footer = () => (
  <footer style={{
    background: "linear-gradient(180deg, #e3f0fc 60%, #e0f2fc 100%)",
    color: "#225e95",
    fontFamily: "inherit",
    fontSize: "1.07rem",
    borderRadius: "16px 16px 0 0",
    overflow: "hidden",
  }}>
    {/* Top Footer Section */}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: "48px 60px 24px 60px",
      flexWrap: "wrap",
    }}>
      {/* Company */}
      <div style={{ flex: "2", minWidth: 260 }}>
        <div style={{ fontWeight: "bold", fontSize: "2rem", color: "#225e95", marginBottom: 12 }}>
          Athena LMS
        </div>
        <div style={{ color: "#225e95", marginBottom: 20, lineHeight: 1.5 }}>
          Transforming education through innovative technology and personalized learning experiences.
        </div>
        <div style={{ fontWeight: 'bold', marginBottom: 2 }}>LMSAthena</div>
        Kirkland Washington, USA<br /><br />
        GF-41, Omaxe Square, Jasola District Centre<br />
        New Delhi-25<br /><br />
        <a href="mailto:counselor@lmsathena.com" style={{ color: "#1b70fc", fontWeight: 600, textDecoration: "none" }}>
          counselor@lmsathena.com
        </a>
        <br />+91 9818238969
        <div style={{ marginTop: 14, display: "flex", alignItems: "center" }}>
          <span style={{
            height: ".9em", width: ".9em", borderRadius: "50%", background: "#1bdb58",
            display: "inline-block", marginRight: 6
          }}></span>
          Monday - Friday: 9:00 AM to 5:00 PM EST
        </div>
      </div>
      {/* Solutions */}
      <div style={{ flex: "1", minWidth: 200 }}>
        <div style={{
          fontWeight: 'bold', fontSize: "1.3rem", marginBottom: 12, borderBottom: "3px solid #57a7e8", width: "fit-content"
        }}>
          Solutions
        </div>
        <div style={{ marginBottom: 8 }}>Virtual Classroom</div>
        <div style={{ marginBottom: 8 }}>Collaboration</div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "#435cd2", fontWeight: "bold" }}>&#8594; Analytics</span>
        </div>
        <div style={{ marginBottom: 8 }}>Content Management</div>
      </div>
      {/* About */}
      <div style={{ flex: "1", minWidth: 200 }}>
        <div style={{
          fontWeight: 'bold', fontSize: "1.3rem", marginBottom: 12, borderBottom: "3px solid #57a7e8", width: "fit-content"
        }}>
          About
        </div>
        <div style={{ marginBottom: 8 }}>Contact</div>
        <div style={{ marginBottom: 8 }}>Careers</div>
        <div style={{ marginBottom: 8 }}>Our Team</div>
        <div style={{ marginBottom: 8 }}>Press</div>
      </div>
      {/* Locations and Language */}
      <div style={{ flex: "1", minWidth: 200 }}>
        <div style={{
          fontWeight: 'bold', fontSize: "1.3rem", marginBottom: 12, borderBottom: "3px solid #57a7e8", width: "fit-content"
        }}>
          Locations
        </div>
        <div style={{ marginBottom: 8 }}>All Locations</div>
        <div style={{ marginBottom: 8 }}>Remote</div>
        <div style={{ fontWeight: 'bold', marginTop: 22, marginBottom: 6 }}>
          Language
        </div>
        {/* Simple language dropdown mock */}
        <div style={{
          border: "1.5px solid #88b7e8", borderRadius: "10px", display: "flex",
          alignItems: "center", padding: "6px 12px", maxWidth: 140, cursor: "pointer", color: "#225e95"
        }}>
          <span role="img" aria-label="globe" style={{ marginRight: 7 }}>🌐</span>
          English
          <span style={{ marginLeft: "auto", marginRight: 0, fontSize: "1.2em" }}>▼</span>
        </div>
      </div>
    </div>
    {/* Middle Subscribe Box */}
    <div style={{
      background: "#e9f7ff",
      padding: "32px 0",
      borderTop: "1.5px solid #bee7fc",
      borderBottom: "1.5px solid #bee7fc",
      textAlign: "center"
    }}>
      <div style={{ fontWeight: "bold", fontSize: "1.25rem", color: "#225e95", marginBottom: 6 }}>
        Stay updated with Athena LMS
      </div>
      <div style={{ marginBottom: 18 }}>
        Subscribe to our newsletter for the latest updates and features
      </div>
      <form style={{ display: "flex", justifyContent: "center", alignItems: "center", maxWidth: 540, margin: "0 auto" }}
        onSubmit={e => e.preventDefault()}>
        <input
          type="email"
          placeholder="Your email address"
          style={{
            flex: 1,
            fontSize: "1rem",
            padding: "13px 16px",
            border: "1.5px solid #b2cef1",
            borderRadius: "8px 0 0 8px",
            outline: "none"
          }}
        />
        <button style={{
          background: "#1890d7",
          color: "#fff",
          fontWeight: "bold",
          border: "none",
          padding: "13px 40px",
          fontSize: "1rem",
          borderRadius: "0 8px 8px 0",
          cursor: "pointer"
        }}>
          Subscribe
        </button>
      </form>
    </div>
    {/* Bottom Links & Copyright */}
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px 0 16px 0",
      color: "#225e95"
    }}>
      <div style={{ marginBottom: 10 }}>
        © 2025 Athena LMS. All rights reserved.
      </div>
      <div style={{ marginBottom: 12 }}>
        <a href="/" style={{ color: "#1890d7", margin: "0 10px", fontSize: "2rem", verticalAlign: "middle" }} aria-label="LinkedIn"><FaLinkedin /></a>
        <a href="/" style={{ color: "#1890d7", margin: "0 10px", fontSize: "2rem", verticalAlign: "middle" }} aria-label="Instagram"><FaInstagram /></a>
        <a href="/" style={{ color: "#1890d7", margin: "0 10px", fontSize: "2rem", verticalAlign: "middle" }} aria-label="Facebook"><FaFacebook /></a>
        <a href="/" style={{ color: "#1890d7", margin: "0 10px", fontSize: "2rem", verticalAlign: "middle" }} aria-label="GitHub"><FaGithub /></a>
        <a href="/" style={{ color: "#1890d7", margin: "0 10px", fontSize: "2rem", verticalAlign: "middle" }} aria-label="TikTok"><FaTiktok /></a>
      </div>
      <div>
        <a href="/" style={footerLink}>Privacy</a>
        <a href="/" style={footerLink}>Terms</a>
        <a href="/" style={footerLink}>Cookies</a>
        <a href="/" style={footerLink}>Sitemap</a>
      </div>
    </div>
  </footer>
);

const footerLink = {
  color: "#1890d7",
  margin: "0 16px",
  fontSize: "1.05rem",
  textDecoration: "none",
  fontWeight: 500
};

export default Footer;

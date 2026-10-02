import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Certificates from "./Certificates";
import AdminDashboard from "./AdminDashboard";
import ScrollReveal from "./ScrollReveal";

const cssAnimations = `
  html, body { margin: 0; padding: 0; background-color: #121212; color: #f5f5f5; font-family: 'Helvetica Neue', Arial, sans-serif; overflow-x: hidden; }
  .ds-theme { background-color: #121212; min-height: 100vh; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  .page-transition { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .scroll-reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
  .scroll-reveal.is-visible { opacity: 1; transform: translateY(0); }

  .ds-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 4rem; position: sticky; top: 0; z-index: 1000; background-color: rgba(18, 18, 18, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid #333; width: 100%; box-sizing: border-box; }
  .ds-nav-link { text-decoration: none; color: #888; font-size: 0.85rem; letter-spacing: 2px; text-transform: uppercase; transition: color 0.3s; }
  .ds-nav-link:hover, .ds-nav-link.active { color: #fff; }

  .ds-hero-container { display: flex; flex-direction: row; gap: 4rem; align-items: center; padding: 6rem 2rem 4rem 2rem; max-width: 1200px; margin: 0 auto; }
  .ds-hero-left { flex: 1; } .ds-hero-right { flex: 1; }
  .ds-hero-title { font-size: 2.8rem; font-weight: 500; line-height: 1.3; margin: 0 0 1.2rem 0; color: #fff; letter-spacing: -0.5px; }
  .ds-hero-subtitle { font-size: 1.1rem; color: #888; line-height: 1.6; margin: 0; }
  .ds-title { font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 500; line-height: 1.3; margin: 0; color: #fff; letter-spacing: -1px; }

  .ds-marquee-wrapper { width: 100%; border-top: 1px solid #333; border-bottom: 1px solid #333; padding: 2.5rem 0; overflow: hidden; background: #121212; display: flex; align-items: center; }
  .ds-marquee-content { display: flex; gap: 5rem; padding-right: 5rem; align-items: center; animation: marquee 25s linear infinite; }
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

  /* UKURAN FONT JUDUL PROJECT DIPERKECIL DI SINI (Dari 2.2rem menjadi 1.6rem) */
  .ds-project-title { font-size: 1.6rem; font-weight: 500; text-transform: uppercase; margin: 0 0 1rem 0; letter-spacing: 1px; }
  .ds-tags { font-size: 0.75rem; color: #aaa; text-transform: uppercase; letter-spacing: 2px; line-height: 2; white-space: pre-line; }
  
  .ds-btn-outline { display: inline-block; padding: 0.8rem 2rem; border: 1px solid #555; background: transparent; color: #fff; font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.3s; border-radius: 4px; }
  .ds-btn-outline:hover { border-color: #fff; background: #fff; color: #000; }

  .ds-project-row { display: flex; flex-direction: row; border-bottom: 1px solid #333; padding: 5rem 0; gap: 4rem; }
  .ds-project-info { width: 30%; display: flex; flex-direction: column; justify-content: space-between; }
  .ds-project-image-wrapper { width: 70%; }
  .ds-project-image { width: 100%; border-radius: 12px; object-fit: cover; aspect-ratio: 16/9; transition: transform 0.5s; }
  .ds-project-image:hover { transform: scale(1.02); }

  @media (max-width: 900px) {
    .ds-hero-container { flex-direction: column; padding: 4rem 2rem 2rem 2rem; gap: 2rem; text-align: left; } 
    .ds-hero-title { font-size: 2.2rem; }
    .ds-project-row { flex-direction: column; padding: 3rem 0; gap: 2rem; }
    .ds-project-info { width: 100%; gap: 2rem; }
    .ds-project-image-wrapper { width: 100%; }
    .ds-header { padding: 1.5rem 2rem; flex-direction: column; gap: 1rem; }
  }
`;

const getEmbeddablePdfLink = (url) => {
  if (!url) return "";
  if (url.includes("drive.google.com/file/d/")) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1])
      return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url;
};
const getDriveImageUrl = (url) => {
  if (!url) return "";
  if (url.includes("drive.google.com/file/d/")) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1])
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
};

export default function App() {
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [skills, setSkills] = useState([]);
  const [aboutData, setAboutData] = useState({
    name: "",
    nickname: "Riziq",
    role: "Data Scientist",
    photo_url: "",
    hero_photo_url: "",
    description: "",
    skills: "",
    contact: "",
  });

  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: projData } = await supabase
      .from("ds_projects")
      .select("*")
      .order("sort_order", { ascending: true });
    if (projData) setProjects(projData);

    const { data: aboutRes } = await supabase
      .from("ds_about_me")
      .select("*")
      .eq("id", 1)
      .single();
    if (aboutRes) setAboutData(aboutRes);

    const { data: certData } = await supabase
      .from("ds_certificates")
      .select("*")
      .order("sort_order", { ascending: true });
    if (certData) setCertificates(certData);

    const { data: skillData } = await supabase
      .from("ds_skills")
      .select("*")
      .order("sort_order", { ascending: true });
    if (skillData) setSkills(skillData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const Header = () => (
    <header className="ds-header">
      <div
        style={{
          color: "#fff",
          fontSize: "1.2rem",
          fontWeight: "bold",
          letterSpacing: "4px",
          textTransform: "uppercase",
        }}
      >
        {aboutData.nickname || "RIZIQ"}
      </div>
      <div style={{ display: "flex", gap: "2.5rem" }}>
        <a
          href="#/"
          className={`ds-nav-link ${currentHash === "" || currentHash === "#/" ? "active" : ""}`}
        >
          Project
        </a>
        <a
          href="#/about"
          className={`ds-nav-link ${currentHash === "#/about" ? "active" : ""}`}
        >
          About
        </a>
        <a
          href="#/certificates"
          className={`ds-nav-link ${currentHash === "#/certificates" ? "active" : ""}`}
        >
          Certificates
        </a>
      </div>
    </header>
  );

  const Footer = () => (
    <footer
      style={{
        padding: "4rem 2rem",
        borderTop: "1px solid #333",
        marginTop: "4rem",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#fff" }}>
        Let's Talk.
      </h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "3rem",
          marginBottom: "2rem",
        }}
      >
        <a
          href="https://www.instagram.com/mrsa.ziq/"
          target="_blank"
          rel="noreferrer"
          className="ds-nav-link"
        >
          Instagram
        </a>
        <a
          href="https://www.linkedin.com/in/m-riziq-sa"
          target="_blank"
          rel="noreferrer"
          className="ds-nav-link"
        >
          LinkedIn
        </a>
        <a href="mailto:riziq.sirfatullah@gmail.com" className="ds-nav-link">
          Email
        </a>
      </div>
      <p style={{ fontSize: "0.8rem", color: "#666", letterSpacing: "1px" }}>
        © 2026 {aboutData.name}. All rights reserved.
      </p>
    </footer>
  );

  if (loading)
    return (
      <div
        style={{
          padding: "4rem",
          textAlign: "center",
          background: "#121212",
          color: "#fff",
          minHeight: "100vh",
        }}
      >
        Memuat data...
      </div>
    );

  if (currentHash === "#/certificates")
    return (
      <Certificates
        Header={Header}
        Footer={Footer}
        certificates={certificates}
        cssAnimations={cssAnimations}
      />
    );

  // --- HALAMAN HOME ---
  if (currentHash === "" || currentHash === "#/") {
    return (
      <div className="page-transition ds-theme">
        <style>{cssAnimations}</style>
        <Header />
        <ScrollReveal>
          <div className="ds-hero-container">
            <div className="ds-hero-left">
              <h1 className="ds-hero-title">
                Hii, my name is {aboutData.nickname || "Riziq"} and I love Data.
              </h1>
              <p className="ds-hero-subtitle">
                Exploring Data. Building Intelligent Solutions.
              </p>
            </div>
            <div className="ds-hero-right">
              {aboutData.hero_photo_url || aboutData.photo_url ? (
                <img
                  src={aboutData.hero_photo_url || aboutData.photo_url}
                  alt="Profile"
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    aspectRatio: "4/3",
                    objectFit: "cover",
                    border: "1px solid #333",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "4/3",
                    background: "#1a1a1a",
                    borderRadius: "12px",
                    border: "1px solid #333",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                  }}
                >
                  Upload Foto Hero di Admin
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {projects.map((proj) => (
              <ScrollReveal key={proj.id}>
                <div className="ds-project-row">
                  <div className="ds-project-info">
                    <div>
                      <h2 className="ds-project-title">{proj.title}</h2>
                      <div className="ds-tags">
                        {proj.tags
                          ? proj.tags.replace(/,/g, "\n")
                          : "DATA SCIENCE\nANALYSIS"}
                      </div>
                    </div>
                    <div>
                      <button
                        className="ds-btn-outline"
                        onClick={() => {
                          setActiveProject(proj);
                          window.location.hash = `#/project/${proj.id}`;
                        }}
                      >
                        View Project
                      </button>
                    </div>
                  </div>
                  <div className="ds-project-image-wrapper">
                    <img
                      className="ds-project-image"
                      src={getDriveImageUrl(proj.img_url)}
                      alt={proj.title}
                    />
                  </div>
                </div>
              </ScrollReveal>
            ))}
            {projects.length === 0 && (
              <p
                style={{ textAlign: "center", color: "#888", padding: "4rem" }}
              >
                No projects to display yet.
              </p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // --- HALAMAN ABOUT ME ---
  if (currentHash === "#/about") {
    return (
      <div className="page-transition ds-theme">
        <style>{cssAnimations}</style>
        <Header />
        <div
          style={{ maxWidth: "1000px", margin: "0 auto", padding: "4rem 2rem" }}
        >
          <ScrollReveal>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "5rem",
                flexWrap: "wrap",
                gap: "4rem",
              }}
            >
              <div style={{ flex: "1", minWidth: "300px" }}>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    marginBottom: "1rem",
                  }}
                >
                  {aboutData.role}
                </p>
                <h1
                  className="ds-title"
                  style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
                >
                  {aboutData.name}
                </h1>
              </div>
              <div style={{ width: "400px", flexShrink: 0 }}>
                {aboutData.photo_url ? (
                  <img
                    src={aboutData.photo_url}
                    alt="Profile"
                    style={{
                      width: "100%",
                      aspectRatio: "4/5",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "4/5",
                      background: "#222",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                    }}
                  >
                    No Image
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div
              style={{
                borderTop: "1px solid #333",
                paddingTop: "3rem",
                marginBottom: "4rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "2rem",
              }}
            >
              <div style={{ width: "200px" }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Background
                </h3>
              </div>
              <div style={{ flex: "1", minWidth: "300px" }}>
                <p
                  style={{
                    fontSize: "1.4rem",
                    lineHeight: "1.6",
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {aboutData.description}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {skills.length > 0 && (
            <ScrollReveal>
              <div
                className="ds-marquee-wrapper"
                style={{
                  marginBottom: "4rem",
                  borderRadius: "8px",
                  border: "1px solid #333",
                }}
              >
                <div className="ds-marquee-content">
                  {[...skills, ...skills].map((sk, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        opacity: 0.7,
                        filter: "grayscale(100%)",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = 1;
                        e.currentTarget.style.filter = "grayscale(0%)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = 0.7;
                        e.currentTarget.style.filter = "grayscale(100%)";
                      }}
                    >
                      <img
                        src={sk.logo_url}
                        alt={sk.name}
                        style={{ height: "40px", objectFit: "contain" }}
                      />
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "1rem",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        {sk.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal>
            <div
              style={{
                borderTop: "1px solid #333",
                paddingTop: "3rem",
                marginBottom: "4rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "2rem",
              }}
            >
              <div style={{ width: "200px" }}>
                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    fontSize: "1rem",
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Skills & Tools
                </h3>
              </div>
              <div style={{ flex: "1", minWidth: "300px" }}>
                <p
                  style={{
                    fontSize: "1.2rem",
                    lineHeight: "1.8",
                    margin: 0,
                    color: "#ccc",
                    whiteSpace: "pre-line",
                    marginBottom: "2rem",
                  }}
                >
                  {aboutData.skills}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <Footer />
      </div>
    );
  }

  // --- HALAMAN DETAIL PROJECT ---
  if (currentHash.startsWith("#/project/")) {
    if (!activeProject) {
      window.location.hash = "#/";
      return null;
    }
    return (
      <div className="page-transition ds-theme">
        <style>{cssAnimations}</style>
        <Header />
        <div
          style={{
            padding: "4rem 2rem",
            maxWidth: "1200px",
            margin: "0 auto",
            minHeight: "80vh",
          }}
        >
          <button
            className="ds-btn-outline"
            onClick={() => (window.location.hash = "#/")}
            style={{ marginBottom: "4rem" }}
          >
            &larr; Back to Project
          </button>
          <ScrollReveal>
            <h1 className="ds-title" style={{ marginBottom: "1rem" }}>
              {activeProject.title}
            </h1>
            <p
              style={{
                fontSize: "1.2rem",
                color: "#aaa",
                marginBottom: "4rem",
                maxWidth: "800px",
                lineHeight: "1.6",
              }}
            >
              {activeProject.description}
            </p>
          </ScrollReveal>
          {activeProject.link_url && (
            <ScrollReveal>
              <a
                href={activeProject.link_url}
                target="_blank"
                rel="noreferrer"
                className="ds-btn-outline"
                style={{ marginBottom: "4rem" }}
              >
                Launch External Project ↗
              </a>
            </ScrollReveal>
          )}
          <ScrollReveal>
            {activeProject.pdf_url ? (
              <div
                style={{
                  width: "100%",
                  height: "85vh",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <iframe
                  src={getEmbeddablePdfLink(activeProject.pdf_url)}
                  width="100%"
                  height="100%"
                  allow="autoplay"
                  style={{ border: "none" }}
                  title={`PDF ${activeProject.title}`}
                ></iframe>
              </div>
            ) : (
              <div
                style={{
                  padding: "4rem",
                  textAlign: "center",
                  background: "#1a1a1a",
                  borderRadius: "12px",
                  border: "1px solid #333",
                  color: "#666",
                }}
              >
                PDF report not available for this project.
              </div>
            )}
          </ScrollReveal>
        </div>
        <Footer />
      </div>
    );
  }

  if (currentHash === "#/admin" && !isLoggedIn) {
    const handleLogin = (e) => {
      e.preventDefault();
      if (
        e.target.username.value === "mrsa.ziq" &&
        e.target.password.value === "portofolio/aden17!"
      )
        setIsLoggedIn(true);
      else alert("Username atau password salah!");
    };
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#121212",
          fontFamily: "sans-serif",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: "#1a1a1a",
            border: "1px solid #333",
            padding: "3rem",
            borderRadius: "8px",
            boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            width: "90%",
            maxWidth: "300px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              color: "#fff",
              fontWeight: "500",
            }}
          >
            DS Admin
          </h2>
          <input
            name="username"
            type="text"
            placeholder="Username"
            required
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              background: "#121212",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "4px",
            }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            style={{
              marginBottom: "2rem",
              padding: "1rem",
              background: "#121212",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "4px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "1rem",
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            LOGIN
          </button>
        </form>
      </div>
    );
  }

  if (currentHash === "#/admin" && isLoggedIn) {
    return (
      <AdminDashboard
        projects={projects}
        certificates={certificates}
        skills={skills}
        fetchData={fetchData}
        aboutData={aboutData}
      />
    );
  }

  return (
    <div
      style={{
        padding: "4rem",
        textAlign: "center",
        background: "#121212",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      Page not found.{" "}
      <a href="#/" style={{ color: "#fff" }}>
        Return Home
      </a>
    </div>
  );
}

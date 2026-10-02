import React from "react";
import ScrollReveal from "./ScrollReveal";

const getEmbeddablePdfLink = (url) => {
  if (!url) return "";
  if (url.includes("drive.google.com/file/d/")) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1])
      return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return url;
};

export default function Certificates({
  Header,
  Footer,
  certificates,
  cssAnimations,
}) {
  const isPdf = (url) =>
    url.toLowerCase().includes(".pdf") ||
    (url.includes("drive.google.com") && !url.includes("uc?export"));

  return (
    <div className="page-transition ds-theme">
      <style>{cssAnimations}</style>
      <Header />
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 2rem 4rem 2rem",
          minHeight: "80vh",
        }}
      >
        <ScrollReveal>
          <h1
            className="ds-title"
            style={{ textAlign: "center", marginBottom: "4rem" }}
          >
            Our Certifications.
          </h1>
        </ScrollReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "2rem",
          }}
        >
          {certificates.map((cert) => (
            <ScrollReveal key={cert.id} style={{ height: "100%" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  border: "1px solid #333",
                  padding: "2rem",
                  backgroundColor: "#1a1a1a",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.6rem",
                    color: "#fff",
                    marginBottom: "0.5rem",
                  }}
                >
                  {cert.title}
                </h2>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#888",
                    marginBottom: "1.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                  }}
                >
                  {cert.organizer}
                </p>
                <div
                  style={{
                    width: "100%",
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {isPdf(cert.file_url) ? (
                    <div
                      style={{
                        width: "100%",
                        height: "400px",
                        border: "1px solid #444",
                        overflow: "hidden",
                      }}
                    >
                      <iframe
                        src={getEmbeddablePdfLink(cert.file_url)}
                        width="100%"
                        height="100%"
                        style={{ border: "none" }}
                        title={cert.title}
                      ></iframe>
                    </div>
                  ) : (
                    <img
                      className="img-hover"
                      src={cert.file_url}
                      alt={cert.title}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        {certificates.length === 0 && (
          <p style={{ textAlign: "center", color: "#888" }}>
            Belum ada sertifikat.
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
}

import React, { useState, useRef } from "react";
import { supabase } from "./supabase";

export default function AdminDashboard({
  projects,
  certificates,
  skills,
  fetchData,
  aboutData,
}) {
  const emptyProjForm = {
    id: null,
    title: "",
    description: "",
    tags: "",
    img_url: "",
    pdf_url: "",
    link_url: "",
  };
  const emptyCertForm = { id: null, title: "", organizer: "", file_url: "" };
  const emptySkillForm = { id: null, name: "", logo_url: "" };

  const [form, setForm] = useState(emptyProjForm);
  const [certForm, setCertForm] = useState(emptyCertForm);
  const [skillForm, setSkillForm] = useState(emptySkillForm);
  const [aboutForm, setAboutForm] = useState(aboutData);

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isEditingCert, setIsEditingCert] = useState(false);
  const [isEditingSkill, setIsEditingSkill] = useState(false);

  const [activeTab, setActiveTab] = useState("projects");
  const [isSaving, setIsSaving] = useState(false);

  const [selectedAboutImage, setSelectedAboutImage] = useState(null);
  const [selectedHeroImage, setSelectedHeroImage] = useState(null);
  const [selectedProjectImage, setSelectedProjectImage] = useState(null);
  const [selectedSkillImage, setSelectedSkillImage] = useState(null);

  const dragProjItem = useRef(null);
  const dragProjOverItem = useRef(null);
  const dragCertItem = useRef(null);
  const dragCertOverItem = useRef(null);
  const dragSkillItem = useRef(null);
  const dragSkillOverItem = useRef(null);

  // --- HANDLER PROJECTS ---
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalImgUrl = form.img_url;
      if (selectedProjectImage) {
        const fileExt = selectedProjectImage.name.split(".").pop();
        const fileName = `ds_project_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, selectedProjectImage);
        if (uploadError)
          throw new Error("Gagal upload gambar: " + uploadError.message);
        finalImgUrl = supabase.storage.from("images").getPublicUrl(fileName)
          .data.publicUrl;
      }

      const projectDataToSave = { ...form, img_url: finalImgUrl };

      if (isEditingProject) {
        const { error } = await supabase
          .from("ds_projects")
          .update(projectDataToSave)
          .eq("id", projectDataToSave.id);
        if (error) throw new Error(error.message);
        alert("Project berhasil diperbarui!");
      } else {
        // Mengeluarkan 'id' agar Supabase tidak menolak data
        const { id, ...newProject } = projectDataToSave;
        newProject.sort_order = projects.length;
        const { error } = await supabase
          .from("ds_projects")
          .insert([newProject]);
        if (error) throw new Error(error.message);
        alert("Project baru berhasil ditambahkan!");
      }
      setForm(emptyProjForm);
      setSelectedProjectImage(null);
      setIsEditingProject(false);
      fetchData();
    } catch (err) {
      alert("TERJADI KESALAHAN: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Yakin ingin menghapus project ini?")) {
      await supabase.from("ds_projects").delete().eq("id", id);
      fetchData();
    }
  };

  const handleDragEndProject = async () => {
    if (
      dragProjItem.current === null ||
      dragProjOverItem.current === null ||
      dragProjItem.current === dragProjOverItem.current
    )
      return;
    const newProjects = [...projects];
    const draggedItem = newProjects.splice(dragProjItem.current, 1)[0];
    newProjects.splice(dragProjOverItem.current, 0, draggedItem);
    dragProjItem.current = null;
    dragProjOverItem.current = null;
    setIsSaving(true);
    await Promise.all(
      newProjects.map((proj, i) =>
        supabase
          .from("ds_projects")
          .update({ sort_order: i })
          .eq("id", proj.id),
      ),
    );
    setIsSaving(false);
    fetchData();
  };

  // --- HANDLER CERTIFICATES ---
  const handleCertSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditingCert) {
        const { error } = await supabase
          .from("ds_certificates")
          .update(certForm)
          .eq("id", certForm.id);
        if (error) throw new Error(error.message);
        alert("Sertifikat berhasil diperbarui!");
      } else {
        const { id, ...newCert } = certForm;
        newCert.sort_order = certificates.length;
        const { error } = await supabase
          .from("ds_certificates")
          .insert([newCert]);
        if (error) throw new Error(error.message);
        alert("Sertifikat baru berhasil ditambahkan!");
      }
      setCertForm(emptyCertForm);
      setIsEditingCert(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCert = async (id) => {
    if (window.confirm("Yakin hapus sertifikat?")) {
      await supabase.from("ds_certificates").delete().eq("id", id);
      fetchData();
    }
  };

  const handleDragEndCert = async () => {
    if (
      dragCertItem.current === null ||
      dragCertOverItem.current === null ||
      dragCertItem.current === dragCertOverItem.current
    )
      return;
    const newCerts = [...certificates];
    const draggedItem = newCerts.splice(dragCertItem.current, 1)[0];
    newCerts.splice(dragCertOverItem.current, 0, draggedItem);
    dragCertItem.current = null;
    dragCertOverItem.current = null;
    setIsSaving(true);
    await Promise.all(
      newCerts.map((cert, i) =>
        supabase
          .from("ds_certificates")
          .update({ sort_order: i })
          .eq("id", cert.id),
      ),
    );
    setIsSaving(false);
    fetchData();
  };

  // --- HANDLER SKILLS ---
  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalLogoUrl = skillForm.logo_url;
      if (selectedSkillImage) {
        const fileExt = selectedSkillImage.name.split(".").pop();
        const fileName = `ds_skill_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, selectedSkillImage);
        if (uploadError) throw new Error(uploadError.message);
        finalLogoUrl = supabase.storage.from("images").getPublicUrl(fileName)
          .data.publicUrl;
      }
      const skillDataToSave = { ...skillForm, logo_url: finalLogoUrl };

      if (isEditingSkill) {
        const { error } = await supabase
          .from("ds_skills")
          .update(skillDataToSave)
          .eq("id", skillDataToSave.id);
        if (error) throw new Error(error.message);
        alert("Skill berhasil diperbarui!");
      } else {
        const { id, ...newSkill } = skillDataToSave;
        newSkill.sort_order = skills.length;
        const { error } = await supabase.from("ds_skills").insert([newSkill]);
        if (error) throw new Error(error.message);
        alert("Skill baru berhasil ditambahkan!");
      }
      setSkillForm(emptySkillForm);
      setSelectedSkillImage(null);
      setIsEditingSkill(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (window.confirm("Yakin hapus skill?")) {
      await supabase.from("ds_skills").delete().eq("id", id);
      fetchData();
    }
  };

  const handleDragEndSkill = async () => {
    if (
      dragSkillItem.current === null ||
      dragSkillOverItem.current === null ||
      dragSkillItem.current === dragSkillOverItem.current
    )
      return;
    const newSkills = [...skills];
    const draggedItem = newSkills.splice(dragSkillItem.current, 1)[0];
    newSkills.splice(dragSkillOverItem.current, 0, draggedItem);
    dragSkillItem.current = null;
    dragSkillOverItem.current = null;
    setIsSaving(true);
    await Promise.all(
      newSkills.map((sk, i) =>
        supabase.from("ds_skills").update({ sort_order: i }).eq("id", sk.id),
      ),
    );
    setIsSaving(false);
    fetchData();
  };

  // --- HANDLER ABOUT ME ---
  const handleAboutSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalPhotoUrl = aboutForm.photo_url;
      let finalHeroUrl = aboutForm.hero_photo_url;

      if (selectedAboutImage) {
        const fileExt = selectedAboutImage.name.split(".").pop();
        const fileName = `ds_profile_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage
          .from("images")
          .upload(fileName, selectedAboutImage);
        if (error) throw new Error("Gagal upload foto about: " + error.message);
        finalPhotoUrl = supabase.storage.from("images").getPublicUrl(fileName)
          .data.publicUrl;
      }

      if (selectedHeroImage) {
        const fileExt = selectedHeroImage.name.split(".").pop();
        const fileName = `ds_hero_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage
          .from("images")
          .upload(fileName, selectedHeroImage);
        if (error) throw new Error("Gagal upload foto hero: " + error.message);
        finalHeroUrl = supabase.storage.from("images").getPublicUrl(fileName)
          .data.publicUrl;
      }

      const { error } = await supabase
        .from("ds_about_me")
        .update({
          ...aboutForm,
          photo_url: finalPhotoUrl,
          hero_photo_url: finalHeroUrl,
        })
        .eq("id", 1);

      if (error) throw new Error(error.message);

      setSelectedAboutImage(null);
      setSelectedHeroImage(null);
      fetchData();
      alert("Halaman About Me berhasil diperbarui!");
    } catch (err) {
      alert("Kesalahan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- STYLING ---
  const adminStyle = {
    background: "#121212",
    color: "#f5f5f5",
    minHeight: "100vh",
    padding: "2rem",
    fontFamily: "sans-serif",
  };
  const inputStyle = {
    padding: "0.8rem",
    border: "1px solid #333",
    borderRadius: "4px",
    width: "100%",
    background: "#121212",
    color: "#fff",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const btnStyle = {
    padding: "1rem 2rem",
    background: "#fff",
    color: "#000",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    borderRadius: "4px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };
  const btnCancelStyle = {
    padding: "1rem",
    background: "transparent",
    color: "#fff",
    border: "1px solid #555",
    cursor: "pointer",
    borderRadius: "4px",
  };
  const btnActionStyle = {
    padding: "0.5rem 1rem",
    background: "transparent",
    color: "#fff",
    border: "1px solid #555",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "0.8rem",
  };
  const btnDeleteStyle = {
    padding: "0.5rem 1rem",
    background: "#8b0000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "0.8rem",
  };

  return (
    <div style={adminStyle}>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "#1a1a1a",
          padding: "2rem",
          borderRadius: "8px",
          border: "1px solid #333",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ fontWeight: "500", margin: 0 }}>DS Admin Panel</h2>
          <a
            href="#/"
            style={{
              textDecoration: "none",
              color: "#fff",
              border: "1px solid #555",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              fontSize: "0.9rem",
            }}
          >
            &larr; Back to Website
          </a>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            borderBottom: "1px solid #333",
            paddingBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setActiveTab("projects")}
            style={{
              padding: "0.5rem 1.5rem",
              cursor: "pointer",
              background: activeTab === "projects" ? "#fff" : "transparent",
              color: activeTab === "projects" ? "#000" : "#888",
              border: "1px solid #555",
              borderRadius: "20px",
              fontWeight: activeTab === "projects" ? "bold" : "normal",
            }}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            style={{
              padding: "0.5rem 1.5rem",
              cursor: "pointer",
              background: activeTab === "skills" ? "#fff" : "transparent",
              color: activeTab === "skills" ? "#000" : "#888",
              border: "1px solid #555",
              borderRadius: "20px",
              fontWeight: activeTab === "skills" ? "bold" : "normal",
            }}
          >
            Skills Ticker
          </button>
          <button
            onClick={() => setActiveTab("about")}
            style={{
              padding: "0.5rem 1.5rem",
              cursor: "pointer",
              background: activeTab === "about" ? "#fff" : "transparent",
              color: activeTab === "about" ? "#000" : "#888",
              border: "1px solid #555",
              borderRadius: "20px",
              fontWeight: activeTab === "about" ? "bold" : "normal",
            }}
          >
            About Me
          </button>
          <button
            onClick={() => setActiveTab("certificates")}
            style={{
              padding: "0.5rem 1.5rem",
              cursor: "pointer",
              background: activeTab === "certificates" ? "#fff" : "transparent",
              color: activeTab === "certificates" ? "#000" : "#888",
              border: "1px solid #555",
              borderRadius: "20px",
              fontWeight: activeTab === "certificates" ? "bold" : "normal",
            }}
          >
            Certificates
          </button>
        </div>

        {activeTab === "projects" && (
          <div>
            <form
              onSubmit={handleProjectSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
                background: "#121212",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #333",
              }}
            >
              <input
                type="text"
                placeholder="Judul Project"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Deskripsi Singkat"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Tags / Kategori (Contoh: PYTHON, EDA, ML)"
                value={form.tags || ""}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                style={inputStyle}
              />
              <div
                style={{
                  border: "1px dashed #555",
                  padding: "1.5rem",
                  background: "#1a1a1a",
                  borderRadius: "4px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    color: "#aaa",
                  }}
                >
                  Upload Gambar Project (Landscape):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedProjectImage(e.target.files[0])}
                  style={{ display: "block", color: "#fff" }}
                  required={!form.img_url}
                />
                {form.img_url && !selectedProjectImage && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#4caf50",
                      marginTop: "0.5rem",
                    }}
                  >
                    ✓ Gambar sudah terpasang.
                  </p>
                )}
              </div>
              <input
                type="url"
                placeholder="Link Google Drive PDF (Opsional)"
                value={form.pdf_url || ""}
                onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
                style={inputStyle}
              />
              <input
                type="url"
                placeholder="Link Eksternal Web/Colab (Opsional)"
                value={form.link_url || ""}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" disabled={isSaving} style={btnStyle}>
                  {isSaving ? "Saving..." : "Save Project"}
                </button>
                {isEditingProject && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm(emptyProjForm);
                      setIsEditingProject(false);
                    }}
                    style={btnCancelStyle}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "2rem",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#222",
                    textAlign: "left",
                    borderBottom: "1px solid #333",
                  }}
                >
                  <th style={{ padding: "1rem", width: "50px" }}>Pos</th>
                  <th style={{ padding: "1rem" }}>Judul</th>
                  <th style={{ padding: "1rem", width: "200px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj, index) => (
                  <tr
                    key={proj.id}
                    draggable
                    onDragStart={() => (dragProjItem.current = index)}
                    onDragEnter={() => (dragProjOverItem.current = index)}
                    onDragEnd={handleDragEndProject}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      borderBottom: "1px solid #333",
                      cursor: "grab",
                      background: "#1a1a1a",
                    }}
                  >
                    <td
                      style={{
                        padding: "1rem",
                        color: "#666",
                        textAlign: "center",
                        fontSize: "1.2rem",
                      }}
                    >
                      ☰
                    </td>
                    <td style={{ padding: "1rem", color: "#eee" }}>
                      {proj.title}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() => {
                          setForm(proj);
                          setIsEditingProject(true);
                          window.scrollTo(0, 0);
                        }}
                        style={btnActionStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        style={btnDeleteStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "skills" && (
          <div>
            <form
              onSubmit={handleSkillSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
                background: "#121212",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #333",
              }}
            >
              <input
                type="text"
                placeholder="Nama Skill (Contoh: Python, SQL)"
                value={skillForm.name}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, name: e.target.value })
                }
                required
                style={inputStyle}
              />
              <div
                style={{
                  border: "1px dashed #555",
                  padding: "1.5rem",
                  background: "#1a1a1a",
                  borderRadius: "4px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    color: "#aaa",
                  }}
                >
                  Upload Logo Skill (Disarankan PNG Transparan):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedSkillImage(e.target.files[0])}
                  style={{ display: "block", color: "#fff" }}
                  required={!skillForm.logo_url}
                />
                {skillForm.logo_url && !selectedSkillImage && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#4caf50",
                      marginTop: "0.5rem",
                    }}
                  >
                    ✓ Gambar sudah terpasang.
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" disabled={isSaving} style={btnStyle}>
                  {isSaving ? "Saving..." : "Save Skill"}
                </button>
                {isEditingSkill && (
                  <button
                    type="button"
                    onClick={() => {
                      setSkillForm(emptySkillForm);
                      setIsEditingSkill(false);
                    }}
                    style={btnCancelStyle}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "2rem",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#222",
                    textAlign: "left",
                    borderBottom: "1px solid #333",
                  }}
                >
                  <th style={{ padding: "1rem", width: "50px" }}>Pos</th>
                  <th style={{ padding: "1rem" }}>Logo</th>
                  <th style={{ padding: "1rem" }}>Nama</th>
                  <th style={{ padding: "1rem", width: "200px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((sk, index) => (
                  <tr
                    key={sk.id}
                    draggable
                    onDragStart={() => (dragSkillItem.current = index)}
                    onDragEnter={() => (dragSkillOverItem.current = index)}
                    onDragEnd={handleDragEndSkill}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      borderBottom: "1px solid #333",
                      cursor: "grab",
                      background: "#1a1a1a",
                    }}
                  >
                    <td
                      style={{
                        padding: "1rem",
                        color: "#666",
                        textAlign: "center",
                        fontSize: "1.2rem",
                      }}
                    >
                      ☰
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <img
                        src={sk.logo_url}
                        alt={sk.name}
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "contain",
                        }}
                      />
                    </td>
                    <td style={{ padding: "1rem", color: "#eee" }}>
                      {sk.name}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() => {
                          setSkillForm(sk);
                          setIsEditingSkill(true);
                          window.scrollTo(0, 0);
                        }}
                        style={btnActionStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(sk.id)}
                        style={btnDeleteStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "certificates" && (
          <div>
            <form
              onSubmit={handleCertSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
                background: "#121212",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #333",
              }}
            >
              <input
                type="text"
                placeholder="Nama Sertifikat"
                value={certForm.title}
                onChange={(e) =>
                  setCertForm({ ...certForm, title: e.target.value })
                }
                required
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Penyelenggara"
                value={certForm.organizer}
                onChange={(e) =>
                  setCertForm({ ...certForm, organizer: e.target.value })
                }
                required
                style={inputStyle}
              />
              <input
                type="url"
                placeholder="Link URL / Drive"
                value={certForm.file_url}
                onChange={(e) =>
                  setCertForm({ ...certForm, file_url: e.target.value })
                }
                required
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="submit" disabled={isSaving} style={btnStyle}>
                  {isSaving ? "Saving..." : "Save Certificate"}
                </button>
                {isEditingCert && (
                  <button
                    type="button"
                    onClick={() => {
                      setCertForm(emptyCertForm);
                      setIsEditingCert(false);
                    }}
                    style={btnCancelStyle}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "2rem",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#222",
                    textAlign: "left",
                    borderBottom: "1px solid #333",
                  }}
                >
                  <th style={{ padding: "1rem", width: "50px" }}>Pos</th>
                  <th style={{ padding: "1rem" }}>Judul</th>
                  <th style={{ padding: "1rem", width: "200px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert, index) => (
                  <tr
                    key={cert.id}
                    draggable
                    onDragStart={() => (dragCertItem.current = index)}
                    onDragEnter={() => (dragCertOverItem.current = index)}
                    onDragEnd={handleDragEndCert}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      borderBottom: "1px solid #333",
                      cursor: "grab",
                      background: "#1a1a1a",
                    }}
                  >
                    <td
                      style={{
                        padding: "1rem",
                        color: "#666",
                        textAlign: "center",
                        fontSize: "1.2rem",
                      }}
                    >
                      ☰
                    </td>
                    <td style={{ padding: "1rem", color: "#eee" }}>
                      {cert.title}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() => {
                          setCertForm(cert);
                          setIsEditingCert(true);
                          window.scrollTo(0, 0);
                        }}
                        style={btnActionStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCert(cert.id)}
                        style={btnDeleteStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "about" && (
          <form
            onSubmit={handleAboutSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
          >
            <input
              placeholder="Nama Lengkap"
              value={aboutForm.name}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, name: e.target.value })
              }
              required
              style={inputStyle}
            />
            <input
              placeholder="Nama Panggilan"
              value={aboutForm.nickname || ""}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, nickname: e.target.value })
              }
              required
              style={inputStyle}
            />
            <input
              placeholder="Role (Data Scientist)"
              value={aboutForm.role || ""}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, role: e.target.value })
              }
              required
              style={inputStyle}
            />

            {/* AREA UPLOAD DIBUAT DUA */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <div
                style={{
                  flex: 1,
                  border: "1px dashed #555",
                  padding: "1.5rem",
                  background: "#1a1a1a",
                  borderRadius: "4px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    color: "#aaa",
                  }}
                >
                  Upload Foto Project / Home:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedHeroImage(e.target.files[0])}
                  style={{ display: "block", color: "#fff" }}
                />
                {aboutForm.hero_photo_url && !selectedHeroImage && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#4caf50",
                      marginTop: "0.5rem",
                    }}
                  >
                    ✓ Gambar Hero terpasang.
                  </p>
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  border: "1px dashed #555",
                  padding: "1.5rem",
                  background: "#1a1a1a",
                  borderRadius: "4px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                    color: "#aaa",
                  }}
                >
                  Upload Foto About Me:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedAboutImage(e.target.files[0])}
                  style={{ display: "block", color: "#fff" }}
                />
                {aboutForm.photo_url && !selectedAboutImage && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#4caf50",
                      marginTop: "0.5rem",
                    }}
                  >
                    ✓ Gambar About terpasang.
                  </p>
                )}
              </div>
            </div>

            <textarea
              placeholder="Background / Description"
              value={aboutForm.description}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, description: e.target.value })
              }
              required
              style={{ ...inputStyle, height: "120px" }}
            />
            <textarea
              placeholder="Skills & Tools"
              value={aboutForm.skills}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, skills: e.target.value })
              }
              required
              style={{ ...inputStyle, height: "100px" }}
            />
            <textarea
              placeholder="Contact Information"
              value={aboutForm.contact}
              onChange={(e) =>
                setAboutForm({ ...aboutForm, contact: e.target.value })
              }
              required
              style={{ ...inputStyle, height: "100px" }}
            />
            <button
              type="submit"
              disabled={isSaving}
              style={{ ...btnStyle, width: "max-content", marginTop: "1rem" }}
            >
              {isSaving ? "Saving..." : "Save About Me"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

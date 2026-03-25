"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Profile,
  ContactEntry,
  EducationEntry,
  ExperienceEntry,
  EarlierExperienceEntry,
} from "@/lib/resumeEditor/schema";

function emptyProfile(): Profile {
  return {
    name: { first: "", last: "" },
    title: "",
    contact: [],
    about: [],
    education: [],
    professional_development: [],
    skills: "",
    experience: [],
    earlier_experience: [],
  };
}

function emptyContact(): ContactEntry {
  return { label: "", url: "", type: "web" };
}
function emptyEducation(): EducationEntry {
  return { dates: "", institution: "", degree: "", details: "" };
}
function emptyExperience(): ExperienceEntry {
  return { company: "", dates: "", location: "", title: "", description: "" };
}
function emptyEarlier(): EarlierExperienceEntry {
  return { company: "", title: "", dates: "" };
}

export default function ProfileEditor() {
  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [profileName, setProfileName] = useState("");
  const [profiles, setProfiles] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [status, setStatus] = useState("");

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/laboratory/profiles");
    const names = await res.json();
    setProfiles(names);
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const loadProfile = async () => {
    if (!selectedProfile) return;
    const res = await fetch(`/api/laboratory/profiles/${selectedProfile}`);
    if (!res.ok) { setStatus("Profile not found"); return; }
    const data = await res.json();
    setProfile(data);
    setProfileName(selectedProfile);
    setStatus(`Loaded "${selectedProfile}"`);
  };

  const saveProfile = async () => {
    const name = profileName.trim();
    if (!name) { setStatus("Enter a profile name first"); return; }
    const res = await fetch("/api/laboratory/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, data: profile }),
    });
    if (res.ok) { setStatus(`Saved "${name}"`); refreshList(); }
    else setStatus("Save failed");
  };

  const deleteProfile = async () => {
    const name = profileName.trim();
    if (!name || !confirm(`Delete profile "${name}"?`)) return;
    await fetch(`/api/laboratory/profiles/${name}`, { method: "DELETE" });
    setStatus(`Deleted "${name}"`);
    setProfile(emptyProfile());
    setProfileName("");
    refreshList();
  };

  const downloadPDF = async () => {
    setStatus("Generating PDF...");
    const res = await fetch("/api/laboratory/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) { setStatus("Generation failed"); return; }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const first = profile.name.first.replace(/\./g, "").replace(/ /g, "-").toLowerCase();
    const last = profile.name.last.replace(/ /g, "-").toLowerCase();
    const pName = profileName.trim() || "profile";
    a.download = `${first}-${last}-${pName}-resume.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus("PDF downloaded");
  };

  const previewPDF = async () => {
    setStatus("Generating preview...");
    const res = await fetch("/api/laboratory/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) { setStatus("Generation failed"); return; }
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), "_blank");
    setStatus("Preview opened");
  };

  // ── Update helpers ──────────────────────────────────────────────────
  const updateName = (key: "first" | "last", value: string) => {
    setProfile((p) => ({ ...p, name: { ...p.name, [key]: value } }));
  };

  const updateContact = (index: number, field: keyof ContactEntry, value: string) => {
    setProfile((p) => {
      const contact = [...p.contact];
      contact[index] = { ...contact[index], [field]: value } as ContactEntry;
      return { ...p, contact };
    });
  };

  const removeItem = (key: keyof Profile, index: number) => {
    setProfile((p) => {
      const arr = [...(p[key] as unknown[])];
      arr.splice(index, 1);
      return { ...p, [key]: arr };
    });
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    setProfile((p) => {
      const education = [...p.education];
      education[index] = { ...education[index], [field]: value };
      return { ...p, education };
    });
  };

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string) => {
    setProfile((p) => {
      const experience = [...p.experience];
      experience[index] = { ...experience[index], [field]: value };
      return { ...p, experience };
    });
  };

  const updateEarlier = (index: number, field: keyof EarlierExperienceEntry, value: string) => {
    setProfile((p) => {
      const earlier_experience = [...p.earlier_experience];
      earlier_experience[index] = { ...earlier_experience[index], [field]: value };
      return { ...p, earlier_experience };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4">
        <h1 className="text-xl font-semibold">Resume Editor</h1>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b px-6 py-3 flex flex-wrap items-center gap-2">
        <select
          className="border rounded px-2 py-1.5 text-sm"
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
        >
          <option value="">— Select Profile —</option>
          {profiles.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button onClick={loadProfile} className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300">Load</button>
        <input
          className="border rounded px-2 py-1.5 text-sm w-40"
          placeholder="Profile name"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
        />
        <button onClick={saveProfile} className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded hover:bg-gray-700">Save</button>
        <button onClick={downloadPDF} className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded hover:bg-gray-700">Download PDF</button>
        <button onClick={previewPDF} className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300">Preview</button>
        <button onClick={() => { setProfile(emptyProfile()); setProfileName(""); setStatus("New profile"); }} className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300">New</button>
        <button onClick={deleteProfile} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
      </div>
      {status && <div className="px-6 py-2 text-sm text-gray-500">{status}</div>}

      {/* Form */}
      <div className="max-w-3xl mx-auto p-6 space-y-4">

        {/* Name & Title */}
        <Section title="Name & Title">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" value={profile.name.first} onChange={(v) => updateName("first", v)} />
            <Field label="Last Name" value={profile.name.last} onChange={(v) => updateName("last", v)} />
          </div>
          <Field label="Title / Headline" value={profile.title} onChange={(v) => setProfile((p) => ({ ...p, title: v }))} />
        </Section>

        {/* Contact */}
        <Section title="Contact" onAdd={() => setProfile((p) => ({ ...p, contact: [...p.contact, emptyContact()] }))}>
          {profile.contact.map((c, i) => (
            <Entry key={i} onRemove={() => removeItem("contact", i)}>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Label" value={c.label} onChange={(v) => updateContact(i, "label", v)} />
                <Field label="URL" value={c.url} onChange={(v) => updateContact(i, "url", v)} />
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
                  <select className="w-full border rounded px-2 py-1.5 text-sm" value={c.type} onChange={(e) => updateContact(i, "type", e.target.value)}>
                    <option value="web">Web</option>
                    <option value="email">Email</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
              </div>
            </Entry>
          ))}
        </Section>

        {/* About */}
        <Section title="About" onAdd={() => setProfile((p) => ({ ...p, about: [...p.about, ""] }))}>
          {profile.about.map((text, i) => (
            <Entry key={i} onRemove={() => removeItem("about", i)}>
              <textarea
                className="w-full border rounded px-2 py-1.5 text-sm resize-y min-h-16"
                value={text}
                onChange={(e) => {
                  const about = [...profile.about];
                  about[i] = e.target.value;
                  setProfile((p) => ({ ...p, about }));
                }}
              />
            </Entry>
          ))}
        </Section>

        {/* Education */}
        <Section title="Education" onAdd={() => setProfile((p) => ({ ...p, education: [...p.education, emptyEducation()] }))}>
          {profile.education.map((edu, i) => (
            <Entry key={i} onRemove={() => removeItem("education", i)}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Dates" value={edu.dates} onChange={(v) => updateEducation(i, "dates", v)} />
                <Field label="Institution" value={edu.institution} onChange={(v) => updateEducation(i, "institution", v)} />
              </div>
              <Field label="Degree" value={edu.degree} onChange={(v) => updateEducation(i, "degree", v)} />
              <Field label="Details" value={edu.details || ""} onChange={(v) => updateEducation(i, "details", v)} />
            </Entry>
          ))}
        </Section>

        {/* Professional Development */}
        <Section title="Professional Development" onAdd={() => setProfile((p) => ({ ...p, professional_development: [...p.professional_development, ""] }))}>
          {profile.professional_development.map((text, i) => (
            <Entry key={i} onRemove={() => removeItem("professional_development", i)}>
              <input
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={text}
                onChange={(e) => {
                  const pd = [...profile.professional_development];
                  pd[i] = e.target.value;
                  setProfile((p) => ({ ...p, professional_development: pd }));
                }}
              />
            </Entry>
          ))}
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <textarea
            className="w-full border rounded px-2 py-1.5 text-sm resize-y min-h-24"
            value={profile.skills}
            onChange={(e) => setProfile((p) => ({ ...p, skills: e.target.value }))}
          />
        </Section>

        {/* Experience */}
        <Section title="Experience" onAdd={() => setProfile((p) => ({ ...p, experience: [...p.experience, emptyExperience()] }))}>
          {profile.experience.map((exp, i) => (
            <Entry key={i} onRemove={() => removeItem("experience", i)}>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Company" value={exp.company} onChange={(v) => updateExperience(i, "company", v)} />
                <Field label="Dates" value={exp.dates} onChange={(v) => updateExperience(i, "dates", v)} />
                <Field label="Location" value={exp.location || ""} onChange={(v) => updateExperience(i, "location", v)} />
              </div>
              <Field label="Title" value={exp.title} onChange={(v) => updateExperience(i, "title", v)} />
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                <textarea
                  className="w-full border rounded px-2 py-1.5 text-sm resize-y min-h-16"
                  value={exp.description}
                  onChange={(e) => updateExperience(i, "description", e.target.value)}
                />
              </div>
            </Entry>
          ))}
        </Section>

        {/* Previous Experience */}
        <Section title="Previous Experience" onAdd={() => setProfile((p) => ({ ...p, earlier_experience: [...p.earlier_experience, emptyEarlier()] }))}>
          {profile.earlier_experience.map((ee, i) => (
            <Entry key={i} onRemove={() => removeItem("earlier_experience", i)}>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Company" value={ee.company} onChange={(v) => updateEarlier(i, "company", v)} />
                <Field label="Title" value={ee.title} onChange={(v) => updateEarlier(i, "title", v)} />
                <Field label="Dates" value={ee.dates} onChange={(v) => updateEarlier(i, "dates", v)} />
              </div>
            </Entry>
          ))}
        </Section>

      </div>
    </div>
  );
}

// ── Reusable sub-components ─────────────────────────────────────────────────
function Section({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="bg-white border rounded-lg">
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b rounded-t-lg">
        <h2 className="text-sm font-semibold">{title}</h2>
        {onAdd && (
          <button onClick={onAdd} className="text-xs text-gray-500 border border-dashed rounded px-2 py-1 hover:border-gray-400 hover:text-gray-700">
            + Add
          </button>
        )}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Entry({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative border rounded p-3 bg-gray-50 space-y-2">
      <button onClick={onRemove} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg leading-none">&times;</button>
      {children}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <input className="w-full border rounded px-2 py-1.5 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

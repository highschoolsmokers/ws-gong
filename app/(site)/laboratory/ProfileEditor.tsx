"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  emptyProfile,
  type Profile,
  type ContactEntry,
  type EducationEntry,
  type ExperienceEntry,
  type EarlierExperienceEntry,
} from "@/lib/resumeEditor/schema";

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
  const [savedSnapshot, setSavedSnapshot] = useState<Profile>(emptyProfile());
  const [profileName, setProfileName] = useState("");
  const [profiles, setProfiles] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [status, setStatus] = useState("");
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = (msg: string) => {
    setStatus(msg);
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(""), 2000);
  };

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/laboratory/profiles");
    const names = await res.json();
    setProfiles(names);
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const loadProfile = async (name: string) => {
    if (!name) {
      const empty = emptyProfile();
      setProfile(empty);
      setSavedSnapshot(empty);
      setProfileName("");
      setSelectedProfile("");
      setStatus("");
      return;
    }
    const res = await fetch(`/api/laboratory/profiles/${name}`);
    if (!res.ok) {
      flash("Profile not found");
      return;
    }
    const data = await res.json();
    setProfile(data);
    setSavedSnapshot(structuredClone(data));
    setProfileName(name);
    setSelectedProfile(name);
    setStatus("");
  };

  const apiHeaders = {
    "Content-Type": "application/json",
    "x-api-token": process.env.NEXT_PUBLIC_API_TOKEN || "dev-token",
  };

  const [showSaveAs, setShowSaveAs] = useState(false);
  const [saveAsName, setSaveAsName] = useState("");

  const saveAs = async (name: string) => {
    if (!name.trim()) return;
    const res = await fetch("/api/laboratory/profiles", {
      method: "POST",
      headers: apiHeaders,
      body: JSON.stringify({ name: name.trim(), data: profile }),
    });
    if (res.ok) {
      setProfileName(name.trim());
      setSelectedProfile(name.trim());
      setSavedSnapshot(structuredClone(profile));
      flash("Saved");
      setShowSaveAs(false);
      setSaveAsName("");
      refreshList();
    } else flash("Save failed");
  };

  const deleteProfile = async (name: string) => {
    if (!name || !confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/laboratory/profiles/${name}`, {
      method: "DELETE",
      headers: apiHeaders,
    });
    if (profileName === name) {
      setProfile(emptyProfile());
      setProfileName("");
      setSelectedProfile("");
    }
    flash("Deleted");
    refreshList();
  };

  const downloadPDF = async () => {
    flash("Generating...");
    const res = await fetch("/api/laboratory/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      flash("Generation failed");
      return;
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const first = profile.name.first
      .replace(/\./g, "")
      .replace(/ /g, "-")
      .toLowerCase();
    const last = profile.name.last.replace(/ /g, "-").toLowerCase();
    const pName = profileName.trim() || "profile";
    a.download = `${first}-${last}-${pName}-resume.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
    flash("PDF downloaded");
  };

  const previewPDF = async () => {
    setStatus("Generating preview...");
    const res = await fetch("/api/laboratory/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      flash("Generation failed");
      return;
    }
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), "_blank");
    flash("Preview opened");
  };

  // ── Update helpers ──────────────────────────────────────────────────
  const updateName = (key: "first" | "last", value: string) => {
    setProfile((p) => ({ ...p, name: { ...p.name, [key]: value } }));
  };

  const updateContact = (
    index: number,
    field: keyof ContactEntry,
    value: string,
  ) => {
    setProfile((p) => {
      const contact = [...p.contact];
      contact[index] = { ...contact[index], [field]: value } as ContactEntry;
      return { ...p, contact };
    });
  };

  const getContactUrl = (label: string) => {
    return profile.contact.find((c) => c.label === label)?.url || "";
  };

  const setContactUrl = (
    label: string,
    type: ContactEntry["type"],
    url: string,
  ) => {
    setProfile((p) => {
      const contact = [...p.contact];
      const idx = contact.findIndex((c) => c.label === label);
      if (idx >= 0) {
        contact[idx] = { ...contact[idx], url };
      } else if (url) {
        contact.push({ label, url, type });
      }
      return { ...p, contact: contact.filter((c) => c.url) };
    });
  };

  type ArrayKey = {
    [K in keyof Profile]: Profile[K] extends unknown[] ? K : never;
  }[keyof Profile];

  const removeItem = (key: ArrayKey, index: number) => {
    setProfile((p) => {
      const arr = [...(p[key] as unknown[])];
      arr.splice(index, 1);
      return { ...p, [key]: arr };
    });
  };

  const updateEducation = (
    index: number,
    field: keyof EducationEntry,
    value: string,
  ) => {
    setProfile((p) => {
      const education = [...p.education];
      education[index] = { ...education[index], [field]: value };
      return { ...p, education };
    });
  };

  const updateExperience = (
    index: number,
    field: keyof ExperienceEntry,
    value: string,
  ) => {
    setProfile((p) => {
      const experience = [...p.experience];
      experience[index] = { ...experience[index], [field]: value };
      return { ...p, experience };
    });
  };

  const updateEarlier = (
    index: number,
    field: keyof EarlierExperienceEntry,
    value: string,
  ) => {
    setProfile((p) => {
      const earlier_experience = [...p.earlier_experience];
      earlier_experience[index] = {
        ...earlier_experience[index],
        [field]: value,
      };
      return { ...p, earlier_experience };
    });
  };

  return (
    <div className="text-black capitalize">
      {/* Toolbar */}
      <section className="sticky top-0 z-10 bg-[#F2EDE4] grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-xl md:text-2xl font-black leading-tight">
          Profile
        </h2>
        <div className="flex flex-wrap items-baseline gap-0 text-xl tracking-tight">
          {profiles.map((n, i) => (
            <span key={n} className="group/profile flex items-baseline">
              {i > 0 && <span className="text-neutral-300 mx-3">/</span>}
              <button
                onClick={() => loadProfile(n)}
                className={`hover:underline ${profileName === n ? "font-black" : "text-neutral-400 hover:text-black"}`}
              >
                {n}
              </button>
              <button
                onClick={() => deleteProfile(n)}
                className="text-neutral-300 hover:text-red-500 text-sm ml-1 opacity-0 group-hover/profile:opacity-100 transition-opacity"
              >
                {"\u00D7"}
              </button>
            </span>
          ))}
          {profiles.length > 0 && (
            <span className="text-neutral-200 mx-3">|</span>
          )}
          {!showSaveAs && (
            <button
              onClick={() => {
                if (profileName) {
                  loadProfile("");
                }
                setShowSaveAs(true);
              }}
              className="text-neutral-400 hover:text-black hover:underline"
            >
              + New
            </button>
          )}
          {showSaveAs && (
            <span className="flex items-baseline gap-2">
              <input
                className="border-b border-black bg-transparent px-0 py-0.5 text-sm w-28 normal-case outline-none"
                placeholder="name"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveAs(saveAsName);
                  if (e.key === "Escape") {
                    setShowSaveAs(false);
                    setSaveAsName("");
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => saveAs(saveAsName)}
                className="font-semibold hover:underline"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveAs(false);
                  setSaveAsName("");
                }}
                className="text-neutral-300 hover:text-black text-xs"
              >
                {"\u00D7"}
              </button>
            </span>
          )}
          {status && (
            <span className="text-xs text-neutral-400 ml-3">{status}</span>
          )}
        </div>
      </section>

      {/* Name & Title */}
      <Section title="Name">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="First"
            value={profile.name.first}
            onChange={(v) => updateName("first", v)}
          />
          <Field
            label="Last"
            value={profile.name.last}
            onChange={(v) => updateName("last", v)}
          />
        </div>
        <Field
          label="Headline"
          value={profile.title}
          onChange={(v) => setProfile((p) => ({ ...p, title: v }))}
        />
      </Section>

      {/* Contact */}
      <Section title="Contact">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Website"
            value={getContactUrl("Website")}
            onChange={(v) => setContactUrl("Website", "web", v)}
          />
          <Field
            label="LinkedIn"
            value={getContactUrl("LinkedIn")}
            onChange={(v) => setContactUrl("LinkedIn", "linkedin", v)}
          />
          <Field
            label="GitHub"
            value={getContactUrl("GitHub")}
            onChange={(v) => setContactUrl("GitHub", "web", v)}
          />
          <Field
            label="Email"
            value={getContactUrl("Email")}
            onChange={(v) => setContactUrl("Email", "email", v)}
          />
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <textarea
          className="w-full border border-neutral-300 rounded-none px-2 py-1.5 text-sm resize-y min-h-24 placeholder:text-neutral-400"
          placeholder="About you (separate paragraphs with blank lines)"
          value={profile.about.join("\n\n")}
          onChange={(e) => {
            const val = e.target.value;
            const paragraphs = val ? val.split("\n\n") : [];
            setProfile((p) => ({ ...p, about: paragraphs }));
          }}
        />
      </Section>

      {/* Education */}
      <Section
        title="Education"
        onAdd={() =>
          setProfile((p) => ({
            ...p,
            education: [...p.education, emptyEducation()],
          }))
        }
        isEmpty={profile.education.length === 0}
      >
        {profile.education.map((edu, i) => (
          <Entry key={i} onRemove={() => removeItem("education", i)}>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Dates"
                value={edu.dates}
                onChange={(v) => updateEducation(i, "dates", v)}
              />
              <Field
                label="Institution"
                value={edu.institution}
                onChange={(v) => updateEducation(i, "institution", v)}
              />
            </div>
            <Field
              label="Degree"
              value={edu.degree}
              onChange={(v) => updateEducation(i, "degree", v)}
            />
            <Field
              label="Details"
              value={edu.details || ""}
              onChange={(v) => updateEducation(i, "details", v)}
            />
          </Entry>
        ))}
      </Section>

      {/* Professional Development */}
      <Section
        title="Professional Development"
        onAdd={() =>
          setProfile((p) => ({
            ...p,
            professional_development: [...p.professional_development, ""],
          }))
        }
        isEmpty={profile.professional_development.length === 0}
      >
        {profile.professional_development.map((text, i) => (
          <div key={i} className="relative flex items-center gap-2">
            <input
              className="w-full border border-neutral-300 rounded-none px-2 py-1.5 text-sm placeholder:text-neutral-400"
              placeholder="Certification or course"
              value={text}
              onChange={(e) => {
                const pd = [...profile.professional_development];
                pd[i] = e.target.value;
                setProfile((p) => ({ ...p, professional_development: pd }));
              }}
            />
            <button
              onClick={() => removeItem("professional_development", i)}
              className="text-neutral-400 hover:text-black text-lg leading-none"
            >
              {"\u00D7"}
            </button>
          </div>
        ))}
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <textarea
          className="w-full border border-neutral-300 rounded-none px-2 py-1.5 text-sm resize-y min-h-24 placeholder:text-neutral-400"
          placeholder="Skills"
          value={profile.skills}
          onChange={(e) =>
            setProfile((p) => ({ ...p, skills: e.target.value }))
          }
        />
      </Section>

      {/* Experience */}
      <Section
        title="Experience"
        onAdd={() =>
          setProfile((p) => ({
            ...p,
            experience: [...p.experience, emptyExperience()],
          }))
        }
        isEmpty={profile.experience.length === 0}
      >
        {profile.experience.map((exp, i) => (
          <Entry key={i} onRemove={() => removeItem("experience", i)}>
            <div className="grid grid-cols-3 gap-4">
              <Field
                label="Company"
                value={exp.company}
                onChange={(v) => updateExperience(i, "company", v)}
              />
              <Field
                label="Dates"
                value={exp.dates}
                onChange={(v) => updateExperience(i, "dates", v)}
              />
              <Field
                label="Location"
                value={exp.location || ""}
                onChange={(v) => updateExperience(i, "location", v)}
              />
            </div>
            <Field
              label="Title"
              value={exp.title}
              onChange={(v) => updateExperience(i, "title", v)}
            />
            <textarea
              className="w-full border border-neutral-300 rounded-none px-2 py-1.5 text-sm resize-y min-h-16 placeholder:text-neutral-400"
              placeholder="Description"
              value={exp.description}
              onChange={(e) =>
                updateExperience(i, "description", e.target.value)
              }
            />
          </Entry>
        ))}
      </Section>

      {/* Previous Experience */}
      <Section
        title="Previous Experience"
        onAdd={() =>
          setProfile((p) => ({
            ...p,
            earlier_experience: [...p.earlier_experience, emptyEarlier()],
          }))
        }
        isEmpty={profile.earlier_experience.length === 0}
      >
        {profile.earlier_experience.map((ee, i) => (
          <div key={i} className="relative">
            <div className="grid grid-cols-3 gap-4">
              <Field
                label="Company"
                value={ee.company}
                onChange={(v) => updateEarlier(i, "company", v)}
              />
              <Field
                label="Title"
                value={ee.title}
                onChange={(v) => updateEarlier(i, "title", v)}
              />
              <Field
                label="Dates"
                value={ee.dates}
                onChange={(v) => updateEarlier(i, "dates", v)}
              />
            </div>
            <button
              onClick={() => removeItem("earlier_experience", i)}
              className="absolute top-0 right-0 text-neutral-400 hover:text-black text-lg leading-none"
            >
              {"\u00D7"}
            </button>
          </div>
        ))}
      </Section>

      {/* Actions */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <div />
        <div className="flex flex-wrap items-baseline gap-0 text-xl tracking-tight">
          {profileName && (
            <>
              <Btn onClick={() => saveAs(profileName)}>Save</Btn>
              <span className="text-neutral-200 mx-3">/</span>
              <Btn
                onClick={() => {
                  setProfile(structuredClone(savedSnapshot));
                  flash("Reverted");
                }}
              >
                Undo
              </Btn>
              <span className="text-neutral-200 mx-3">|</span>
            </>
          )}
          {!profileName && (
            <>
              <Btn onClick={() => setShowSaveAs(true)}>Save As</Btn>
              <span className="text-neutral-200 mx-3">|</span>
            </>
          )}
          <Btn onClick={downloadPDF}>Download PDF</Btn>
          <span className="text-neutral-200 mx-3">/</span>
          <Btn onClick={previewPDF}>Preview</Btn>
        </div>
      </section>
    </div>
  );
}

// ── Reusable sub-components ─────────────────────────────────────────────────
function Section({
  title,
  children,
  onAdd,
  isEmpty,
}: {
  title: string;
  children: ReactNode;
  onAdd?: () => void;
  isEmpty?: boolean;
}) {
  if (onAdd && isEmpty) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
        <h2 className="text-sm font-black leading-tight text-neutral-400">
          {title}
        </h2>
        <button
          onClick={onAdd}
          className="text-sm font-semibold text-neutral-400 hover:text-black hover:underline transition-colors justify-self-start"
        >
          + Add
        </button>
      </section>
    );
  }
  return (
    <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-12 border-t border-black pt-8 pb-10">
      <h2 className="text-xl md:text-2xl font-black leading-tight">{title}</h2>
      <div className="space-y-4">
        {children}
        {onAdd && (
          <button
            onClick={onAdd}
            className="font-semibold text-neutral-400 hover:text-black hover:underline transition-colors"
          >
            + Add
          </button>
        )}
      </div>
    </section>
  );
}

function Entry({
  children,
  onRemove,
}: {
  children: ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="relative space-y-3 pb-4 border-b border-neutral-200 last:border-0 last:pb-0">
      <button
        onClick={onRemove}
        className="absolute top-0 right-0 text-neutral-400 hover:text-black text-lg leading-none"
      >
        {"\u00D7"}
      </button>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      className="w-full border border-neutral-300 rounded-none px-2 py-1.5 text-sm placeholder:text-neutral-400"
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Btn({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="font-semibold text-neutral-400 hover:text-black hover:underline transition-colors"
    >
      {children}
    </button>
  );
}

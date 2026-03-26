import PDFDocument from "pdfkit";
import type { Profile } from "./schema";

// ── Swiss Modular Grid ───────────────────────────────────────────────────────
// 6-column grid on US Letter (612 × 792pt)
const W = 612;
const H = 792;
const MARGIN = 44;
const GUTTER = 12;
const CONTENT_W = W - MARGIN * 2; // 524
const MODULE = (CONTENT_W - 5 * GUTTER) / 6; // ≈77.3

const col = (n: number) => MARGIN + n * (MODULE + GUTTER);

// Primary split: 2 modules left (heading), 4 modules right (content) → 1:2
const LEFT_X = col(0);
const LEFT_W = 2 * MODULE + GUTTER;
const RIGHT_X = col(2);
const RIGHT_W = 4 * MODULE + 3 * GUTTER;

// ── Vertical rhythm ─────────────────────────────────────────────────────────
const BASELINE = 11;
const snap = (y: number) => Math.ceil(y / BASELINE) * BASELINE;
const SEC_PAD = 10;
const SEC_GAP = 2 * BASELINE;
const PAGE_TOP = MARGIN;
const FLOOR_Y = H - MARGIN - BASELINE;

// ── Typography ──────────────────────────────────────────────────────────────
const SZ_NAME = 28;
const SZ_TITLE = 11;
const SZ_HEADING = 9;
const SZ_BODY = 8;

const BLACK = "#000000";
const GRAY = "#555555";
const LGRAY = "#999999";

// ── Helpers ─────────────────────────────────────────────────────────────────
type Doc = InstanceType<typeof PDFDocument>;

function newPage(doc: Doc): number {
  doc.addPage({ size: "letter", margin: 0 });
  return PAGE_TOP;
}

function ensureSpace(doc: Doc, y: number, needed: number = 3 * BASELINE): number {
  if (y + needed > FLOOR_Y) return newPage(doc);
  return y;
}

function textW(doc: Doc, text: string, font: string, size: number): number {
  doc.font(font).fontSize(size);
  return doc.widthOfString(text);
}

function wrapLines(doc: Doc, text: string, font: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = (cur + " " + w).trim();
    if (textW(doc, test, font, SZ_BODY) <= maxW) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawText(
  doc: Doc, text: string, font: string, color: string,
  x: number, y: number, maxW: number,
): number {
  const lines = wrapLines(doc, text, font, maxW);
  doc.font(font).fontSize(SZ_BODY).fillColor(color);
  for (const line of lines) {
    y = ensureSpace(doc, y);
    doc.text(line, x, y, { lineBreak: false });
    y += BASELINE;
  }
  return y;
}

function fullRule(doc: Doc, y: number) {
  doc.save().strokeColor(BLACK).lineWidth(2)
    .moveTo(MARGIN, y).lineTo(W - MARGIN, y).stroke().restore();
}

function lightRule(doc: Doc, x: number, y: number, w: number) {
  doc.save().strokeColor(LGRAY).lineWidth(0.5)
    .moveTo(x, y).lineTo(x + w, y).stroke().restore();
}

// Section heading: full-width rule + UPPERCASE heading in left column
function sectionStart(doc: Doc, title: string, y: number): number {
  y = ensureSpace(doc, snap(y), SZ_HEADING + SEC_PAD + 4 * BASELINE);
  y = snap(y);
  fullRule(doc, y);
  y += SEC_PAD;
  if (title) {
    doc.font("Helvetica-Bold").fontSize(SZ_HEADING).fillColor(BLACK);
    doc.text(title.toUpperCase(), LEFT_X, y, { width: LEFT_W, lineBreak: true, characterSpacing: 1.5 });
  }
  return y;
}

// ── Job entry ───────────────────────────────────────────────────────────────
function drawJob(
  doc: Doc, company: string, dates: string,
  loc: string | null | undefined, title: string, desc: string, y: number,
  isLast: boolean = false,
): number {
  y = ensureSpace(doc, snap(y), 5 * BASELINE);
  const top = y;

  // LEFT column: company, dates, location
  doc.font("Helvetica-Bold").fontSize(SZ_BODY).fillColor(BLACK);
  for (const ln of wrapLines(doc, company, "Helvetica-Bold", LEFT_W)) {
    doc.text(ln, LEFT_X, y, { lineBreak: false });
    y += BASELINE;
  }
  doc.font("Helvetica").fontSize(SZ_BODY).fillColor(LGRAY);
  for (const part of [dates, loc]) {
    if (!part) continue;
    for (const ln of wrapLines(doc, part, "Helvetica", LEFT_W)) {
      doc.text(ln, LEFT_X, y, { lineBreak: false });
      y += BASELINE;
    }
  }

  // RIGHT column: title + description
  let dy = top;
  const titleParts = title.split(/\s*[—–]\s*/);
  doc.font("Helvetica-Bold").fontSize(SZ_BODY).fillColor(BLACK);
  for (const part of titleParts) {
    for (const tl of wrapLines(doc, part, "Helvetica-Bold", RIGHT_W)) {
      doc.text(tl, RIGHT_X, dy, { lineBreak: false });
      dy += BASELINE;
    }
  }
  dy = drawText(doc, desc, "Helvetica", GRAY, RIGHT_X, dy, RIGHT_W);

  const bottom = snap(Math.max(y, dy)) + BASELINE / 2;
  if (!isLast) lightRule(doc, LEFT_X, bottom, CONTENT_W);
  return bottom + BASELINE;
}

// ── Main render ─────────────────────────────────────────────────────────────
export async function renderResume(profile: Profile): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "letter", margin: 0 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const fullName = `${profile.name.first} ${profile.name.last}`;
    doc.info.Title = `${fullName} \u2014 Resume`;

    let y = MARGIN;
    let ry: number;

    // ── NAME + ABOUT ──────────────────────────────────────────────────
    const secY = snap(y) + SEC_PAD;

    // Name — large, bold, stacked
    let ny = secY;
    doc.font("Helvetica-Bold").fontSize(SZ_NAME).fillColor(BLACK);
    doc.text(profile.name.first, LEFT_X, ny, { lineBreak: false });
    ny += SZ_NAME + 4;
    doc.text(profile.name.last, LEFT_X, ny, { lineBreak: false });
    ny += SZ_NAME + 8;

    // Title — smaller, tracked, uppercase
    doc.font("Helvetica-Bold").fontSize(SZ_TITLE).fillColor(GRAY);
    doc.text(profile.title, LEFT_X, ny, { width: LEFT_W, lineBreak: true });
    ny += Math.ceil(doc.heightOfString(profile.title, { width: LEFT_W }));

    // Contact — clean text, no icons
    ry = secY;
    for (const entry of profile.contact) {
      doc.font("Helvetica").fontSize(SZ_BODY).fillColor(GRAY);
      doc.text(entry.label, RIGHT_X, ry, { lineBreak: false });
      const labelW = doc.widthOfString(entry.label);
      doc.link(RIGHT_X, ry, labelW, SZ_BODY, entry.url);
      ry += BASELINE;
    }

    // About
    if (profile.about.length > 0) {
      ry += BASELINE;
      for (let i = 0; i < profile.about.length; i++) {
        ry = drawText(doc, profile.about[i], "Helvetica", GRAY, RIGHT_X, ry, RIGHT_W);
        if (i < profile.about.length - 1) ry += BASELINE;
      }
    }

    y = Math.max(ny, ry) + SEC_GAP;

    // ── EXPERIENCE ────────────────────────────────────────────────────
    if (profile.experience.length > 0) {
      const expTop = sectionStart(doc, "Experience", y);
      ry = expTop + SZ_HEADING + SEC_PAD;
      for (let i = 0; i < profile.experience.length; i++) {
        const exp = profile.experience[i];
        const last = i === profile.experience.length - 1;
        ry = drawJob(doc, exp.company, exp.dates, exp.location, exp.title, exp.description, ry, last);
      }

      if (profile.earlier_experience.length > 0) {
        ry = snap(ry) + SEC_GAP;
        const prevTop = sectionStart(doc, "Previous\nExperience", ry);
        ry = prevTop;
        for (let i = 0; i < profile.earlier_experience.length; i++) {
          const ee = profile.earlier_experience[i];
          ry = ensureSpace(doc, ry, 3 * BASELINE);
          doc.font("Helvetica").fontSize(SZ_BODY).fillColor(LGRAY);
          doc.text(ee.dates, RIGHT_X, ry, { lineBreak: false });
          ry += BASELINE;
          ry = drawText(doc, ee.company, "Helvetica-Bold", BLACK, RIGHT_X, ry, RIGHT_W);
          doc.font("Helvetica").fontSize(SZ_BODY).fillColor(GRAY);
          doc.text(ee.title, RIGHT_X, ry, { lineBreak: false });
          ry += BASELINE;
          if (i < profile.earlier_experience.length - 1) {
            ry += BASELINE / 2;
            lightRule(doc, RIGHT_X, ry, RIGHT_W);
            ry += BASELINE / 2;
          }
        }
      }

      y = ry + SEC_GAP;
    }

    // ── EDUCATION ─────────────────────────────────────────────────────
    if (profile.education.length > 0) {
      const eduTop = sectionStart(doc, "Education", y);
      ry = eduTop;
      for (let i = 0; i < profile.education.length; i++) {
        const edu = profile.education[i];
        ry = ensureSpace(doc, ry, 3 * BASELINE);
        doc.font("Helvetica").fontSize(SZ_BODY).fillColor(LGRAY);
        doc.text(edu.dates, RIGHT_X, ry, { lineBreak: false });
        ry += BASELINE;
        ry = drawText(doc, edu.institution, "Helvetica-Bold", BLACK, RIGHT_X, ry, RIGHT_W);
        doc.font("Helvetica").fontSize(SZ_BODY).fillColor(GRAY);
        doc.text(edu.degree, RIGHT_X, ry, { lineBreak: false });
        ry += BASELINE;
        if (edu.details) {
          ry = drawText(doc, edu.details, "Helvetica", LGRAY, RIGHT_X, ry, RIGHT_W);
        }
        if (i < profile.education.length - 1) {
          ry += BASELINE / 2;
          lightRule(doc, RIGHT_X, ry, RIGHT_W);
          ry += BASELINE / 2;
        }
      }

      if (profile.professional_development.length > 0) {
        ry += BASELINE / 2;
        lightRule(doc, RIGHT_X, ry, RIGHT_W);
        ry += BASELINE / 2;
        doc.font("Helvetica-Bold").fontSize(SZ_BODY).fillColor(BLACK);
        doc.text("Professional Development", RIGHT_X, ry, { lineBreak: false });
        ry += BASELINE;
        for (const item of profile.professional_development) {
          ry = drawText(doc, item, "Helvetica", GRAY, RIGHT_X, ry, RIGHT_W);
        }
      }

      y = ry + SEC_GAP;
    }

    // ── SKILLS ────────────────────────────────────────────────────────
    if (profile.skill_categories.length > 0) {
      const skillsTop = sectionStart(doc, "Skills", y);
      ry = skillsTop;
      for (let i = 0; i < profile.skill_categories.length; i++) {
        const cat = profile.skill_categories[i];
        ry = ensureSpace(doc, ry, 2 * BASELINE);
        doc.font("Helvetica-Bold").fontSize(SZ_BODY).fillColor(BLACK);
        doc.text(cat.heading, RIGHT_X, ry, { lineBreak: false });
        ry += BASELINE;
        ry = drawText(doc, cat.items, "Helvetica", GRAY, RIGHT_X, ry, RIGHT_W);
        if (i < profile.skill_categories.length - 1) {
          ry += BASELINE / 2;
          lightRule(doc, RIGHT_X, ry, RIGHT_W);
          ry += BASELINE / 2;
        }
      }
    } else if (profile.skills) {
      const skillsTop = sectionStart(doc, "Skills", y);
      drawText(doc, profile.skills, "Helvetica", GRAY, RIGHT_X, skillsTop, RIGHT_W);
    }

    doc.end();
  });
}

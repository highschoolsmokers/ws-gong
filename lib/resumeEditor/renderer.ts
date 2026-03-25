import PDFDocument from "pdfkit";
import type { Profile } from "./schema";

// ── Layout constants ────────────────────────────────────────────────────────
const W = 612;
const H = 792;
const PAD = 44;
const C1 = PAD;
const C2 = 240;
const C3 = 368;

const C1_W = C2 - C1 - 14;
const C2_W = C3 - C2 - 14;
const C3_W = W - C3 - PAD;

const HDR_H = 120;
const BODY_TOP = PAD + HDR_H + 32;
const FLOOR_Y = H - PAD - 36; // max Y before we stop drawing

const SZ_NAME = 36;
const SZ_SEC = 26;
const SZ_BODY = 8;
const ICON_R = 3.5;

const BLACK = "#111111";
const GRAY = "#666666";
const LGRAY = "#999999";
const RULE = "#CCCCCC";

// ── Helpers ─────────────────────────────────────────────────────────────────
function textW(doc: InstanceType<typeof PDFDocument>, text: string, font: string, size: number): number {
  doc.font(font).fontSize(size);
  return doc.widthOfString(text);
}

function wrapLines(doc: InstanceType<typeof PDFDocument>, text: string, font: string, maxW: number): string[] {
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
  doc: InstanceType<typeof PDFDocument>,
  text: string,
  font: string,
  color: string,
  x: number,
  y: number,
  maxW: number,
  lead: number = 10.5
): number {
  const lines = wrapLines(doc, text, font, maxW);
  doc.font(font).fontSize(SZ_BODY).fillColor(color);
  for (const line of lines) {
    if (y > FLOOR_Y) break;
    doc.text(line, x, y, { lineBreak: false });
    y += lead;
  }
  return y;
}

function hrule(doc: InstanceType<typeof PDFDocument>, x: number, y: number, w: number, weight: number = 0.5, color: string = RULE) {
  doc.save().strokeColor(color).lineWidth(weight).moveTo(x, y).lineTo(x + w, y).stroke().restore();
}

// ── Icons ───────────────────────────────────────────────────────────────────
function drawGlobe(doc: InstanceType<typeof PDFDocument>, cx: number, cy: number) {
  doc.save().strokeColor(GRAY).lineWidth(0.7);
  doc.circle(cx, cy, ICON_R).stroke();
  doc.moveTo(cx, cy - ICON_R).lineTo(cx, cy + ICON_R).stroke();
  doc.moveTo(cx - ICON_R, cy).lineTo(cx + ICON_R, cy).stroke();
  doc.moveTo(cx - ICON_R, cy)
    .bezierCurveTo(cx - ICON_R * 0.4, cy - ICON_R * 0.7, cx + ICON_R * 0.4, cy - ICON_R * 0.7, cx + ICON_R, cy)
    .stroke();
  doc.restore();
}

function drawEnvelope(doc: InstanceType<typeof PDFDocument>, cx: number, cy: number) {
  const ex = cx - ICON_R, ey = cy - ICON_R * 0.8, ew = ICON_R * 2, eh = ICON_R * 1.6;
  doc.save().strokeColor(GRAY).lineWidth(0.7);
  doc.rect(ex, ey, ew, eh).stroke();
  doc.moveTo(ex, ey).lineTo(ex + ew / 2, ey + eh / 2).stroke();
  doc.moveTo(ex + ew / 2, ey + eh / 2).lineTo(ex + ew, ey).stroke();
  doc.restore();
}

function drawLinkedIn(doc: InstanceType<typeof PDFDocument>, cx: number, cy: number) {
  doc.save().strokeColor(GRAY).lineWidth(0.7);
  doc.roundedRect(cx - ICON_R, cy - ICON_R, ICON_R * 2, ICON_R * 2, 1).stroke();
  doc.font("Helvetica-Bold").fontSize(4.5).fillColor(GRAY);
  const inW = doc.widthOfString("in");
  doc.text("in", cx - inW / 2, cy - 2.5, { lineBreak: false });
  doc.restore();
}

const ICON_FN: Record<string, (doc: InstanceType<typeof PDFDocument>, cx: number, cy: number) => void> = {
  web: drawGlobe,
  email: drawEnvelope,
  linkedin: drawLinkedIn,
};

// ── Section headers ─────────────────────────────────────────────────────────
function secLeft(doc: InstanceType<typeof PDFDocument>, title: string, y: number): number {
  doc.font("Helvetica-Bold").fontSize(SZ_SEC).fillColor(BLACK);
  doc.text(title, C1, y, { lineBreak: false });
  y += SZ_SEC + 4;
  hrule(doc, C1, y, C1_W, 3, BLACK);
  return y + 10;
}

function secRight(doc: InstanceType<typeof PDFDocument>, title: string, y: number): number {
  doc.font("Helvetica-Bold").fontSize(SZ_SEC).fillColor(BLACK);
  doc.text(title, C2, y, { lineBreak: false });
  y += SZ_SEC + 4;
  hrule(doc, C2, y, W - C2 - PAD, 3, BLACK);
  return y + 10;
}

// ── Job entry ───────────────────────────────────────────────────────────────
function drawJob(
  doc: InstanceType<typeof PDFDocument>,
  company: string, dates: string, loc: string | null | undefined,
  title: string, desc: string, y: number
): number {
  if (y > FLOOR_Y) return y;
  const top = y;

  // C2 column: company, dates, location
  const coLines = wrapLines(doc, company, "Helvetica-Bold", C2_W);
  doc.font("Helvetica-Bold").fontSize(SZ_BODY).fillColor(BLACK);
  for (const ln of coLines) {
    doc.text(ln, C2, y, { lineBreak: false });
    y += 11;
  }
  doc.font("Helvetica").fontSize(SZ_BODY).fillColor(LGRAY);
  for (const part of [dates, loc]) {
    if (!part) continue;
    for (const ln of wrapLines(doc, part, "Helvetica", C2_W)) {
      doc.text(ln, C2, y, { lineBreak: false });
      y += 11;
    }
  }

  // C3 column: title, description
  let dy = top;
  doc.font("Helvetica-Bold").fontSize(SZ_BODY).fillColor(BLACK);
  const tlines = wrapLines(doc, title, "Helvetica-Bold", C3_W);
  for (const tl of tlines) {
    doc.text(tl, C3, dy, { lineBreak: false });
    dy += 11;
  }
  dy = drawText(doc, desc, "Helvetica", GRAY, C3, dy, C3_W);

  const bottom = Math.max(y, dy) + 5;
  if (bottom < FLOOR_Y) {
    hrule(doc, C2, bottom, W - C2 - PAD);
  }
  return bottom + 7;
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

    // ── HEADER ────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").fontSize(SZ_NAME).fillColor(BLACK);
    doc.text(profile.name.first, C1, PAD + 14, { lineBreak: false });
    doc.text(profile.name.last, C1, PAD + 14 + 40, { lineBreak: false });

    doc.font("Helvetica-Bold").fontSize(SZ_SEC).fillColor(BLACK);
    doc.text(profile.title, C1, PAD + 14 + 92, { lineBreak: false });

    // Contact
    for (let i = 0; i < profile.contact.length; i++) {
      const entry = profile.contact[i];
      const iy = PAD + 10 + i * 14;
      const iconFn = ICON_FN[entry.type] || drawGlobe;
      iconFn(doc, C3 + ICON_R, iy + 3);
      const tx = C3 + ICON_R * 2 + 4;
      doc.font("Helvetica").fontSize(SZ_BODY).fillColor(GRAY);
      doc.text(entry.label, tx, iy, { lineBreak: false });
      const labelW = doc.widthOfString(entry.label);
      doc.link(tx, iy, labelW, SZ_BODY, entry.url);
    }

    // ── LEFT COLUMN ───────────────────────────────────────────────────
    let ly = BODY_TOP;

    ly = secLeft(doc, "About", ly);
    for (let i = 0; i < profile.about.length; i++) {
      ly = drawText(doc, profile.about[i], "Helvetica", GRAY, C1, ly, C1_W);
      if (i < profile.about.length - 1) ly += 8;
    }
    ly += 20;

    ly = secLeft(doc, "Education", ly);
    for (const edu of profile.education) {
      doc.font("Helvetica").fontSize(SZ_BODY).fillColor(LGRAY);
      doc.text(edu.dates, C1, ly, { lineBreak: false });
      ly += 12;
      ly = drawText(doc, edu.institution, "Helvetica-Bold", BLACK, C1, ly, C1_W);
      doc.font("Helvetica").fontSize(SZ_BODY).fillColor(GRAY);
      doc.text(edu.degree, C1, ly, { lineBreak: false });
      ly += 11;
      if (edu.details) {
        ly = drawText(doc, edu.details, "Helvetica", LGRAY, C1, ly, C1_W);
      }
      ly += 9;
    }

    if (profile.professional_development.length > 0) {
      ly = drawText(doc, "Professional Development", "Helvetica-Bold", BLACK, C1, ly, C1_W);
      for (const item of profile.professional_development) {
        ly = drawText(doc, item, "Helvetica", GRAY, C1, ly, C1_W);
      }
      ly += 20;
    }

    ly = secLeft(doc, "Skills", ly);
    drawText(doc, profile.skills, "Helvetica", GRAY, C1, ly, C1_W);

    // ── RIGHT COLUMN ──────────────────────────────────────────────────
    let ry = BODY_TOP;
    ry = secRight(doc, "Experience", ry);

    for (const exp of profile.experience) {
      ry = drawJob(doc, exp.company, exp.dates, exp.location, exp.title, exp.description, ry);
    }

    if (profile.earlier_experience.length > 0 && ry < FLOOR_Y) {
      doc.font("Helvetica-Bold").fontSize(SZ_BODY).fillColor(BLACK);
      doc.text("Previous Experience", C2, ry, { lineBreak: false });
      ry += 12;

      for (const ee of profile.earlier_experience) {
        if (ry > FLOOR_Y) break;
        const top = ry;
        doc.font("Helvetica-Bold").fontSize(SZ_BODY).fillColor(BLACK);
        for (const ln of wrapLines(doc, ee.company, "Helvetica-Bold", C2_W)) {
          doc.text(ln, C2, ry, { lineBreak: false });
          ry += 11;
        }
        doc.font("Helvetica").fontSize(SZ_BODY).fillColor(LGRAY);
        doc.text(ee.dates, C2, ry, { lineBreak: false });
        ry += 11;

        let etop = top;
        doc.font("Helvetica-Bold").fontSize(SZ_BODY).fillColor(BLACK);
        doc.font("Helvetica").fontSize(SZ_BODY).fillColor(BLACK);
        for (const ln of wrapLines(doc, ee.title, "Helvetica", C3_W)) {
          doc.text(ln, C3, etop, { lineBreak: false });
          etop += 11;
        }
        ry += 8;
      }
    }

    doc.end();
  });
}

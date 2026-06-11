// Minimal, dependency-free PDF generator.
//
// Produces a valid single-page A4 PDF 1.4 document from positioned text lines.
// Deliberately tiny: enough to render clean, professional compliance
// certificates without pulling in a heavy PDF dependency.

type PdfText = {
  x: number;
  y: number;
  size: number;
  bold?: boolean;
  text: string;
};

const PAGE_WIDTH = 595; // A4 @ 72dpi
const PAGE_HEIGHT = 842;

function escapePdfText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    // Drop non-ASCII so byte length stays equal to char length.
    .replace(/[^\x20-\x7E]/g, "");
}

function toLatin1Bytes(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    bytes[i] = text.charCodeAt(i) & 0xff;
  }
  return bytes;
}

export function renderTextPdf(texts: PdfText[]): Uint8Array {
  let content = "";
  for (const item of texts) {
    const font = item.bold ? "/F2" : "/F1";
    content += `BT ${font} ${item.size} Tf 1 0 0 1 ${item.x} ${item.y} Tm (${escapePdfText(item.text)}) Tj ET\n`;
  }

  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`;
  objects[4] = `<< /Length ${content.length} >>\nstream\n${content}endstream`;
  objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[6] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 1; i <= 6; i += 1) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += "xref\n0 7\n0000000000 65535 f \n";
  for (let i = 1; i <= 6; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return toLatin1Bytes(pdf);
}

export type CertificateCategory = {
  label: string;
  result: string;
  nextDue?: string | null;
};

export type CertificateData = {
  certificateNumber: string;
  issuedAt: string;
  propertyLabel: string;
  propertyAddress?: string | null;
  ownerName?: string | null;
  inspectorName?: string | null;
  inspectorLicenceNo?: string | null;
  overallResult: string;
  categories: CertificateCategory[];
  summary?: string | null;
};

function wrapLine(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > max) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

export function renderComplianceCertificatePdf(data: CertificateData): Uint8Array {
  const left = 60;
  let y = PAGE_HEIGHT - 80;
  const texts: PdfText[] = [];

  const line = (text: string, opts: { size?: number; bold?: boolean; gap?: number; x?: number } = {}) => {
    texts.push({ x: opts.x ?? left, y, size: opts.size ?? 11, bold: opts.bold, text });
    y -= opts.gap ?? (opts.size ? opts.size + 6 : 17);
  };

  line("FIXIT247", { size: 22, bold: true, gap: 26 });
  line("RENTAL COMPLIANCE CERTIFICATE", { size: 15, bold: true, gap: 30 });

  line(`Certificate number: ${data.certificateNumber}`, { bold: true });
  line(`Issued: ${data.issuedAt}`);
  line(`Overall result: ${data.overallResult.toUpperCase()}`, { bold: true, gap: 24 });

  line("PROPERTY", { size: 12, bold: true });
  line(data.propertyLabel);
  if (data.propertyAddress) line(data.propertyAddress);
  if (data.ownerName) line(`Owner: ${data.ownerName}`);
  y -= 8;

  line("INSPECTION RESULTS", { size: 12, bold: true });
  for (const category of data.categories) {
    line(`${category.label}: ${category.result.toUpperCase()}`, { bold: true });
    if (category.nextDue) line(`   Next check due: ${category.nextDue}`, { size: 10 });
  }
  y -= 8;

  if (data.inspectorName || data.inspectorLicenceNo) {
    line("INSPECTOR", { size: 12, bold: true });
    if (data.inspectorName) line(data.inspectorName);
    if (data.inspectorLicenceNo) line(`Licence: ${data.inspectorLicenceNo}`);
    y -= 8;
  }

  if (data.summary) {
    line("SUMMARY", { size: 12, bold: true });
    for (const wrapped of wrapLine(data.summary, 86).slice(0, 8)) {
      line(wrapped, { size: 10, gap: 14 });
    }
  }

  // Footer disclaimer pinned near the bottom.
  const disclaimer = wrapLine(
    "This certificate records the inspection results captured by the attending Fixit247 inspector. Regulated gas and electrical work must be performed and certified by appropriately licensed tradespeople. Specialist rectification is quoted separately.",
    92
  );
  let footerY = 70 + disclaimer.length * 12;
  for (const wrapped of disclaimer) {
    texts.push({ x: left, y: footerY, size: 8, text: wrapped });
    footerY -= 12;
  }

  return renderTextPdf(texts);
}

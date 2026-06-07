import { C, base, body, miniCard, source, stat, text, title } from "./theme.mjs";

export default function addSlide(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "Why now");
  title(slide, ctx, "Rental maintenance is not one job. It is a portfolio operating problem.", 64, 98, 760, 150, 48);
  body(
    slide,
    ctx,
    "For property managers, the hard part is rarely the repair alone. It is keeping the request, property context, owner update, Fixer brief, and follow-up evidence together.",
    64,
    260,
    720,
    88,
  );
  stat(slide, ctx, 64, 390, 245, "AUSTRALIAN RENTAL SURFACE", "30.6%", "of occupied dwellings were rented in the 2021 Census", C.amber);
  stat(slide, ctx, 332, 390, 245, "URGENCY LAYER", "Fast", "urgent repairs require clear action and communication", C.green);
  stat(slide, ctx, 600, 390, 245, "AGENCY NEED", "Proof", "notes, photos, status, checks, and next actions need one home", "#2b84ff");

  miniCard(
    slide,
    ctx,
    895,
    130,
    280,
    318,
    "Agency tension",
    "The inbox is not a property record.",
    "Texts, emails, calls, photos, trade notes, and owner updates scatter quickly. PropertySafe turns that daily noise into a calmer operating view.",
    C.amber,
  );
  text(
    slide,
    ctx,
    "The pitch is simple: help agencies move faster while giving every property a cleaner history.",
    895,
    478,
    285,
    92,
    { size: 24, bold: true, color: C.ink },
  );
  source(slide, ctx, "Sources: ABS Census 2021 housing; NSW Government urgent repairs guidance.");
  return slide;
}

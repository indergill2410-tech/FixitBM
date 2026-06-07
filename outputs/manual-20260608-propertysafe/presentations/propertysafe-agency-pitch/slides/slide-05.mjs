import { C, base, body, panel, text, title } from "./theme.mjs";

function step(slide, ctx, x, n, heading, copy) {
  panel(slide, ctx, x, 320, 205, 248, C.white);
  text(slide, ctx, String(n).padStart(2, "0"), x + 22, 344, 48, 38, { size: 29, bold: true, color: C.amber });
  text(slide, ctx, heading, x + 22, 398, 160, 48, { size: 22, bold: true });
  text(slide, ctx, copy, x + 22, 456, 162, 90, { size: 16, color: C.muted });
}

export default function addSlide(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "Agency workflow");
  title(slide, ctx, "A calmer path from tenant issue to completed record.", 64, 98, 770, 120, 50);
  body(
    slide,
    ctx,
    "PropertySafe gives each step a place. The agency keeps the workflow clear while the right context reaches the right person at the right time.",
    64,
    230,
    760,
    72,
  );
  step(slide, ctx, 64, 1, "Issue starts", "Tenant, owner, or manager starts a request with urgency and location.");
  step(slide, ctx, 295, 2, "Agency triages", "Your team sees priority, property details, notes, and owner context.");
  step(slide, ctx, 526, 3, "Fixer briefed", "The Fixer gets a cleaner scope, photos, timing, and access notes.");
  step(slide, ctx, 757, 4, "Check recorded", "Safety Check and follow-up work stay attached to the property.");
  step(slide, ctx, 988, 5, "History shared", "Agency-approved updates are easier to explain and easier to trust.");
  ctx.addShape(slide, { x: 254, y: 432, w: 40, h: 4, fill: C.amber });
  ctx.addShape(slide, { x: 485, y: 432, w: 40, h: 4, fill: C.amber });
  ctx.addShape(slide, { x: 716, y: 432, w: 40, h: 4, fill: C.amber });
  ctx.addShape(slide, { x: 947, y: 432, w: 40, h: 4, fill: C.amber });
  return slide;
}

import { C, base, body, darkPanel, panel, text, title } from "./theme.mjs";

export default function addSlide(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "Product logic");
  title(slide, ctx, "PropertySafe sits above requests as the property memory.", 64, 98, 710, 126, 50);
  body(
    slide,
    ctx,
    "The current Fixit247 request flow stays intact. PropertySafe adds the portfolio layer agencies need: properties, rules, check records, notes, and shared history around the work.",
    64,
    236,
    730,
    90,
  );

  darkPanel(slide, ctx, 820, 96, 385, 525);
  text(slide, ctx, "Layer 03", 860, 142, 120, 22, { size: 13, bold: true, color: C.amber });
  text(slide, ctx, "Agency workspace", 860, 170, 290, 32, { size: 27, bold: true, color: C.white });
  text(slide, ctx, "Portfolio view, team rules, property status, check readiness, owner updates, and agency-level follow-up.", 860, 214, 300, 78, { size: 17, color: "#e7ded4" });
  ctx.addShape(slide, { x: 860, y: 318, w: 275, h: 2, fill: "#ffffff20" });
  text(slide, ctx, "Layer 02", 860, 344, 120, 22, { size: 13, bold: true, color: C.amber });
  text(slide, ctx, "Property record", 860, 372, 290, 32, { size: 27, bold: true, color: C.white });
  text(slide, ctx, "Saved details, Safety Check history, photos, recommended fixes, and repair notes held property by property.", 860, 416, 300, 78, { size: 17, color: "#e7ded4" });
  ctx.addShape(slide, { x: 860, y: 518, w: 275, h: 2, fill: "#ffffff20" });
  text(slide, ctx, "Layer 01", 860, 536, 120, 22, { size: 13, bold: true, color: C.amber });
  text(slide, ctx, "Request flow", 860, 562, 290, 28, { size: 24, bold: true, color: C.white });

  panel(slide, ctx, 64, 384, 205, 120, C.white);
  text(slide, ctx, "Requests", 88, 414, 150, 28, { size: 24, bold: true });
  text(slide, ctx, "free to start", 88, 460, 130, 24, { size: 18, color: C.muted });
  panel(slide, ctx, 304, 384, 205, 120, C.white);
  text(slide, ctx, "Properties", 328, 414, 150, 28, { size: 24, bold: true });
  text(slide, ctx, "saved context", 328, 460, 130, 24, { size: 18, color: C.muted });
  panel(slide, ctx, 544, 384, 205, 120, C.white);
  text(slide, ctx, "Checks", 568, 414, 150, 28, { size: 24, bold: true });
  text(slide, ctx, "ready records", 568, 460, 130, 24, { size: 18, color: C.muted });
  ctx.addShape(slide, { x: 270, y: 445, w: 32, h: 3, fill: C.amber });
  ctx.addShape(slide, { x: 510, y: 445, w: 32, h: 3, fill: C.amber });
  return slide;
}

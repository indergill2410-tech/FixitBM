import { C, base, body, panel, text, title } from "./theme.mjs";

export default function addSlide(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "The problem");
  title(slide, ctx, "Every loose maintenance thread becomes another follow-up.", 64, 94, 760, 120, 50);
  body(
    slide,
    ctx,
    "Agencies need speed without losing the story. Owners need confidence without interrupting the team. Fixers need context before arriving.",
    64,
    222,
    760,
    72,
  );

  panel(slide, ctx, 64, 345, 330, 220, C.white);
  text(slide, ctx, "Today", 92, 374, 250, 34, { size: 25, bold: true });
  text(slide, ctx, "Tenant call\nScreenshots\nManual owner update\nTrade call-back\nMissing check history", 92, 426, 268, 116, { size: 20, color: C.muted });

  ctx.addShape(slide, { x: 430, y: 450, w: 135, h: 4, fill: C.amber });
  text(slide, ctx, "becomes", 454, 414, 90, 25, { size: 16, bold: true, color: "#b96f00", align: "center", fill: C.amberSoft });

  panel(slide, ctx, 602, 345, 330, 220, C.white);
  text(slide, ctx, "PropertySafe", 630, 374, 250, 34, { size: 25, bold: true });
  text(slide, ctx, "Structured request\nProperty memory\nAgency-approved sharing\nFixer-ready brief\nSafety Check trail", 630, 426, 270, 116, { size: 20, color: C.muted });

  panel(slide, ctx, 976, 345, 196, 220, C.night, "#3a2c20");
  text(slide, ctx, "Outcome", 1002, 374, 140, 26, { size: 20, bold: true, color: C.white });
  text(slide, ctx, "Less chasing.\nFewer blind updates.\nBetter maintenance decisions.", 1002, 425, 140, 112, { size: 19, bold: true, color: C.white });
  return slide;
}

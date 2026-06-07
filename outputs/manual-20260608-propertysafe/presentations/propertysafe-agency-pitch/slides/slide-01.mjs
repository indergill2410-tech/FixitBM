import { C, base, body, darkPanel, kicker, pill, text, title } from "./theme.mjs";

export default function addSlide(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "Agency pitch");
  kicker(slide, ctx, "PropertySafe for real estate agencies", 64, 98, 330);
  title(slide, ctx, "Less chasing. Clearer repairs. A better record for every property.", 64, 150, 685, 235, 56);
  body(
    slide,
    ctx,
    "A calm maintenance layer for rental portfolios: urgent issues, routine repairs, Safety Check history, follow-up work, and agency-approved sharing in one property memory.",
    64,
    404,
    690,
    98,
    22,
  );
  pill(slide, ctx, "Built around agency workflow", 64, 535, 245, C.greenSoft, C.green);
  pill(slide, ctx, "Free to start a request", 326, 535, 210, C.amberSoft, "#b96f00");
  pill(slide, ctx, "Compliance-ready records", 554, 535, 230, C.smoke, C.ink);

  darkPanel(slide, ctx, 835, 148, 410, 360);
  text(slide, ctx, "What agencies get", 875, 190, 310, 32, { size: 22, bold: true, color: C.white });
  text(slide, ctx, "1", 875, 252, 38, 38, { size: 26, bold: true, color: C.amber, align: "center", fill: "#ffffff12" });
  text(slide, ctx, "A property-level record around every repair.", 930, 256, 250, 48, { size: 19, bold: true, color: C.white });
  text(slide, ctx, "2", 875, 326, 38, 38, { size: 26, bold: true, color: C.amber, align: "center", fill: "#ffffff12" });
  text(slide, ctx, "Clearer briefs for Fixers and less repeated explanation.", 930, 330, 265, 55, { size: 19, bold: true, color: C.white });
  text(slide, ctx, "3", 875, 405, 38, 38, { size: 26, bold: true, color: C.amber, align: "center", fill: "#ffffff12" });
  text(slide, ctx, "A guided pilot your team can start without a whole-agency rebuild.", 930, 409, 275, 62, { size: 19, bold: true, color: C.white });
  return slide;
}

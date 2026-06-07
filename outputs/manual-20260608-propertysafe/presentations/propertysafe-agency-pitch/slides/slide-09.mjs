import { C, base, body, miniCard, text, title } from "./theme.mjs";

export default function addSlide(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "Business case");
  title(slide, ctx, "The return is operational calm that compounds property by property.", 64, 94, 795, 126, 50);
  body(
    slide,
    ctx,
    "PropertySafe should be sold as a better maintenance operating rhythm, not another form. The value shows up in reduced chasing, cleaner owner updates, better Fixer briefs, and reusable property context.",
    64,
    232,
    780,
    86,
  );

  miniCard(slide, ctx, 64, 350, 260, 208, "Manager", "Less repeated explanation", "One property memory reduces the same context being retyped across calls, emails, and trade notes.", C.amber);
  miniCard(slide, ctx, 354, 350, 260, 208, "Owner", "Clearer confidence", "Agency-approved updates explain what happened, what was checked, and what needs attention next.", C.green);
  miniCard(slide, ctx, 644, 350, 260, 208, "Fixer", "Better first visit", "Briefs can include location, photos, urgency, access notes, property context, and next-step expectations.", "#2b84ff");
  miniCard(slide, ctx, 934, 350, 260, 208, "Agency", "Portfolio visibility", "The team can see readiness, open issues, check history, and follow-up work without hunting through threads.", C.amber);

  text(slide, ctx, "Best first KPI set", 64, 594, 190, 24, { size: 20, bold: true });
  text(slide, ctx, "Time to triage  -  owner update speed  -  repeat follow-up volume  -  check-to-repair conversion", 260, 596, 850, 24, { size: 18, color: C.muted });
  return slide;
}

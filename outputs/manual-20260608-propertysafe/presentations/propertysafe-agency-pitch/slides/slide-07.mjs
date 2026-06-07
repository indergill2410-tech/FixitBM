import { C, base, body, panel, stat, text, title } from "./theme.mjs";

export default function addSlide(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "Agency workspace");
  title(slide, ctx, "The agency dashboard should feel like command, not clutter.", 64, 94, 760, 120, 50);
  body(
    slide,
    ctx,
    "PropertySafe is designed to show the next decision clearly: what needs triage, which properties need attention, which checks are ready, and where sharing rules need review.",
    64,
    226,
    760,
    78,
  );

  panel(slide, ctx, 64, 354, 1160, 210, C.white);
  stat(slide, ctx, 96, 388, 205, "READINESS", "55%", "setup strength");
  stat(slide, ctx, 324, 388, 205, "PROPERTIES", "0", "active portfolio records", C.green);
  stat(slide, ctx, 552, 388, 205, "CHECKS", "Ready", "safety and readiness path", "#2b84ff");
  stat(slide, ctx, 780, 388, 205, "QUEUE", "Live", "maintenance requests");
  stat(slide, ctx, 1008, 388, 165, "RULES", "Clear", "sharing settings", C.green);

  text(slide, ctx, "Core controls", 64, 600, 160, 28, { size: 21, bold: true });
  text(slide, ctx, "Add property  -  Invite team  -  Prepare check  -  Start request  -  Share update", 230, 602, 760, 28, { size: 19, color: C.muted });
  return slide;
}

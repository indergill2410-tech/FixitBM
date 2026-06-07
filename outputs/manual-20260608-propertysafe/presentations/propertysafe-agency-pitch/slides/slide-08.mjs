import { C, base, body, miniCard, panel, text, title } from "./theme.mjs";

export default function addSlide(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "Pilot path");
  title(slide, ctx, "Start with one agency, one workflow, and a clean rollout shape.", 64, 94, 805, 120, 50);
  body(
    slide,
    ctx,
    "A strong onboarding does not need to overwhelm the team. It should prove the workflow on a small portfolio slice, then expand when the agency trusts the operating model.",
    64,
    226,
    760,
    78,
  );

  miniCard(slide, ctx, 64, 340, 260, 206, "Week 1", "Choose the slice", "Select 5 to 10 managed properties, one property manager, and the first request types to support.", C.amber);
  miniCard(slide, ctx, 354, 340, 260, 206, "Week 2", "Load the memory", "Add saved property details, preferred access notes, recurring issues, and safety check status.", C.green);
  miniCard(slide, ctx, 644, 340, 260, 206, "Week 3", "Run live requests", "Move tenant maintenance through the request flow while keeping property history attached.", "#2b84ff");
  miniCard(slide, ctx, 934, 340, 260, 206, "Week 4", "Review and expand", "Compare response quality, owner update clarity, and team time saved before widening the rollout.", C.amber);

  panel(slide, ctx, 64, 574, 1160, 54, C.night, "#3a2c20");
  text(slide, ctx, "Pilot promise: tomorrow-ready, agency-led, and measured around fewer follow-ups.", 92, 588, 900, 28, { size: 22, bold: true, color: C.white });
  return slide;
}

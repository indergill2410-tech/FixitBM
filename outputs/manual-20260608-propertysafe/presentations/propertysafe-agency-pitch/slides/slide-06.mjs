import { C, base, body, darkPanel, miniCard, source, text, title } from "./theme.mjs";

export default function addSlide(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "Compliance-ready records");
  title(slide, ctx, "Help your team stay ready for rental safety and maintenance evidence.", 64, 94, 740, 135, 49);
  body(
    slide,
    ctx,
    "PropertySafe helps organise compliance-ready check records around rental property safety duties, maintenance notes, photos, recommendations, and follow-up work. It supports agency process; it does not replace licensed inspections, certificates, legal advice, or your statutory obligations.",
    64,
    244,
    760,
    116,
    21,
  );

  miniCard(slide, ctx, 64, 394, 285, 196, "Record", "Safety Check history", "Completed checks and next recommended fixes stay tied to the property.", C.green);
  miniCard(slide, ctx, 376, 394, 285, 196, "Evidence", "Photos and notes", "Repair context is kept together instead of scattered across inboxes.", C.amber);
  miniCard(slide, ctx, 688, 394, 285, 196, "Action", "Follow-up queue", "Recommended work can move from check to quote or request.", "#2b84ff");

  darkPanel(slide, ctx, 1002, 130, 245, 430);
  text(slide, ctx, "Careful claim", 1032, 172, 170, 26, { size: 19, bold: true, color: C.amber });
  text(
    slide,
    ctx,
    "We do not sell legal certainty.\n\nWe sell a calmer, better organised operating record so agencies can manage maintenance and safety evidence with less friction.",
    1032,
    222,
    185,
    226,
    { size: 20, bold: true, color: C.white },
  );
  source(slide, ctx, "Reference point: NSW rental urgent repairs guidance and rental safety obligations should be checked per state.");
  return slide;
}

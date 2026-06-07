import { C, base, body, darkPanel, panel, pill, text, title } from "./theme.mjs";

export default function addSlide(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx, "Close");
  title(slide, ctx, "Bring one property. Leave with the first rollout shape.", 64, 94, 745, 124, 52);
  body(
    slide,
    ctx,
    "The walkthrough is designed for agency principals and property managers who want a calmer way to manage urgent repairs, Safety Check records, maintenance follow-up, and property portfolio visibility.",
    64,
    238,
    760,
    96,
  );

  panel(slide, ctx, 64, 396, 345, 180, C.white);
  text(slide, ctx, "Walkthrough agenda", 92, 424, 230, 28, { size: 23, bold: true });
  text(slide, ctx, "1. Pick a pilot slice\n2. Map current request path\n3. Set property record rules\n4. Create first agency account", 92, 470, 280, 84, { size: 18, color: C.muted });

  panel(slide, ctx, 445, 396, 345, 180, C.white);
  text(slide, ctx, "What to bring", 473, 424, 230, 28, { size: 23, bold: true });
  text(slide, ctx, "A sample property\nOne common tenant issue\nCurrent owner update process\nYour first safety check concern", 473, 470, 285, 84, { size: 18, color: C.muted });

  darkPanel(slide, ctx, 840, 112, 370, 450);
  text(slide, ctx, "Decision", 878, 154, 180, 26, { size: 20, bold: true, color: C.amber });
  text(slide, ctx, "Start with a guided pilot, prove the operating rhythm, then expand across the managed portfolio.", 878, 198, 270, 142, { size: 26, bold: true, color: C.white });
  pill(slide, ctx, "Book the agency walkthrough", 878, 365, 245, C.amber, C.ink);
  pill(slide, ctx, "Create agency account", 878, 420, 205, C.white, C.ink);
  text(slide, ctx, "fixit247.com.au/propertysafe/onboarding", 878, 500, 270, 24, { size: 15, color: "#e7ded4" });
  return slide;
}

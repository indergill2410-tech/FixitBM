export const C = {
  paper: "#fbfaf7",
  ink: "#1f1a17",
  muted: "#6f6963",
  faint: "#eee8df",
  amber: "#f59f00",
  amberSoft: "#fff0bf",
  green: "#10a85a",
  greenSoft: "#dff9e9",
  smoke: "#f5f2ed",
  night: "#17110d",
  night2: "#2b2119",
  white: "#ffffff",
  line: "#dfd8cf",
};

export function base(slide, ctx, section = "PropertySafe for agencies") {
  ctx.addShape(slide, { x: 0, y: 0, w: 1280, h: 720, fill: C.paper });
  ctx.addText(slide, {
    x: 64,
    y: 42,
    w: 220,
    h: 24,
    text: "Fixit247 PropertySafe",
    fontSize: 14,
    color: C.muted,
    bold: true,
  });
  ctx.addShape(slide, { x: 1122, y: 48, w: 118, h: 4, fill: C.amber });
  ctx.addText(slide, {
    x: 64,
    y: 682,
    w: 420,
    h: 16,
    text: section,
    fontSize: 10,
    color: C.muted,
  });
}

export function text(slide, ctx, value, x, y, w, h, opts = {}) {
  return ctx.addText(slide, {
    x,
    y,
    w,
    h,
    text: value,
    fontSize: opts.size ?? 22,
    color: opts.color ?? C.ink,
    bold: opts.bold ?? false,
    align: opts.align ?? "left",
    valign: opts.valign ?? "top",
    insets: opts.insets ?? { left: 0, right: 0, top: 0, bottom: 0 },
    fill: opts.fill ?? "#00000000",
    line: opts.line ?? ctx.line("#00000000", 0),
  });
}

export function title(slide, ctx, value, x, y, w, h, size = 54) {
  return text(slide, ctx, value, x, y, w, h, {
    size,
    bold: true,
    color: C.ink,
  });
}

export function body(slide, ctx, value, x, y, w, h, size = 23) {
  return text(slide, ctx, value, x, y, w, h, {
    size,
    color: C.muted,
  });
}

export function kicker(slide, ctx, value, x, y, w = 260) {
  return text(slide, ctx, value, x, y, w, 34, {
    size: 15,
    bold: true,
    color: "#b96f00",
    fill: C.amberSoft,
    insets: { left: 18, right: 18, top: 7, bottom: 7 },
  });
}

export function panel(slide, ctx, x, y, w, h, fill = C.white, line = C.line) {
  ctx.addShape(slide, { x, y, w, h, fill, line: ctx.line(line, 1) });
}

export function darkPanel(slide, ctx, x, y, w, h) {
  ctx.addShape(slide, { x, y, w, h, fill: C.night, line: ctx.line("#3a2c20", 1) });
  ctx.addShape(slide, { x: x + 18, y: y + 18, w: w - 36, h: h - 36, fill: C.night2, line: ctx.line("#ffffff20", 1) });
}

export function stat(slide, ctx, x, y, w, label, value, detail, accent = C.amber) {
  panel(slide, ctx, x, y, w, 150, C.white);
  ctx.addShape(slide, { x: x + 22, y: y + 18, w: 42, h: 5, fill: accent });
  text(slide, ctx, label, x + 22, y + 34, w - 44, 18, { size: 12, bold: true, color: C.muted });
  text(slide, ctx, value, x + 22, y + 54, w - 44, 38, { size: 31, bold: true, color: C.ink });
  text(slide, ctx, detail, x + 22, y + 98, w - 44, 28, { size: 12, color: C.muted });
}

export function pill(slide, ctx, value, x, y, w, fill = C.smoke, color = C.ink) {
  return text(slide, ctx, value, x, y, w, 34, {
    size: 15,
    bold: true,
    color,
    fill,
    align: "center",
    insets: { left: 12, right: 12, top: 7, bottom: 7 },
  });
}

export function miniCard(slide, ctx, x, y, w, h, label, headline, copy, accent = C.amber) {
  panel(slide, ctx, x, y, w, h, C.white);
  ctx.addShape(slide, { x: x + 24, y: y + 24, w: 34, h: 5, fill: accent });
  text(slide, ctx, label, x + 24, y + 42, w - 48, 20, { size: 12, bold: true, color: C.muted });
  text(slide, ctx, headline, x + 24, y + 70, w - 48, 40, { size: 22, bold: true, color: C.ink });
  text(slide, ctx, copy, x + 24, y + 124, w - 48, h - 142, { size: 16, color: C.muted });
}

export function source(slide, ctx, value) {
  text(slide, ctx, value, 650, 682, 560, 16, {
    size: 9,
    color: "#8d867d",
    align: "right",
  });
}

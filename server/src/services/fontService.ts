// @ts-expect-error opentype.js has no types
import opentype from "opentype.js";

const UNITS_PER_EM = 1000;
const ASCENDER = 800;
const DESCENDER = -200;
const ADVANCE_WIDTH = 600;
const GLYPH_SIZE = 400;
const ORIGIN = (UNITS_PER_EM - GLYPH_SIZE) / 2;

type PathLike = { moveTo: (x: number, y: number) => void; lineTo: (x: number, y: number) => void; curveTo: (x1: number, y1: number, x2: number, y2: number, x: number, y: number) => void; close: () => void };

/**
 * Creates a Path for a simple shape based on the AI's text description.
 * Supported: circle, line, loop, angle, curve, dot, cross, wave
 */
function shapeToPath(shape: string): PathLike {
  const path = new opentype.Path();
  const s = GLYPH_SIZE;
  const o = ORIGIN;
  const c = o + s / 2; // center
  const r = s / 3;     // radius for circle/loop

  const normalized = (shape || "line").toLowerCase().trim();

  switch (normalized) {
    case "circle": {
      // Approximate circle with 4 cubic Bézier curves (standard approach)
      const k = 0.5522847498; // magic number for circle approximation
      const rk = r * k;
      path.moveTo(c + r, c);
      path.curveTo(c + r, c + rk, c + rk, c + r, c, c + r);
      path.curveTo(c - rk, c + r, c - r, c + rk, c - r, c);
      path.curveTo(c - r, c - rk, c - rk, c - r, c, c - r);
      path.curveTo(c + rk, c - r, c + r, c - rk, c + r, c);
      path.close();
      break;
    }
    case "dot": {
      // Small circle
      const rDot = s / 8;
      const k = 0.5522847498;
      const rk = rDot * k;
      path.moveTo(c + rDot, c);
      path.curveTo(c + rDot, c + rk, c + rk, c + rDot, c, c + rDot);
      path.curveTo(c - rk, c + rDot, c - rDot, c + rk, c - rDot, c);
      path.curveTo(c - rDot, c - rk, c - rk, c - rDot, c, c - rDot);
      path.curveTo(c + rk, c - rDot, c + rDot, c - rk, c + rDot, c);
      path.close();
      break;
    }
    case "line": {
      path.moveTo(o, c);
      path.lineTo(o + s, c);
      break;
    }
    case "loop": {
      // Single loop (like lowercase 'e' or an oval with a twist)
      path.moveTo(c + r, c);
      path.curveTo(c + r, c + r, c, c + r, c - r * 0.5, c);
      path.curveTo(c - r, c, c - r, c - r * 0.5, c, c - r);
      path.curveTo(c + r * 0.5, c - r, c + r, c - r * 0.3, c + r, c);
      path.close();
      break;
    }
    case "angle": {
      path.moveTo(o, o);
      path.lineTo(o + s, o);
      path.lineTo(o + s / 2, o + s);
      path.close();
      break;
    }
    case "curve": {
      path.moveTo(o, o + s);
      path.curveTo(o + s, o + s, o + s, o, o + s, o);
      break;
    }
    case "cross": {
      path.moveTo(o, c - r);
      path.lineTo(o, c + r);
      path.moveTo(c - r, o);
      path.lineTo(c + r, o);
      break;
    }
    case "wave": {
      path.moveTo(o, c);
      path.curveTo(o + s / 4, c - r, o + s / 2, c + r, o + (s * 3) / 4, c - r);
      path.curveTo(o + s, c, o + s, c, o + s, c);
      break;
    }
    default: {
      // fallback: line
      path.moveTo(o, c);
      path.lineTo(o + s, c);
      break;
    }
  }

  return path as PathLike;
}

/**
 * Creates a .notdef glyph (required at index 0 in OpenType fonts).
 */
function createNotdefGlyph(): opentype.Glyph {
  const path = new opentype.Path();
  const o = ORIGIN;
  const s = GLYPH_SIZE;
  path.moveTo(o, o);
  path.lineTo(o + s, o);
  path.lineTo(o + s, o + s);
  path.lineTo(o, o + s);
  path.close();
  return new opentype.Glyph({
    name: ".notdef",
    unicode: 0,
    advanceWidth: ADVANCE_WIDTH,
    path,
  });
}

/**
 * Generates a TTF font from alphabet_mapping (letter -> shape keyword).
 * Returns the font file as a Buffer.
 */
export function generateFont(
  fontName: string,
  alphabetMapping: Record<string, string>
): Buffer {
  const glyphs: opentype.Glyph[] = [createNotdefGlyph()];

  // Ensure A-Z and common chars; use mapping or default to "line"
  const letters = new Set<string>();
  for (let i = 65; i <= 90; i++) letters.add(String.fromCharCode(i));
  for (let i = 97; i <= 122; i++) letters.add(String.fromCharCode(i));
  Object.keys(alphabetMapping).forEach((c) => letters.add(c));

  const sortedLetters = [...letters].sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));

  for (const char of sortedLetters) {
    const shape = alphabetMapping[char] ?? alphabetMapping[char.toUpperCase()] ?? alphabetMapping[char.toLowerCase()] ?? "line";
    const path = shapeToPath(shape);
    const glyph = new opentype.Glyph({
      name: char === " " ? "space" : `char_${char.charCodeAt(0)}`,
      unicode: char.charCodeAt(0),
      advanceWidth: char === " " ? 300 : ADVANCE_WIDTH,
      path: path as unknown as opentype.Path,
    });
    glyphs.push(glyph);
  }

  const font = new opentype.Font({
    familyName: fontName.replace(/\s+/g, "").slice(0, 50) || "Conlang",
    styleName: "Regular",
    unitsPerEm: UNITS_PER_EM,
    ascender: ASCENDER,
    descender: DESCENDER,
    glyphs,
  });

  const arrayBuffer = font.toArrayBuffer();
  return Buffer.from(arrayBuffer);
}

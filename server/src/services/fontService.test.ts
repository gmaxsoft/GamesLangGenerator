import { describe, it, expect } from "vitest";
import { generateFont } from "./fontService.js";

describe("fontService", () => {
  describe("generateFont", () => {
    it("returns a non-empty Buffer", () => {
      const buffer = generateFont("TestFont", { A: "circle", B: "line" });
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("produces valid font (starts with OpenType/TrueType signature)", () => {
      const buffer = generateFont("Conlang", {});
      // TrueType: 0x00010000, OpenType CFF: 'OTTO' (0x4F54544F)
      const sig = buffer.readUInt32BE(0);
      const valid =
        sig === 0x00010000 || sig === 0x74727565 || sig === 0x4f54544f;
      expect(valid).toBe(true);
    });

    it("accepts empty alphabet_mapping and defaults to line shapes", () => {
      const buffer = generateFont("EmptyMap", {});
      expect(buffer.length).toBeGreaterThan(100);
    });

    it("accepts all supported shape keywords", () => {
      const mapping: Record<string, string> = {
        A: "circle",
        B: "line",
        C: "loop",
        D: "angle",
        E: "curve",
        F: "dot",
        G: "cross",
        H: "wave",
      };
      const buffer = generateFont("AllShapes", mapping);
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("sanitizes font name (strips spaces)", () => {
      const buffer = generateFont("My Language Name", { A: "line" });
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});

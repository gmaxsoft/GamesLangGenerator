import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../index.js";

const mockGenerateLanguage = vi.fn();
const mockGenerateFont = vi.fn();

vi.mock("../services/languageService.js", () => ({
  generateLanguage: (...args: unknown[]) => mockGenerateLanguage(...args),
}));

vi.mock("../services/fontService.js", () => ({
  generateFont: (...args: unknown[]) => mockGenerateFont(...args),
}));

describe("POST /api/v1/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateLanguage.mockResolvedValue({
      grammar: { word_order: "SOV" },
      phonetics: { vowels: "a e", consonants: "k m" },
      dictionary: { test: "word" },
      alphabet_mapping: { A: "circle" },
    });
    mockGenerateFont.mockReturnValue(Buffer.from("font-bytes"));
  });

  it("returns 400 when body is invalid (missing required fields)", async () => {
    const res = await request(app)
      .post("/api/v1/generate")
      .send({ name: "X" })
      .expect(400);

    expect(res.body.error).toContain("Invalid request body");
    expect(mockGenerateLanguage).not.toHaveBeenCalled();
  });

  it("returns 400 when complexity is out of range", async () => {
    const res = await request(app)
      .post("/api/v1/generate")
      .send({
        name: "Test",
        vibe: "Elvish",
        description: "Fluid",
        complexity: 15,
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
    expect(mockGenerateLanguage).not.toHaveBeenCalled();
  });

  it("returns 200 with grammar, phonetics, dictionary, fontBase64 when valid", async () => {
    const res = await request(app)
      .post("/api/v1/generate")
      .send({
        name: "Eldarian",
        vibe: "Elvish",
        description: "Fluid sounds, lots of vowels",
        complexity: 7,
      })
      .expect(200);

    expect(mockGenerateLanguage).toHaveBeenCalledWith({
      name: "Eldarian",
      vibe: "Elvish",
      description: "Fluid sounds, lots of vowels",
      complexity: 7,
    });
    expect(mockGenerateFont).toHaveBeenCalledWith("Eldarian", { A: "circle" });
    expect(res.body.grammar).toEqual({ word_order: "SOV" });
    expect(res.body.phonetics).toEqual({ vowels: "a e", consonants: "k m" });
    expect(res.body.dictionary).toEqual({ test: "word" });
    expect(res.body.fontBase64).toBe(Buffer.from("font-bytes").toString("base64"));
    expect(res.body.languageName).toBe("Eldarian");
  });

  it("returns 500 when generateLanguage throws", async () => {
    mockGenerateLanguage.mockRejectedValueOnce(new Error("OpenAI error"));

    const res = await request(app)
      .post("/api/v1/generate")
      .send({
        name: "X",
        vibe: "X",
        description: "X",
        complexity: 1,
      })
      .expect(500);

    expect(res.body.error).toBeDefined();
    expect(res.body.details).toContain("OpenAI");
  });
});

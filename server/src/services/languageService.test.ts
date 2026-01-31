import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockCompletion = vi.fn();

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCompletion,
      },
    },
  })),
}));

describe("languageService", () => {
  beforeEach(() => {
    vi.resetModules();
    mockCompletion.mockReset();
  });

  it("throws when OPENAI_API_KEY is not set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const { generateLanguage } = await import("./languageService.js");
    await expect(
      generateLanguage({
        name: "Test",
        description: "Test desc",
        vibe: "Elvish",
        complexity: 5,
      })
    ).rejects.toThrow("OPENAI_API_KEY");
  });

  it("returns parsed language result when OpenAI returns valid JSON", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    const validResponse = {
      grammar: { word_order: "SOV", phonotactics: "CV" },
      phonetics: { vowels: "a e i", consonants: "k m n" },
      dictionary: { sana: "word", kala: "water" },
      alphabet_mapping: { A: "circle", B: "line" },
    };
    mockCompletion.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(validResponse) } }],
    });

    const { generateLanguage } = await import("./languageService.js");
    const result = await generateLanguage({
      name: "TestLang",
      description: "Test",
      vibe: "Elvish",
      complexity: 5,
    });

    expect(result.grammar.word_order).toBe("SOV");
    expect(result.phonetics.vowels).toBe("a e i");
    expect(result.dictionary).toEqual({ sana: "word", kala: "water" });
    expect(result.alphabet_mapping).toEqual({ A: "circle", B: "line" });
  });

  it("strips markdown code fence from OpenAI response", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    const validResponse = {
      grammar: { word_order: "SVO" },
      phonetics: { vowels: "a", consonants: "k" },
      dictionary: { x: "y" },
      alphabet_mapping: { A: "line" },
    };
    mockCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            content: "```json\n" + JSON.stringify(validResponse) + "\n```",
          },
        },
      ],
    });

    const { generateLanguage } = await import("./languageService.js");
    const result = await generateLanguage({
      name: "X",
      description: "X",
      vibe: "X",
      complexity: 1,
    });

    expect(result.grammar.word_order).toBe("SVO");
  });

  it("throws when OpenAI returns invalid JSON structure", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    mockCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              grammar: {},
              phonetics: {},
              dictionary: {},
              alphabet_mapping: {},
            }),
          },
        },
      ],
    });

    const { generateLanguage } = await import("./languageService.js");
    await expect(
      generateLanguage({
        name: "X",
        description: "X",
        vibe: "X",
        complexity: 1,
      })
    ).rejects.toThrow();
  });
});

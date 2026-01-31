import { Router, Request, Response } from "express";
import { z } from "zod";
import { generateLanguage } from "../services/languageService.js";
import { generateFont } from "../services/fontService.js";

export const languageRouter = Router();

const GenerateBodySchema = z.object({
  name: z.string().min(1).max(100),
  vibe: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  complexity: z.number().min(1).max(10),
});

languageRouter.post("/generate", async (req: Request, res: Response) => {
  try {
    const parsed = GenerateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
      return;
    }
    const { name, vibe, description, complexity } = parsed.data;

    const languageResult = await generateLanguage({
      name,
      description,
      vibe,
      complexity,
    });

    const fontBuffer = generateFont(name, languageResult.alphabet_mapping);
    const fontBase64 = fontBuffer.toString("base64");

    res.status(200).json({
      grammar: languageResult.grammar,
      phonetics: languageResult.phonetics,
      dictionary: languageResult.dictionary,
      fontBase64,
      languageName: name,
    });
  } catch (err) {
    console.error("Generate language error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to generate language", details: message });
  }
});

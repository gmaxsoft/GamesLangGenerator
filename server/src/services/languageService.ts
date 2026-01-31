import OpenAI from "openai";
import { z } from "zod";

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    throw new Error("OPENAI_API_KEY is not set. Add it to your .env file.");
  }
  return new OpenAI({ apiKey: key });
}

const SYSTEM_PROMPT = `You are an expert conlanger (constructed language designer) and linguist. Your task is to generate a complete, logically consistent constructed language (conlang) based on the user's description and vibe.

You MUST respond with a single valid JSON object (no markdown, no code fence). The JSON must have exactly this structure:

{
  "grammar": {
    "word_order": "string (e.g. SOV, SVO)",
    "noun_cases": ["list", "of", "cases"],
    "verb_conjugation": "short description",
    "phonotactics": "rules for syllable structure (e.g. (C)V(C))",
    "pluralization": "how plurals are formed",
    "other_rules": "any other key grammatical rules"
  },
  "phonetics": {
    "vowels": "list or description of vowels",
    "consonants": "list or description of consonants",
    "stress": "stress pattern description",
    "allophony": "brief allophony notes if relevant"
  },
  "dictionary": {
    "word_1": "translation_1",
    "word_2": "translation_2"
  },
  "alphabet_mapping": {
    "A": "glyph_description",
    "B": "glyph_description",
    ...
  }
}

CRITICAL RULES for alphabet_mapping:
- Include mappings for A-Z (Latin uppercase). You may also include a-z if the language uses distinct lowercase.
- Each value (glyph_description) MUST be exactly one of these keywords: "circle", "line", "loop", "angle", "curve", "dot", "cross", "wave".
- Use these keywords to describe the visual style of each letter in the new script (e.g. "elvish" might use many "curve" and "wave", "dwarven" might use "angle" and "line").
- Do not use any other words – only the keywords above.

For dictionary: generate at least 15–25 basic vocabulary items (nouns, verbs, adjectives, numbers, common words) that fit the vibe and phonotactics. Keys are words in the new language, values are English translations.

Be creative but consistent. The language must feel coherent and match the requested vibe.`;

const LanguageResultSchema = z.object({
  grammar: z.object({
    word_order: z.string(),
    noun_cases: z.array(z.string()).optional(),
    verb_conjugation: z.string().optional(),
    phonotactics: z.string().optional(),
    pluralization: z.string().optional(),
    other_rules: z.string().optional(),
  }),
  phonetics: z.object({
    vowels: z.string(),
    consonants: z.string(),
    stress: z.string().optional(),
    allophony: z.string().optional(),
  }),
  dictionary: z.record(z.string(), z.string()),
  alphabet_mapping: z.record(z.string(), z.string()),
});

export type LanguageResult = z.infer<typeof LanguageResultSchema>;

export async function generateLanguage(params: {
  name: string;
  description: string;
  vibe: string;
  complexity: number;
}): Promise<LanguageResult> {
  const { name, description, vibe, complexity } = params;

  const userPrompt = `Create a conlang with these specifications:

Name: ${name}
Vibe / aesthetic: ${vibe}
Phonetic / style description: ${description}
Complexity (1–10): ${complexity}

Generate the full JSON object with grammar, phonetics, dictionary (15–25 words), and alphabet_mapping for A–Z using only the allowed glyph_description keywords: circle, line, loop, angle, curve, dot, cross, wave.`;

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  // Strip possible markdown code fence
  let jsonStr = content;
  const codeBlock = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    jsonStr = codeBlock[1].trim();
  }

  const parsed = JSON.parse(jsonStr) as unknown;
  return LanguageResultSchema.parse(parsed);
}

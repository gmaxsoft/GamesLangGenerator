import { useState } from "react";
import axios from "axios";
import { Loader2, Download, Sparkles } from "lucide-react";

const VIBE_OPTIONS = [
  { value: "Elvish", label: "Elvish" },
  { value: "Dwarven", label: "Dwarven" },
  { value: "Alien", label: "Alien" },
  { value: "Ancient", label: "Ancient" },
  { value: "Nordic", label: "Nordic" },
  { value: "Eastern", label: "Eastern" },
  { value: "Mystical", label: "Mystical" },
  { value: "Harsh", label: "Harsh" },
];

interface Grammar {
  word_order?: string;
  noun_cases?: string[];
  verb_conjugation?: string;
  phonotactics?: string;
  pluralization?: string;
  other_rules?: string;
}

interface Phonetics {
  vowels: string;
  consonants: string;
  stress?: string;
  allophony?: string;
}

interface ApiResponse {
  grammar: Grammar;
  phonetics: Phonetics;
  dictionary: Record<string, string>;
  fontBase64: string;
  languageName: string;
}

function App() {
  const [name, setName] = useState("");
  const [vibe, setVibe] = useState("Elvish");
  const [description, setDescription] = useState("");
  const [complexity, setComplexity] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [livePreviewText, setLivePreviewText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const { data } = await axios.post<ApiResponse>("/api/v1/generate", {
        name: name || "Unnamed",
        vibe,
        description: description || "No specific rules.",
        complexity,
      });
      setResult(data);
      setLivePreviewText(Object.keys(data.dictionary).slice(0, 5).join(" ") || "Preview");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.details ?? err.response?.data?.error ?? err.message
        : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const downloadFont = () => {
    if (!result?.fontBase64 || !result?.languageName) return;
    const binary = atob(result.fontBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "font/ttf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.languageName.replace(/\s+/g, "-")}-Conlang.ttf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fontFaceUrl = result?.fontBase64
    ? `url(data:font/ttf;base64,${result.fontBase64}) format('truetype')`
    : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {fontFaceUrl && (
        <style>{`
          @font-face {
            font-family: 'ConlangGenerated';
            src: ${fontFaceUrl};
            font-display: block;
          }
        `}</style>
      )}

      <div className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-amber-400" />
            Conlang Studio AI
          </h1>
          <p className="text-slate-400 mt-1">Language & Font Generator</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 mb-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Language name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eldarian"
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Vibe / Climate</label>
            <select
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-2.5 text-slate-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
            >
              {VIBE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Phonetic rules / description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fluid sounds, lots of vowels, no hard consonants at the end of words"
              rows={4}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Complexity: {complexity}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={complexity}
              onChange={(e) => setComplexity(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate"
            )}
          </button>
        </form>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-200">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {fontFaceUrl && (
              <div className="rounded-xl bg-slate-800/80 border border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Live font preview</h3>
                <input
                  type="text"
                  value={livePreviewText}
                  onChange={(e) => setLivePreviewText(e.target.value)}
                  placeholder="Type to preview the generated font"
                  className="w-full rounded-lg bg-slate-900 border border-slate-600 px-4 py-3 text-xl text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none mb-2"
                  style={{ fontFamily: "ConlangGenerated, sans-serif" }}
                />
                <p className="text-sm text-slate-400">Text above uses the generated conlang font.</p>
              </div>
            )}

            <div className="rounded-xl bg-slate-800/80 border border-slate-600 overflow-hidden">
              <div className="p-4 border-b border-slate-600 flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-amber-400">Grammar & rules</h3>
                <button
                  type="button"
                  onClick={downloadFont}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium transition"
                >
                  <Download className="w-4 h-4" />
                  Download .ttf font
                </button>
              </div>
              <div className="p-6 space-y-4">
                {result.grammar.word_order && (
                  <p><span className="text-slate-400">Word order:</span> {result.grammar.word_order}</p>
                )}
                {result.grammar.phonotactics && (
                  <p><span className="text-slate-400">Phonotactics:</span> {result.grammar.phonotactics}</p>
                )}
                {result.grammar.verb_conjugation && (
                  <p><span className="text-slate-400">Verb conjugation:</span> {result.grammar.verb_conjugation}</p>
                )}
                {result.grammar.pluralization && (
                  <p><span className="text-slate-400">Pluralization:</span> {result.grammar.pluralization}</p>
                )}
                {result.grammar.other_rules && (
                  <p><span className="text-slate-400">Other rules:</span> {result.grammar.other_rules}</p>
                )}
                {result.grammar.noun_cases && result.grammar.noun_cases.length > 0 && (
                  <p><span className="text-slate-400">Noun cases:</span> {result.grammar.noun_cases.join(", ")}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-slate-800/80 border border-slate-600 overflow-hidden">
              <h3 className="text-lg font-semibold text-amber-400 p-4 border-b border-slate-600">Dictionary</h3>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-700/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-slate-300 font-medium">Word (conlang)</th>
                      <th className="px-4 py-2 text-slate-300 font-medium">Translation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(result.dictionary).map(([word, translation]) => (
                      <tr key={word} className="border-t border-slate-700">
                        <td className="px-4 py-2 font-medium" style={fontFaceUrl ? { fontFamily: "ConlangGenerated, sans-serif" } : undefined}>
                          {word}
                        </td>
                        <td className="px-4 py-2 text-slate-300">{translation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

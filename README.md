# Conlang Studio AI: Language & Font Generator

**Conlang Studio AI** is an advanced tool for game developers that automates the creation of fictional languages (constructed languages) along with dedicated font files (.TTF).

Thanks to AI integration, the system not only generates word lists but also creates coherent phonetics, grammatical rules, and a unique visual alphabet.

## ✨ Key Features

- **Linguistic AI Engine:** Generates unique language structures (phonetics, grammar, vocabulary) based on a "vibe" description (e.g. elvish, dwarven, alien).
- **Font Synthesis:** Automatically generates .ttf font files using opentype.js, mapping Latin characters to newly created glyphs.
- **Gamedev API:** Full REST interface for integration with external tools or dynamic language generation inside the game.
- **Intuitive Dashboard:** React frontend for rapid language prototyping without writing code.

## 🛠 Tech Stack

| Layer       | Technology           | Description                              |
| ----------- | -------------------- | ---------------------------------------- |
| Backend     | Node.js + TypeScript | Stable and scalable API                  |
| Frontend    | React + Vite + Tailwind CSS | Fast and responsive admin panel   |
| Linguistics | OpenAI / Anthropic API | AI-powered language rule generation   |
| Typography  | opentype.js          | Binary font file generation              |
| API         | Express.js           | REST communication standard              |

## 🚀 Quick Start

### Requirements

- Node.js v20+ (CI uses 20.x and 22.x)
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/gmaxsoft/GamesLangGenerator.git
cd GamesLangGenerator
```

2. Environment setup — copy `.env.example` to `.env` and set your API key:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3000
OPENAI_API_KEY=your_api_key
```

3. Install dependencies (monorepo: server + client):

```bash
npm install
```

4. Run both server and frontend:

```bash
npm run dev
```

Or run separately: `npm run dev:server` (backend on port 3000), `npm run dev:client` (Vite on port 5173, proxies `/api` to backend).

### Build

```bash
npm run build
```

Builds both server (`server/dist`) and client (`client/dist`). CI runs this on Node 20.x and 22.x (see `.github/workflows/ci.yml`).

## 📡 API Documentation

### `POST /api/v1/generate`

Main endpoint for creating a new language.

**Sample Request Body:**

```json
{
  "name": "Eldarian",
  "vibe": "Elvish",
  "description": "Fluid sounds, lots of vowels, no hard consonants at the end of words",
  "complexity": 7
}
```

**Response:** `200 OK` — returns a JSON object with `grammar`, `phonetics`, `dictionary`, `fontBase64` (TTF as Base64), and `languageName`. The frontend decodes `fontBase64` to offer a font download and live preview.

## 🧠 System Prompt Configuration

The system uses an advanced linguistic prompt that enforces logical consistency from the AI. The AI defines:

- **Character mapping:** How the letter 'A' looks in the new language (SVG path description).
- **Phonotactics:** Rules for combining sounds so the language sounds natural within the chosen aesthetic.

## 🤝 Gamedev Integration

The project is designed for studio workflow. The API enables:

- Generating NPC dialogues on the fly.
- Creating textures with text in unique languages for each world/level.

---

*Author's note: This tool bridges linguistics and technology. If you need support integrating with Unity or Unreal Engine — let me know!*

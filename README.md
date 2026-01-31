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
| Frontend    | React + Tailwind CSS | Fast and responsive admin panel          |
| Linguistics | OpenAI / Anthropic API | AI-powered language rule generation   |
| Typography  | opentype.js          | Binary font file generation              |
| API         | Express.js           | REST communication standard              |

## 🚀 Quick Start

### Requirements

- Node.js v18+
- OpenAI or Anthropic API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/twoj-user/conlang-studio-ai.git
cd conlang-studio-ai
```

2. Environment setup — create a `.env` file in the project root:

```
PORT=3000
OPENAI_API_KEY=your_api_key
```

3. Install and run (Backend):

```bash
npm install
npm run dev
```

4. Run the Frontend:

```bash
cd frontend
npm install
npm run dev
```

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

**Response:** `200 OK` — returns a JSON object with grammar, dictionary, and a link to download the .ttf font.

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

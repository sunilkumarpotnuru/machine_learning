# Codex Sentiment Arena

Codex Sentiment Arena is a React-powered mini game that turns sentiment analysis into an interactive challenge. Predict how the built-in analyser interprets curated scenarios, review the reasoning behind each classification, and experiment with custom text to learn how word choice influences emotion detection.

## Getting started

```bash
cd codex
npm install
npm run dev
```

The development server runs on [http://localhost:5173](http://localhost:5173). You can adjust the port by editing `vite.config.ts`.

To create an optimised production build run:

```bash
npm run build
```

## Gameplay overview

- **Guess the mood** – Each round presents a new statement inspired by real-world contexts. Choose whether Codex will label it Positive, Neutral, or Negative.
- **Inspect the verdict** – After your guess, Codex reveals its computed score, the strongest word-level influences, and a natural language explanation of the reasoning.
- **Track your progress** – The history timeline stores every round so you can revisit how intensifiers, negations, punctuation, and emojis reshaped sentiment.
- **Experiment freely** – Use the sandbox panel to analyse any text you provide, making Codex a lightweight learning companion for tone and emotion tuning.

The sentiment engine is rule-based and intentionally transparent, providing educational insight into common linguistic signals rather than relying on opaque models.

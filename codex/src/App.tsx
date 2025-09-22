import { FormEvent, useMemo, useState } from 'react';
import './App.css';
import ContributionList from './components/ContributionList';
import RoundHistory, { type RoundHistoryItem } from './components/RoundHistory';
import { prompts, type Prompt } from './data/sentences';
import {
  analyzeSentiment,
  type SentimentAnalysis,
  type SentimentLabel,
} from './utils/sentiment';

const SENTIMENT_CHOICES: SentimentLabel[] = ['Positive', 'Neutral', 'Negative'];
const MAX_ROUNDS = 10;

function shuffle<T>(items: readonly T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const App: React.FC = () => {
  const [promptQueue, setPromptQueue] = useState<Prompt[]>(() => shuffle(prompts));
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<SentimentLabel | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const [history, setHistory] = useState<RoundHistoryItem[]>([]);
  const [customText, setCustomText] = useState('');
  const [customAnalysis, setCustomAnalysis] = useState<SentimentAnalysis | null>(null);

  const totalRounds = Math.min(MAX_ROUNDS, promptQueue.length);
  const isComplete = roundIndex >= totalRounds;
  const currentPrompt = !isComplete ? promptQueue[roundIndex] : null;

  const accuracy = history.length > 0 ? Math.round((score / history.length) * 100) : 0;

  const handleGuess = (guess: SentimentLabel) => {
    if (!currentPrompt || hasResult) {
      return;
    }

    const computed = analyzeSentiment(currentPrompt.text);
    const correct = computed.label === guess;

    setAnalysis(computed);
    setSelectedGuess(guess);
    setHasResult(true);
    setScore((previous) => previous + (correct ? 1 : 0));

    setHistory((previous) => [
      ...previous,
      {
        round: roundIndex + 1,
        sentence: currentPrompt.text,
        guess,
        actual: computed.label,
        score: computed.score,
        correct,
        contributions: computed.contributions,
      },
    ]);
  };

  const handleNext = () => {
    if (!hasResult) {
      return;
    }

    setHasResult(false);
    setAnalysis(null);
    setSelectedGuess(null);
    setRoundIndex((index) => index + 1);
  };

  const restartGame = () => {
    setPromptQueue(shuffle(prompts));
    setRoundIndex(0);
    setScore(0);
    setAnalysis(null);
    setSelectedGuess(null);
    setHasResult(false);
    setHistory([]);
  };

  const handleCustomAnalyze = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = customText.trim();
    if (!cleaned) {
      setCustomAnalysis(null);
      return;
    }
    setCustomAnalysis(analyzeSentiment(cleaned));
  };

  const promptSubtitle = useMemo(() => {
    if (!currentPrompt) {
      return '';
    }
    const hints = [
      'Focus on the emotional intensity, not just the words.',
      'Watch for negations or contrast words that may flip the tone.',
      'Consider if the excitement outweighs the concerns.',
      'Sometimes neutral statements hide subtle cues.',
    ];
    return hints[roundIndex % hints.length];
  }, [currentPrompt, roundIndex]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Codex Sentiment Arena</h1>
        <p className="app__subtitle">
          Predict how Codex, an interactive sentiment analyser, reacts to each scenario. Guess the mood,
          earn points, and learn how language choices shift the score.
        </p>
        <div className="app__scoreboard">
          <article className="score-card score-card--primary">
            <span className="score-card__label">Score</span>
            <span className="score-card__value">{score}</span>
            <span className="score-card__hint">{totalRounds} rounds</span>
          </article>
          <article className="score-card score-card--accent">
            <span className="score-card__label">Accuracy</span>
            <span className="score-card__value">{accuracy}%</span>
            <span className="score-card__hint">{history.length} analysed</span>
          </article>
          <article className="score-card score-card--neutral">
            <span className="score-card__label">Round</span>
            <span className="score-card__value">{Math.min(roundIndex + 1, totalRounds)}</span>
            <span className="score-card__hint">Out of {totalRounds}</span>
          </article>
        </div>
      </header>

      <main className="app__grid">
        <section className="game-panel">
          {!isComplete && currentPrompt && (
            <div className="game-panel__prompt">
              <div className="prompt__meta">
                <span className="prompt__badge">{currentPrompt.source}</span>
                <span className="prompt__hint">{promptSubtitle}</span>
              </div>
              <p className="prompt__text">{currentPrompt.text}</p>
            </div>
          )}

          {!isComplete && (
            <div className="game-panel__choices">
              {SENTIMENT_CHOICES.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className={`choice-button ${selectedGuess === choice ? 'choice-button--selected' : ''}`}
                  onClick={() => handleGuess(choice)}
                  disabled={hasResult}
                >
                  {choice}
                </button>
              ))}
            </div>
          )}

          {!isComplete && (
            <p className="game-panel__instruction">Pick the tone Codex will report for this statement.</p>
          )}

          {hasResult && analysis && selectedGuess && !isComplete && (
            <article className="analysis-card">
              <header className="analysis-card__header">
                <h3>
                  Codex verdict:{' '}
                  <span className={`analysis-card__label analysis-card__label--${analysis.label.toLowerCase()}`}>
                    {analysis.label}
                  </span>
                </h3>
                <span className="analysis-card__score">Score {analysis.score.toFixed(2)}</span>
              </header>
              <p className="analysis-card__reason">{analysis.reasoning}</p>
              <ContributionList contributions={analysis.contributions} />
              <footer className="analysis-card__footer">
                <span
                  className={`analysis-card__feedback ${
                    selectedGuess === analysis.label ? 'analysis-card__feedback--correct' : 'analysis-card__feedback--incorrect'
                  }`}
                >
                  {selectedGuess === analysis.label
                    ? 'Great intuition! You matched Codex perfectly.'
                    : `Codex disagreed. It sensed a ${analysis.label.toLowerCase()} vibe.`}
                </span>
                <button type="button" className="next-button" onClick={handleNext}>
                  {roundIndex + 1 >= totalRounds ? 'See final results' : 'Next challenge'}
                </button>
              </footer>
            </article>
          )}

          {isComplete && (
            <div className="game-panel__complete">
              <h2>Game complete!</h2>
              <p>
                You finished {totalRounds} rounds with a score of <strong>{score}</strong> ({accuracy}% accuracy).
              </p>
              <button type="button" className="primary-button" onClick={restartGame}>
                Play again
              </button>
            </div>
          )}
        </section>

        <aside className="inspector">
          <h2 className="inspector__title">Experiment with your own words</h2>
          <p className="inspector__description">
            Craft a message, prediction, or even a reply, then let Codex explain its take on the sentiment.
          </p>
          <form className="inspector__form" onSubmit={handleCustomAnalyze}>
            <textarea
              value={customText}
              onChange={(event) => setCustomText(event.target.value)}
              placeholder="Type or paste something for Codex to analyse..."
              rows={6}
              className="inspector__textarea"
            />
            <div className="inspector__actions">
              <button type="submit" className="primary-button">
                Analyse text
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setCustomText('');
                  setCustomAnalysis(null);
                }}
              >
                Reset
              </button>
            </div>
          </form>

          {customAnalysis && (
            <article className="analysis-card analysis-card--secondary">
              <header className="analysis-card__header">
                <h3>
                  Codex says:{' '}
                  <span
                    className={`analysis-card__label analysis-card__label--${customAnalysis.label.toLowerCase()}`}
                  >
                    {customAnalysis.label}
                  </span>
                </h3>
                <span className="analysis-card__score">Score {customAnalysis.score.toFixed(2)}</span>
              </header>
              <p className="analysis-card__reason">{customAnalysis.reasoning}</p>
              <ContributionList contributions={customAnalysis.contributions} />
            </article>
          )}
        </aside>
      </main>

      <section className="history-section">
        <div className="history-section__header">
          <h2>Round history</h2>
          <p>Open each entry to revisit Codex’s rationale and see which cues stood out.</p>
        </div>
        <RoundHistory history={history} />
      </section>
    </div>
  );
};

export default App;

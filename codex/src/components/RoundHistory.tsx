import ContributionList from './ContributionList';
import type {
  SentimentContribution,
  SentimentLabel,
} from '../utils/sentiment';

export interface RoundHistoryItem {
  round: number;
  sentence: string;
  guess: SentimentLabel;
  actual: SentimentLabel;
  score: number;
  correct: boolean;
  contributions: SentimentContribution[];
}

interface RoundHistoryProps {
  history: RoundHistoryItem[];
}

const RoundHistory: React.FC<RoundHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <p className="history-empty">
        Play a round to build your Codex timeline. Each entry reveals how the analyzer reacted.
      </p>
    );
  }

  return (
    <div className="history-list">
      {history.map((entry) => (
        <details
          key={`${entry.round}-${entry.sentence.slice(0, 12)}`}
          className={`history-item ${entry.correct ? 'history-item--correct' : 'history-item--incorrect'}`}
          open={entry.round === history.length}
        >
          <summary className="history-item__summary">
            <span className="history-item__round">Round {entry.round}</span>
            <span className={`history-item__badge history-item__badge--${entry.actual.toLowerCase()}`}>
              {entry.actual}
            </span>
            <span className="history-item__result">{entry.correct ? 'Correct guess' : 'Missed it'}</span>
          </summary>
          <div className="history-item__body">
            <p className="history-item__sentence">“{entry.sentence}”</p>
            <p className="history-item__details">
              You predicted <strong>{entry.guess}</strong>. Codex calculated a score of{' '}
              <strong>{entry.score.toFixed(2)}</strong> and labelled it <strong>{entry.actual}</strong>.
            </p>
            <ContributionList
              contributions={entry.contributions}
              emptyMessage="Codex saw very little sentiment weight in this statement."
              limit={6}
            />
          </div>
        </details>
      ))}
    </div>
  );
};

export default RoundHistory;

import type { SentimentContribution } from '../utils/sentiment';

interface ContributionListProps {
  contributions: SentimentContribution[];
  emptyMessage?: string;
  limit?: number;
}

const ContributionList: React.FC<ContributionListProps> = ({
  contributions,
  emptyMessage = 'No strong sentiment cues detected.',
  limit,
}) => {
  const items = limit ? contributions.slice(0, limit) : contributions;

  if (items.length === 0) {
    return <p className="analysis-card__muted">{emptyMessage}</p>;
  }

  return (
    <ul className="token-list">
      {items.map((entry, index) => (
        <li
          key={`${entry.token}-${index}`}
          className={`token ${
            entry.impact > 0 ? 'token--positive' : entry.impact < 0 ? 'token--negative' : ''
          }`}
        >
          <span className="token__word">{entry.token}</span>
          <span className="token__impact">{entry.impact > 0 ? '+' : ''}{entry.impact.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
};

export default ContributionList;

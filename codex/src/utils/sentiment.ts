export type SentimentLabel = 'Positive' | 'Neutral' | 'Negative';

export interface SentimentContribution {
  token: string;
  impact: number;
}

export interface SentimentAnalysis {
  label: SentimentLabel;
  score: number;
  contributions: SentimentContribution[];
  reasoning: string;
}

const POSITIVE_WORDS: Record<string, number> = {
  amazing: 2.4,
  awesome: 2.2,
  celebrate: 1.6,
  cheerful: 1.7,
  cheers: 1.9,
  confident: 1.4,
  creative: 1.5,
  delighted: 2.4,
  delight: 2.3,
  efficient: 1.6,
  engaging: 1.7,
  excellent: 2.5,
  excited: 2,
  fantastic: 2.6,
  follow: 0.9,
  friendly: 1.5,
  helpful: 1.5,
  huge: 1.2,
  joyful: 2.2,
  love: 2.6,
  magical: 2.3,
  optimistic: 1.8,
  outstanding: 2.6,
  perfect: 2.4,
  promising: 1.6,
  relieved: 1.4,
  smooth: 1.4,
  solved: 1.4,
  surprised: 1.5,
  thriving: 1.8,
  upbeat: 1.7,
  wowing: 1.8,
  wow: 1.9,
};

const NEGATIVE_WORDS: Record<string, number> = {
  afraid: -1.5,
  annoyed: -1.6,
  awful: -2.5,
  brutal: -2,
  crash: -1.8,
  crashed: -1.9,
  cranky: -1.6,
  delay: -1.1,
  exhausted: -1.6,
  failure: -2,
  frustrated: -1.7,
  ignored: -1.8,
  long: -0.8,
  messy: -1.3,
  overwhelming: -1.5,
  restless: -1.4,
  slow: -1.2,
  spins: -1,
  stressed: -1.6,
  terrible: -2.4,
  unable: -1.1,
  wiped: -1.4,
};

const INTENSIFIERS: Record<string, number> = {
  absolutely: 1.9,
  barely: 0.4,
  completely: 1.6,
  especially: 1.3,
  extremely: 1.9,
  hugely: 1.7,
  incredibly: 2.1,
  mildly: 0.6,
  really: 1.4,
  slightly: 0.5,
  so: 1.3,
  super: 1.5,
  totally: 1.7,
  very: 1.5,
};

const NEGATIONS = new Set(['not', "n't", 'never', 'no', 'hardly', 'without']);
const CONTRAST_WORDS = new Set(['but', 'however', 'though', 'although', 'yet']);

const POSITIVE_EMOJI = /[😀-😃😄😁😆😊😍🤩👍🎉✨]/u;
const NEGATIVE_EMOJI = /[😞😠😡😢☹️👎💀😤😭]/u;

export function analyzeSentiment(text: string): SentimentAnalysis {
  const tokens = tokenize(text);
  let score = 0;
  const contributions: SentimentContribution[] = [];
  let intensity = 1;
  let negateNext = false;
  let usedNegation = false;
  let usedIntensifier = false;

  tokens.forEach((token) => {
    if (INTENSIFIERS[token]) {
      intensity *= INTENSIFIERS[token];
      usedIntensifier = true;
      return;
    }

    if (NEGATIONS.has(token)) {
      negateNext = true;
      return;
    }

    if (CONTRAST_WORDS.has(token) && score !== 0) {
      const adjustment = score * -0.35;
      score += adjustment;
      contributions.push({
        token,
        impact: Number(adjustment.toFixed(2)),
      });
      intensity = 1;
      negateNext = false;
      return;
    }

    const base = POSITIVE_WORDS[token] ?? NEGATIVE_WORDS[token] ?? 0;

    if (base !== 0) {
      let impact = base * intensity;
      if (negateNext) {
        impact *= -1;
        usedNegation = true;
      }

      score += impact;
      contributions.push({
        token,
        impact: Number(impact.toFixed(2)),
      });

      intensity = 1;
      negateNext = false;
      return;
    }

    intensity = 1;
  });

  const exclamationMatches = text.match(/!/g);
  if (exclamationMatches && exclamationMatches.length > 0) {
    const emphasis = Math.min(0.8, exclamationMatches.length * 0.2);
    if (score > 0) {
      score += emphasis;
      contributions.push({ token: 'excitement (!)', impact: Number(emphasis.toFixed(2)) });
    } else if (score < 0) {
      score -= emphasis;
      contributions.push({ token: 'intensity (!)', impact: Number((-emphasis).toFixed(2)) });
    }
  }

  if (POSITIVE_EMOJI.test(text)) {
    score += 0.9;
    contributions.push({ token: 'emoji', impact: 0.9 });
  } else if (NEGATIVE_EMOJI.test(text)) {
    score -= 0.9;
    contributions.push({ token: 'emoji', impact: -0.9 });
  }

  const normalizedScore = Number(score.toFixed(2));
  let label: SentimentLabel;
  if (normalizedScore > 0.6) {
    label = 'Positive';
  } else if (normalizedScore < -0.6) {
    label = 'Negative';
  } else {
    label = 'Neutral';
  }

  let reasoning: string;
  if (contributions.length === 0) {
    reasoning = 'Codex did not detect strong sentiment cues, so it leaned toward a neutral interpretation.';
  } else {
    const highlights = contributions
      .slice()
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, 3)
      .map((entry) => `${entry.token} (${entry.impact > 0 ? '+' : ''}${entry.impact.toFixed(2)})`)
      .join(', ');

    const magnitude = Math.abs(normalizedScore);
    const intensityLabel =
      magnitude > 2.4
        ? 'a powerful'
        : magnitude > 1.3
        ? 'a clear'
        : magnitude > 0.6
        ? 'a gentle'
        : 'an almost neutral';

    const toneLabel = label === 'Neutral' ? 'balanced mood' : `${label.toLowerCase()} tone`;

    reasoning = `Signals like ${highlights} nudged Codex toward ${intensityLabel} ${toneLabel}.`;

    if (usedNegation) {
      reasoning += ' A negation flipped the meaning of at least one cue.';
    }

    if (usedIntensifier) {
      reasoning += ' Intensifier words scaled the impact of the strongest terms.';
    }
  }

  return {
    label,
    score: normalizedScore,
    contributions,
    reasoning,
  };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'!-]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/^[!-]+|[!-]+$/g, ''))
    .filter(Boolean);
}

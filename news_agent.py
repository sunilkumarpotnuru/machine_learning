#!/usr/bin/env python3
"""News scraping and summarization agent.

Fetches latest headlines from RSS feeds, pulls article snippets, and generates
short summaries.
"""

from __future__ import annotations

import argparse
import html
import re
import textwrap
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from email.utils import parsedate_to_datetime
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

DEFAULT_FEEDS = [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
]

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "has", "have", "he", "in",
    "is", "it", "its", "of", "on", "or", "that", "the", "to", "was", "were", "will", "with", "this", "their",
    "they", "you", "your", "i", "we", "our", "about", "after", "before", "than", "then", "them", "his", "her",
}


@dataclass
class Article:
    title: str
    link: str
    published: datetime | None
    source: str
    content: str


def _clean_html(raw: str) -> str:
    text = re.sub(r"<[^>]+>", " ", raw)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def _safe_text(element: ET.Element | None, *tags: str) -> str:
    if element is None:
        return ""
    for tag in tags:
        found = element.find(tag)
        if found is not None and found.text:
            return found.text.strip()
    return ""


def _parse_pub_date(raw: str) -> datetime | None:
    if not raw:
        return None
    try:
        return parsedate_to_datetime(raw)
    except (TypeError, ValueError, IndexError):
        return None


def fetch_feed(url: str, timeout: int = 15) -> list[Article]:
    req = Request(url, headers={"User-Agent": "news-agent/1.0"})
    try:
        with urlopen(req, timeout=timeout) as response:
            data = response.read()
    except (HTTPError, URLError, TimeoutError) as exc:
        raise RuntimeError(f"Could not fetch feed {url}: {exc}") from exc

    root = ET.fromstring(data)
    channel = root.find("channel")
    source = _safe_text(channel, "title") or url

    articles: list[Article] = []
    for item in root.findall(".//item"):
        title = _safe_text(item, "title")
        link = _safe_text(item, "link")
        if not title or not link:
            continue

        description = _safe_text(item, "description")
        if not description:
            # Handle content:encoded namespaces
            for child in item:
                if child.tag.endswith("encoded") and child.text:
                    description = child.text.strip()
                    break

        published = _parse_pub_date(_safe_text(item, "pubDate"))
        articles.append(
            Article(
                title=title,
                link=link,
                published=published,
                source=source,
                content=_clean_html(description),
            )
        )
    return articles


def sentence_tokenize(text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return [s.strip() for s in sentences if s.strip()]


def summarize_text(text: str, max_sentences: int = 2) -> str:
    sentences = sentence_tokenize(text)
    if not sentences:
        return "No summary available."
    if len(sentences) <= max_sentences:
        return " ".join(sentences)

    words = re.findall(r"[A-Za-z']+", text.lower())
    freq = Counter(w for w in words if w not in STOPWORDS and len(w) > 2)
    if not freq:
        return " ".join(sentences[:max_sentences])

    scored: list[tuple[float, int, str]] = []
    for idx, sentence in enumerate(sentences):
        sentence_words = re.findall(r"[A-Za-z']+", sentence.lower())
        if not sentence_words:
            continue
        score = sum(freq.get(w, 0) for w in sentence_words) / max(len(sentence_words), 1)
        scored.append((score, idx, sentence))

    top = sorted(scored, key=lambda item: item[0], reverse=True)[:max_sentences]
    ordered = [s for _, _, s in sorted(top, key=lambda item: item[1])]
    return " ".join(ordered)


def aggregate_news(feeds: Iterable[str], limit: int) -> list[Article]:
    all_articles: list[Article] = []
    for feed in feeds:
        try:
            all_articles.extend(fetch_feed(feed))
        except RuntimeError as err:
            print(f"[warn] {err}")

    all_articles.sort(key=lambda a: a.published or datetime.min, reverse=True)
    return all_articles[:limit]


def build_report(articles: list[Article], summary_sentences: int) -> str:
    if not articles:
        return "No news articles were fetched."

    lines = ["# Latest News Digest", ""]
    for idx, article in enumerate(articles, start=1):
        published = article.published.isoformat() if article.published else "unknown"
        summary_input = article.content if article.content else article.title
        summary = summarize_text(summary_input, max_sentences=summary_sentences)

        lines.extend(
            [
                f"## {idx}. {article.title}",
                f"- Source: {article.source}",
                f"- Published: {published}",
                f"- Link: {article.link}",
                f"- Summary: {textwrap.fill(summary, width=100)}",
                "",
            ]
        )
    return "\n".join(lines)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scrape latest news and generate summaries.")
    parser.add_argument(
        "--feed",
        action="append",
        dest="feeds",
        help="RSS feed URL to include (can be repeated).",
    )
    parser.add_argument("--limit", type=int, default=10, help="Maximum number of articles to include.")
    parser.add_argument(
        "--summary-sentences",
        type=int,
        default=2,
        help="Number of sentences in each article summary.",
    )
    parser.add_argument(
        "--save",
        type=str,
        default="",
        help="Optional file path to save the digest in Markdown format.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    feeds = args.feeds if args.feeds else DEFAULT_FEEDS

    articles = aggregate_news(feeds=feeds, limit=max(args.limit, 1))
    report = build_report(articles, summary_sentences=max(args.summary_sentences, 1))
    print(report)

    if args.save:
        with open(args.save, "w", encoding="utf-8") as handle:
            handle.write(report)
        print(f"\nSaved digest to {args.save}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

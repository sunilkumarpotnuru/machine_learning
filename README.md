# machine_learning
This repository contains machine learning related codes.

## News scraping and summarization agent
A simple command-line agent is available in `news_agent.py`.

### What it does
- Scrapes the latest items from RSS news feeds.
- Sorts by publication time.
- Produces short extractive summaries for each article.
- Prints a Markdown digest and can optionally save it to a file.

### Run
```bash
python3 news_agent.py --limit 5 --summary-sentences 2 --save latest_news.md
```

### Custom feeds
You can provide your own feeds:

```bash
python3 news_agent.py --feed "https://feeds.bbci.co.uk/news/world/rss.xml" --feed "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
```

#!/usr/bin/env python3
"""Fetch RTHK Traditional-Chinese RSS, publish only headlines and source links.

No third-party RSS proxy, external Python dependencies, or secrets required.
The output is a static JSON file included in the GitHub Pages deployment artifact.
"""
from __future__ import annotations

import datetime as dt
import email.utils
import json
import os
from pathlib import Path
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'news.json'
FEEDS = {
    'local': 'https://rthk.hk/rthk/news/rss/c_expressnews_clocal.xml',
    'china': 'https://rthk.hk/rthk/news/rss/c_expressnews_greaterchina.xml',
    'world': 'https://rthk.hk/rthk/news/rss/c_expressnews_cinternational.xml',
}


def text(item: ET.Element, tag: str) -> str:
    found = item.find(tag)
    return ''.join(found.itertext()).strip() if found is not None else ''


def to_iso(raw: str) -> str | None:
    if not raw:
        return None
    try:
        timestamp = email.utils.parsedate_to_datetime(raw)
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=dt.timezone(dt.timedelta(hours=8)))
        return timestamp.astimezone(dt.timezone.utc).isoformat(timespec='seconds')
    except (TypeError, ValueError, IndexError):
        return None


def parse_rss(payload: bytes, limit: int = 15) -> list[dict]:
    xml = ET.fromstring(payload)
    articles = []
    seen = set()
    for item in xml.findall('.//item'):
        title = re.sub(r'\s+', ' ', text(item, 'title')).strip()
        url = text(item, 'link')
        # Only external HTTPS articles from RTHK's official sites are published.
        parsed = urllib.parse.urlsplit(url)
        if parsed.scheme != 'https' or not parsed.hostname or not (
            parsed.hostname == 'rthk.hk' or parsed.hostname.endswith('.rthk.hk')
        ):
            continue
        if not title or url in seen:
            continue
        seen.add(url)
        articles.append({
            'title': title[:190],
            'url': url,
            'date': to_iso(text(item, 'pubDate')),
        })
        if len(articles) >= limit:
            break
    return articles


def download(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'MyDayDashboard/5.0 (Personal RSS display; GitHub Pages)',
                 'Accept': 'application/rss+xml, application/xml, text/xml, */*'},
    )
    with urllib.request.urlopen(req, timeout=18) as resp:
        if resp.status != 200:
            raise ValueError(f'HTTP {resp.status}')
        return resp.read(1_500_001)[:1_500_000]


def main() -> int:
    current = {}
    if OUT.exists():
        try:
            current = json.loads(OUT.read_text(encoding='utf-8')).get('categories', {})
        except (ValueError, OSError):
            current = {}

    categories = {}
    failures = []
    for label, url in FEEDS.items():
        try:
            items = parse_rss(download(url))
            if not items:
                raise ValueError('沒有可用繁體中文新聞項目')
            categories[label] = items
            print(f'{label}: {len(items)} articles', flush=True)
        except Exception as error:
            categories[label] = current.get(label, [])
            failures.append(f'{label}: {error}')
            print(f'WARNING: {failures[-1]}', file=sys.stderr, flush=True)

    # If every feed is unavailable, keep any previously packaged data, clearly timestamped.
    updated = bool(any(categories.values()))
    result = {
        'generated_at': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds'),
        'source': '香港電台 RSS',
        'categories': categories,
        'failed_sources': failures,
        'note': '新聞由 GitHub Actions 定時取得，並非秒級即時。' if updated else 'RSS 暫不可用；未提供模擬新聞。',
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    # Do not fail a deployment just because an upstream source is temporarily unavailable.
    return 0


if __name__ == '__main__':
    sys.exit(main())

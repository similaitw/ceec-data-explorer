from __future__ import annotations

from pathlib import PurePosixPath
from urllib.parse import unquote, urljoin, urlparse

from bs4 import BeautifulSoup

from .config import CATEGORY_TITLES, LIST_URL, PARSER_IDS, REGIME_ID, YEARS
from .http import RateLimitedSession
from .models import SourceRecord


def discover_sources(session: RateLimitedSession | None = None) -> list[SourceRecord]:
    client = session or RateLimitedSession()
    listing = BeautifulSoup(client.get(LIST_URL).content, "html.parser")
    year_pages: dict[int, str] = {}
    for link in listing.select("a[href]"):
        href = link.get("href")
        if not isinstance(href, str):
            continue
        label = link.get_text(" ", strip=True)
        for year in YEARS:
            if f"{year}學年度學科能力測驗統計圖表" in label:
                year_pages[year] = urljoin(LIST_URL, href)

    missing_years = sorted(set(YEARS) - year_pages.keys())
    if missing_years:
        raise RuntimeError(f"官方清單缺少年度頁：{missing_years}")

    records: list[SourceRecord] = []
    for year in YEARS:
        landing_url = year_pages[year]
        page = BeautifulSoup(client.get(landing_url).content, "html.parser")
        links: list[tuple[str, str]] = []
        for link in page.select("a[href]"):
            href = link.get("href")
            if isinstance(href, str):
                links.append((link.get_text(" ", strip=True), urljoin(landing_url, href)))
        for category, titles in CATEGORY_TITLES.items():
            matches = [(label, url) for label, url in links if label in titles]
            if len(matches) != 1:
                raise RuntimeError(f"{year} {titles[0]} 預期 1 個附件，實際 {len(matches)} 個")
            label, download_url = matches[0]
            filename = unquote(PurePosixPath(urlparse(download_url).path).name)
            suffix = PurePosixPath(filename).suffix.lower()
            if suffix not in {".xls", ".xlsx"}:
                raise RuntimeError(f"{year} {titles[0]} 非 Excel 附件：{download_url}")
            records.append(SourceRecord.model_validate({
                "source_id": f"gsat-{year}-{category.replace('_', '-')}",
                "academic_year": year,
                "regime_id": REGIME_ID,
                "category": category,
                "title": label,
                "landing_page_url": landing_url,
                "download_url": download_url,
                "original_filename": filename,
                "parser_id": PARSER_IDS[category],
            }))
    return records

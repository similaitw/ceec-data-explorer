from __future__ import annotations

import argparse

from .catalog import load_catalog, save_catalog
from .config import CATALOG_DIR, ensure_directories
from .discover import discover_sources
from .download import download_sources


CATALOG_PATH = CATALOG_DIR / "sources.json"


def run_discover() -> None:
    records = discover_sources()
    previous = {record.source_id: record for record in load_catalog(CATALOG_PATH)}
    for record in records:
        old = previous.get(record.source_id)
        if old and old.download_url == record.download_url:
            record.mime_type = old.mime_type
            record.downloaded_at = old.downloaded_at
            record.sha256 = old.sha256
            record.parse_status = old.parse_status
            record.local_path = old.local_path
            record.warnings = old.warnings
    save_catalog(CATALOG_PATH, records)
    print(f"已發現 {len(records)} 個來源，寫入 {CATALOG_PATH}")


def run_download() -> None:
    records = load_catalog(CATALOG_PATH)
    if not records:
        raise SystemExit("找不到來源清冊，請先執行 discover")
    download_sources(records)
    save_catalog(CATALOG_PATH, records)
    print(f"已快取並驗證 {len(records)} 個附件")


def main() -> None:
    parser = argparse.ArgumentParser(description="大考中心統計資料 ETL")
    parser.add_argument("command", choices=("discover", "download", "transform", "validate", "all"))
    args = parser.parse_args()
    ensure_directories()
    if args.command in {"discover", "all"}:
        run_discover()
    if args.command in {"download", "all"}:
        run_download()
    if args.command in {"transform", "validate", "all"}:
        from .pipeline import run_transform, run_validate
        if args.command in {"transform", "all"}:
            run_transform(CATALOG_PATH)
        if args.command in {"validate", "all"}:
            run_validate(CATALOG_PATH)


if __name__ == "__main__":
    main()

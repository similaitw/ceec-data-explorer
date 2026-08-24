from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from pathlib import Path

from .config import PROJECT_ROOT, RAW_DIR
from .http import RateLimitedSession
from .models import SourceRecord


def _content_kind(content: bytes) -> str:
    if content.startswith(bytes.fromhex("D0CF11E0A1B11AE1")):
        return ".xls"
    if content.startswith(b"PK\x03\x04"):
        return ".xlsx"
    return "unknown"


def download_sources(records: list[SourceRecord], session: RateLimitedSession | None = None) -> list[SourceRecord]:
    client = session or RateLimitedSession()
    for record in records:
        target_dir = RAW_DIR / "gsat" / str(record.academic_year)
        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / record.original_filename
        warnings = list(record.warnings)

        if target.exists():
            content = target.read_bytes()
        else:
            response = client.get(str(record.download_url))
            content = response.content
            target.write_bytes(content)
            record.mime_type = response.headers.get("Content-Type", "").split(";", 1)[0] or None

        actual_kind = _content_kind(content)
        expected_kind = target.suffix.lower()
        if actual_kind == "unknown":
            raise RuntimeError(f"附件內容不是支援的 Excel：{record.download_url}")
        if actual_kind != expected_kind:
            warnings.append(f"副檔名 {expected_kind} 與檔案簽章 {actual_kind} 不一致")
        record.sha256 = hashlib.sha256(content).hexdigest()
        record.downloaded_at = record.downloaded_at or datetime.now(timezone.utc).isoformat()
        record.local_path = target.relative_to(PROJECT_ROOT).as_posix()
        record.warnings = sorted(set(warnings))
    return records


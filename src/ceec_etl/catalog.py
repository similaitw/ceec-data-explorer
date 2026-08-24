from __future__ import annotations

import json
from pathlib import Path

from .models import SourceRecord


def load_catalog(path: Path) -> list[SourceRecord]:
    if not path.exists():
        return []
    return [SourceRecord.model_validate(row) for row in json.loads(path.read_text(encoding="utf-8"))]


def save_catalog(path: Path, records: list[SourceRecord]) -> None:
    rows = [record.model_dump(mode="json") for record in sorted(records, key=lambda r: (r.academic_year, r.category))]
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


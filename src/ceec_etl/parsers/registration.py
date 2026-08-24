from __future__ import annotations

from pathlib import Path

from .common import as_int, read_first_sheet


def parse_registration(path: Path | str, year: int, source_id: str) -> list[dict]:
    frame = read_first_sheet(path)
    total_rows = [i for i, value in enumerate(frame.iloc[:, 0]) if str(value).strip() == "合計"]
    if not total_rows:
        raise ValueError("找不到報名合計列")
    row_index = total_rows[-1]
    header_index = next(
        (i for i in range(row_index - 1, -1, -1) if "合計" in {str(v).strip() for v in frame.iloc[i].tolist()}),
        None,
    )
    if header_index is None:
        raise ValueError("找不到報名合計欄")
    total_column = next(i for i, value in enumerate(frame.iloc[header_index]) if str(value).strip() == "合計")
    return [{
        "academic_year": year,
        "exam": "GSAT",
        "group_type": "all_candidates",
        "group_name": "全體報名考生",
        "subject_id": None,
        "registered_count": as_int(frame.iat[row_index, total_column]),
        "attended_count": None,
        "absent_count": None,
        "absence_rate": None,
        "is_derived": False,
        "derivation_method": None,
        "derivation_version": None,
        "input_source_ids": [source_id],
        "source_id": source_id,
    }]


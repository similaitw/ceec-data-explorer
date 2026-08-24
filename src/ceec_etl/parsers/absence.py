from __future__ import annotations

from pathlib import Path

from .common import as_int, read_first_sheet, subject_id


def parse_absence(path: Path | str, year: int, source_id: str) -> list[dict]:
    frame = read_first_sheet(path)
    subject_row = next(i for i in range(len(frame)) if "實到" in {str(v).strip() for v in frame.iloc[i].tolist()}) - 1
    metric_row = subject_row + 1
    total_row = next(i for i, value in enumerate(frame.iloc[:, 0]) if str(value).strip().startswith("合計"))
    rows: list[dict] = []
    for column in range(1, frame.shape[1], 2):
        name = frame.iat[subject_row, column]
        if str(name).strip() in {"", "nan"}:
            continue
        if str(frame.iat[metric_row, column]).strip() != "實到" or str(frame.iat[metric_row, column + 1]).strip() != "缺考":
            raise ValueError(f"{name} 的實到／缺考欄位漂移")
        attended = as_int(frame.iat[total_row, column])
        absent = as_int(frame.iat[total_row, column + 1])
        registered = attended + absent
        rows.append({
            "academic_year": year,
            "exam": "GSAT",
            "group_type": "subject_attendance",
            "group_name": str(name).strip(),
            "subject_id": subject_id(name),
            "registered_count": registered,
            "attended_count": attended,
            "absent_count": absent,
            "absence_rate": absent / registered * 100 if registered else None,
            "is_derived": True,
            "derivation_method": "缺考 / (實到 + 缺考) × 100；報考數 = 實到 + 缺考",
            "derivation_version": "1.0.0",
            "input_source_ids": [source_id],
            "source_id": source_id,
        })
    return rows


from __future__ import annotations

import re
from pathlib import Path

from .common import as_int, read_first_sheet, subject_id

NUMBER = re.compile(r"\d+(?:\.\d+)?")


def _parse_interval(value: object) -> tuple[float, float, bool, bool]:
    text = str(value).strip()
    numbers = [float(match) for match in NUMBER.findall(text)]
    if "=" in text and len(numbers) == 1:
        return numbers[0], numbers[0], True, True
    if len(numbers) != 2 or "X" not in text:
        raise ValueError(f"無法解析分數區間：{text}")
    return numbers[0], numbers[1], False, True


def parse_score_boundaries(path: Path | str, year: int, source_id: str) -> list[dict]:
    frame = read_first_sheet(path)
    subject_row = next(i for i, value in enumerate(frame.iloc[:, 0]) if str(value).strip() == "科目")
    grade_row = next(i for i in range(subject_row + 1, len(frame)) if str(frame.iat[i, 0]).strip() == "級分")
    subjects = [(column, frame.iat[subject_row, column]) for column in range(1, frame.shape[1])]
    rows: list[dict] = []
    for row_index in range(grade_row + 1, len(frame)):
        try:
            grade = as_int(frame.iat[row_index, 0])
        except (TypeError, ValueError):
            break
        for column, name in subjects:
            raw = str(frame.iat[row_index, column]).strip()
            low, high, low_inclusive, high_inclusive = _parse_interval(raw)
            rows.append({
                "academic_year": year,
                "exam": "GSAT",
                "subject_id": subject_id(name),
                "grade": grade,
                "raw_score_lower": low,
                "raw_score_upper": high,
                "lower_inclusive": low_inclusive,
                "upper_inclusive": high_inclusive,
                "source_interval_text": raw,
                "source_id": source_id,
            })
    return rows


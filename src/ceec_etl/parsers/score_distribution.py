from __future__ import annotations

from pathlib import Path

from .common import as_float, as_int, read_first_sheet, subject_id


def parse_score_distribution(path: Path | str, year: int, source_id: str) -> list[dict]:
    frame = read_first_sheet(path)
    section_rows = [i for i, value in enumerate(frame.iloc[:, 0]) if str(value).strip() == "級分"]
    rows: list[dict] = []
    for section_row in section_rows:
        for start_column in (1, 7):
            if start_column >= frame.shape[1]:
                continue
            name = frame.iat[section_row, start_column]
            if str(name).strip() in {"", "nan"}:
                continue
            for row_index in range(section_row + 3, min(section_row + 19, len(frame))):
                try:
                    grade = as_int(frame.iat[row_index, 0])
                except (TypeError, ValueError):
                    break
                rows.append({
                    "academic_year": year,
                    "exam": "GSAT",
                    "subject_id": subject_id(name),
                    "grade": grade,
                    "count": as_int(frame.iat[row_index, start_column]),
                    "percentage": as_float(frame.iat[row_index, start_column + 1]),
                    "cumulative_low_count": as_int(frame.iat[row_index, start_column + 2]),
                    "cumulative_low_percentage": as_float(frame.iat[row_index, start_column + 3]),
                    "cumulative_high_count": as_int(frame.iat[row_index, start_column + 4]),
                    "cumulative_high_percentage": as_float(frame.iat[row_index, start_column + 5]),
                    "source_id": source_id,
                })
    return rows


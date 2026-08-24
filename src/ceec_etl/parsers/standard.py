from __future__ import annotations

from pathlib import Path

from .common import as_float, as_int, read_first_sheet, subject_id


def parse_standards(path: Path | str, year: int, source_id: str) -> list[dict]:
    frame = read_first_sheet(path)
    subject_row = next(i for i, value in enumerate(frame.iloc[:, 0]) if str(value).strip() == "科目")
    start_row = next(i for i in range(subject_row + 1, len(frame)) if str(frame.iat[i, 0]).strip() in {str(year), f"{year}.0"})
    subjects = [(column, frame.iat[subject_row, column]) for column in range(2, frame.shape[1], 2)]
    rows: list[dict] = []
    for row_index in range(start_row, start_row + 5):
        standard = str(frame.iat[row_index, 1]).strip()
        for column, name in subjects:
            grade_value = frame.iat[row_index, column]
            if str(grade_value).strip() in {"--", "", "nan"}:
                continue
            rows.append({
                "academic_year": year,
                "exam": "GSAT",
                "subject_id": subject_id(name),
                "standard": standard,
                "grade": as_int(grade_value),
                "cumulative_percentage": as_float(frame.iat[row_index, column + 1]),
                "source_id": source_id,
            })
    return rows


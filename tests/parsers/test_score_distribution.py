import json
from pathlib import Path

import pandas as pd

from ceec_etl.parsers import score_distribution as module


def test_real_layout_fixture(monkeypatch):
    fixture = json.loads((Path(__file__).parents[1] / "fixtures" / "score_distribution_115.json").read_text(encoding="utf-8"))
    frame = pd.DataFrame(fixture["rows"])
    # Parser expects the second subject block to begin at column 7; the fixture intentionally contains one block.
    monkeypatch.setattr(module, "read_first_sheet", lambda _: frame)
    rows = module.parse_score_distribution("unused.xls", 115, "gsat-115-score-distribution")
    assert rows == [
        {
            "academic_year": 115, "exam": "GSAT", "subject_id": "chinese", "grade": 15,
            "count": 2563, "percentage": 2.17, "cumulative_low_count": 118026,
            "cumulative_low_percentage": 100.0, "cumulative_high_count": 2563,
            "cumulative_high_percentage": 2.17, "source_id": "gsat-115-score-distribution",
        },
        {
            "academic_year": 115, "exam": "GSAT", "subject_id": "chinese", "grade": 14,
            "count": 5911, "percentage": 5.01, "cumulative_low_count": 115463,
            "cumulative_low_percentage": 97.83, "cumulative_high_count": 8474,
            "cumulative_high_percentage": 7.18, "source_id": "gsat-115-score-distribution",
        },
    ]


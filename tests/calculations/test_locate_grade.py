from ceec_etl.calculations import locate_grade


STANDARDS = [
    {"standard": "頂標", "grade": 13},
    {"standard": "前標", "grade": 12},
    {"standard": "均標", "grade": 10},
    {"standard": "後標", "grade": 9},
    {"standard": "底標", "grade": 7},
]


def test_tied_score_returns_interval_not_fake_rank():
    result = locate_grade(
        {"grade": 10, "count": 19383, "percentage": 16.42, "cumulative_low_percentage": 65.72},
        STANDARDS,
    )
    assert result["pr_lower"] == 49.3
    assert result["pr_upper"] == 65.72
    assert result["standard_band"] == "均標"


def test_grade_below_bottom_standard():
    result = locate_grade(
        {"grade": 6, "count": 1, "percentage": 4.0, "cumulative_low_percentage": 10.0},
        STANDARDS,
    )
    assert result["standard_band"] == "未達底標"


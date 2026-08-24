from ceec_etl.parsers.score_boundary import _parse_interval


def test_regular_interval_preserves_open_lower_bound():
    assert _parse_interval("71.48＜X≦100.00") == (71.48, 100.0, False, True)


def test_zero_grade_is_exact_value():
    assert _parse_interval("X = 0.00") == (0.0, 0.0, True, True)


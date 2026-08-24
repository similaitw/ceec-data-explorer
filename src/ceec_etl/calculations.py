from __future__ import annotations

from typing import Iterable


def locate_grade(distribution_row: dict, standards: Iterable[dict]) -> dict:
    """Return an honest tied-score percentile interval and five-standard band."""
    percentage = float(distribution_row["percentage"])
    cumulative_low = float(distribution_row["cumulative_low_percentage"])
    pr_lower = max(0.0, cumulative_low - percentage)
    grade = int(distribution_row["grade"])
    ordered = ("頂標", "前標", "均標", "後標", "底標")
    threshold = {row["standard"]: int(row["grade"]) for row in standards}
    band = "未達底標"
    for name in ordered:
        if name in threshold and grade >= threshold[name]:
            band = name
            break
    return {
        "grade": grade,
        "same_grade_count": int(distribution_row["count"]),
        "pr_lower": round(pr_lower, 10),
        "pr_upper": cumulative_low,
        "standard_band": band,
        "is_derived": True,
        "derivation_method": "PR 區間 = [低至高累計百分比 − 同級分百分比, 低至高累計百分比]",
        "derivation_version": "1.0.0",
    }


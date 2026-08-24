from __future__ import annotations

from pathlib import Path
from typing import Any, cast

import pandas as pd

SUBJECT_IDS = {
    "國文": "chinese",
    "國綜": "chinese_integrated",
    "國寫": "chinese_writing",
    "英文": "english",
    "數學A": "mathematics_a",
    "數學B": "mathematics_b",
    "社會": "social_studies",
    "自然": "natural_sciences",
}


def read_first_sheet(path: Path | str) -> pd.DataFrame:
    return pd.read_excel(path, sheet_name=0, header=None)


def as_int(value: object) -> int:
    if pd.isna(value):
        raise ValueError("預期整數但讀到空值")
    return int(float(cast(Any, value)))


def as_float(value: object) -> float:
    if pd.isna(value):
        raise ValueError("預期數值但讀到空值")
    return float(cast(Any, value))


def subject_id(name: object) -> str:
    label = str(name).strip()
    if label not in SUBJECT_IDS:
        raise ValueError(f"未知科目：{label}")
    return SUBJECT_IDS[label]

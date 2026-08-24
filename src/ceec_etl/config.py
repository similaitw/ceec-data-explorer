from __future__ import annotations

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
CATALOG_DIR = DATA_DIR / "catalog"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
QUALITY_DIR = DATA_DIR / "quality"

LIST_URL = "https://www.ceec.edu.tw/xmdoc?xsmsid=0J018604485538810196"
YEARS = tuple(range(111, 116))
REGIME_ID = "GSAT_111_PLUS"
USER_AGENT = "CEEC-Data-Explorer/0.1 (public education data; low-rate build-time fetch)"
REQUEST_INTERVAL_SECONDS = 1.2

CATEGORY_TITLES = {
    "registration": ("報名人數統計總表",),
    "absence": ("缺考人數統計總表",),
    "score_boundary": ("原得總分與級分對照表",),
    # 111 的官方標題較短，但附件內仍包含人數、百分比與累計欄位。
    "score_distribution": ("各科級分人數百分比累計表", "各科級分人數分布表"),
    "standard": ("各科成績標準一覽表",),
}

PARSER_IDS = {
    "registration": "gsat_registration_v1",
    "absence": "gsat_absence_v1",
    "score_boundary": "gsat_score_boundary_v1",
    "score_distribution": "gsat_score_distribution_v1",
    "standard": "gsat_standard_v1",
}


def ensure_directories() -> None:
    for path in (CATALOG_DIR, RAW_DIR, PROCESSED_DIR, QUALITY_DIR):
        path.mkdir(parents=True, exist_ok=True)

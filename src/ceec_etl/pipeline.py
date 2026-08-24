from __future__ import annotations

import csv
import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

from pydantic import BaseModel

from .catalog import load_catalog, save_catalog
from .config import PROCESSED_DIR, QUALITY_DIR
from .parsers import parse_absence, parse_registration, parse_score_boundaries, parse_score_distribution, parse_standards
from .schemas import RegistrationFact, ScoreBoundaryFact, ScoreDistributionFact, StandardFact

DATASETS: dict[str, type[BaseModel]] = {
    "fact_registration": RegistrationFact,
    "fact_score_boundary": ScoreBoundaryFact,
    "fact_score_distribution": ScoreDistributionFact,
    "fact_standard": StandardFact,
}


def _write_dataset(name: str, rows: list[dict]) -> None:
    target_dir = PROCESSED_DIR / "gsat"
    target_dir.mkdir(parents=True, exist_ok=True)
    csv_path = target_dir / f"{name}.csv"
    json_path = target_dir / f"{name}.json"
    fieldnames = list(rows[0]) if rows else []
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows({key: json.dumps(value, ensure_ascii=False) if isinstance(value, list) else value for key, value in row.items()} for row in rows)
    envelope = {
        "schema_version": "1.0.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_ids": sorted({row["source_id"] for row in rows}),
        "data": rows,
        "notes": [],
        "quality": {"status": "pending", "warnings": []},
    }
    json_path.write_text(json.dumps(envelope, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run_transform(catalog_path: Path) -> None:
    records = load_catalog(catalog_path)
    datasets: dict[str, list[dict]] = defaultdict(list)
    parser_map = {
        "registration": ("fact_registration", parse_registration),
        "absence": ("fact_registration", parse_absence),
        "score_boundary": ("fact_score_boundary", parse_score_boundaries),
        "score_distribution": ("fact_score_distribution", parse_score_distribution),
        "standard": ("fact_standard", parse_standards),
    }
    for record in records:
        if not record.local_path:
            raise RuntimeError(f"尚未下載：{record.source_id}")
        dataset, parser = parser_map[record.category]
        try:
            parsed = parser(record.local_path, record.academic_year, record.source_id)
            schema = DATASETS[dataset]
            datasets[dataset].extend(schema.model_validate(row).model_dump() for row in parsed)
            record.parse_status = "warning" if record.warnings else "success"
        except Exception as exc:
            record.parse_status = "failed"
            record.warnings = sorted(set(record.warnings + [f"解析失敗：{exc}"]))
            save_catalog(catalog_path, records)
            raise
    for name, rows in datasets.items():
        rows.sort(key=lambda row: tuple(str(row.get(key, "")) for key in ("academic_year", "subject_id", "grade", "standard", "group_type")))
        _write_dataset(name, rows)
    save_catalog(catalog_path, records)
    print("已輸出 " + "、".join(f"{name} {len(rows)} 列" for name, rows in datasets.items()))


def _load_rows(name: str) -> list[dict]:
    path = PROCESSED_DIR / "gsat" / f"{name}.json"
    return json.loads(path.read_text(encoding="utf-8"))["data"]


def run_validate(catalog_path: Path) -> None:
    checks: list[dict] = []

    def check(name: str, passed: bool, detail: str) -> None:
        checks.append({"check": name, "status": "passed" if passed else "failed", "detail": detail})

    registration = _load_rows("fact_registration")
    distribution = _load_rows("fact_score_distribution")
    boundaries = _load_rows("fact_score_boundary")
    standards = _load_rows("fact_standard")

    check("registration_year_coverage", {row["academic_year"] for row in registration} == set(range(111, 116)), "應涵蓋 111–115")
    check("distribution_expected_rows", len(distribution) == 5 * 6 * 16, f"實際 {len(distribution)}，預期 480")
    check("boundary_expected_rows", len(boundaries) == 5 * 6 * 16, f"實際 {len(boundaries)}，預期 480")
    check("standard_expected_rows", len(standards) == 5 * 6 * 5, f"實際 {len(standards)}，預期 150")

    grouped_distribution: dict[tuple, list[dict]] = defaultdict(list)
    for row in distribution:
        grouped_distribution[(row["academic_year"], row["subject_id"])].append(row)
    for key, rows in grouped_distribution.items():
        rows.sort(key=lambda row: row["grade"])
        total = sum(row["count"] for row in rows)
        check(f"distribution_reconcile_{key[0]}_{key[1]}", rows[-1]["cumulative_low_count"] == total == rows[0]["cumulative_high_count"], f"級分合計 {total}")
        check(f"distribution_monotonic_{key[0]}_{key[1]}", all(rows[i]["cumulative_low_count"] <= rows[i + 1]["cumulative_low_count"] for i in range(15)), "低至高累計應隨級分增加")

    grouped_boundaries: dict[tuple, list[dict]] = defaultdict(list)
    for row in boundaries:
        grouped_boundaries[(row["academic_year"], row["subject_id"])].append(row)
    for key, rows in grouped_boundaries.items():
        rows.sort(key=lambda row: row["grade"])
        no_overlap = all(rows[i]["raw_score_upper"] <= rows[i + 1]["raw_score_lower"] + 0.011 for i in range(15))
        check(f"boundary_nonoverlap_{key[0]}_{key[1]}", no_overlap, "相鄰級分區間不得重疊（容許官方顯示四捨五入 0.01）")

    order = {"頂標": 0, "前標": 1, "均標": 2, "後標": 3, "底標": 4}
    grouped_standards: dict[tuple, list[dict]] = defaultdict(list)
    for row in standards:
        grouped_standards[(row["academic_year"], row["subject_id"])].append(row)
    for key, rows in grouped_standards.items():
        grades = [row["grade"] for row in sorted(rows, key=lambda row: order[row["standard"]])]
        check(f"standard_order_{key[0]}_{key[1]}", all(a >= b for a, b in zip(grades, grades[1:])), f"五標級分 {grades}")

    failed = [item for item in checks if item["status"] == "failed"]
    records = load_catalog(catalog_path)
    dataset_rows = {name: len(_load_rows(name)) for name in DATASETS}
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "failed" if failed else "passed",
        "coverage": {"exam": "GSAT", "academic_years": list(range(111, 116)), "source_files": len(records)},
        "source_status": {status: sum(record.parse_status == status for record in records) for status in ("success", "warning", "failed", "pending")},
        "dataset_rows": dataset_rows,
        "checks": checks,
        "warnings": sorted({warning for record in records for warning in record.warnings}),
    }
    QUALITY_DIR.mkdir(parents=True, exist_ok=True)
    (QUALITY_DIR / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    summary = ["# 資料品質報告", "", f"- 狀態：**{report['status']}**", f"- 涵蓋：學測 111–115 學年度", f"- 官方附件：{len(records)} 份", f"- 自動檢核：{len(checks) - len(failed)} 通過／{len(failed)} 失敗", "", "## 資料列數", ""]
    summary.extend(f"- `{name}`：{count} 列" for name, count in dataset_rows.items())
    summary.extend(["", "## 警告", "", *(f"- {warning}" for warning in report["warnings"] or ["無"]), ""])
    (QUALITY_DIR / "report.md").write_text("\n".join(summary), encoding="utf-8")
    if failed:
        raise RuntimeError(f"資料品質檢核失敗：{len(failed)} 項；詳見 data/quality/report.json")
    for name in DATASETS:
        dataset_path = PROCESSED_DIR / "gsat" / f"{name}.json"
        envelope = json.loads(dataset_path.read_text(encoding="utf-8"))
        envelope["quality"] = {"status": "passed", "warnings": report["warnings"]}
        dataset_path.write_text(json.dumps(envelope, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"資料品質檢核通過：{len(checks)} 項")

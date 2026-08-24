from __future__ import annotations

import csv
import json
import re
import ssl
import tempfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "processed" / "admissions"
YEARS = range(111, 116)
EXPECTED_ADMITTED = {111: 25028, 112: 36338, 113: 35076, 114: 32497, 115: 32257}
UDB_URL = "https://udb.moe.edu.tw/ulist/Resource/download/%E5%85%A8%E5%9C%8B%E5%A4%A7%E5%B0%88%E6%A0%A1%E9%99%A2%E5%8F%8A%E6%A0%A1%E9%95%B7%E5%90%8D%E9%8C%84%28%E5%90%AB%E5%AD%B8%E6%A0%A1%E6%9C%AC%E9%83%A8%E5%9C%B0%E5%9D%80%29?extension=pdf"

ALIASES = {
    "中華大學": ("私立", "新竹市"),
    "康寧大學": ("私立", "臺北市"),
    "慈濟大學": ("私立", "花蓮縣"),
    "明道大學": ("私立", "彰化縣"),
    "淡江大學": ("私立", "新北市"),
    "輔仁大學": ("私立", "新北市"),
    "馬偕醫學大學": ("私立", "新北市"),
    "馬偕醫學院": ("私立", "新北市"),
}

GROUP_ROWS = [
    ("教育", 1113, 100.00), ("跨領域", 77, 100.00), ("數理化", 2174, 100.00),
    ("財經", 3409, 99.71), ("生命科學", 1478, 99.66), ("工程", 6864, 99.55),
    ("資訊", 5333, 99.14), ("地球環境", 857, 98.62), ("法政", 1997, 98.57),
    ("文史哲", 1962, 98.15), ("醫藥衛生", 3383, 97.89), ("管理", 4669, 97.70),
    ("生物資源", 824, 97.63), ("外語", 2008, 97.33), ("社會心理", 1591, 96.60),
    ("建築設計", 1323, 94.10), ("大眾傳播", 1119, 93.72), ("藝術", 962, 92.77),
    ("遊憩運動", 734, 92.44),
]


def clean(value: str | None) -> str:
    return (value or "").replace("\n", "").strip()


def download(url: str, destination: Path) -> None:
    context = ssl.create_default_context()
    context.verify_flags &= ~ssl.VERIFY_X509_STRICT
    request = Request(url, headers={"User-Agent": "ceec-data-explorer/1.0"})
    with urlopen(request, timeout=60, context=context) as response:
        destination.write_bytes(response.read())


def extract_institutions(path: Path) -> dict[str, tuple[str, str]]:
    result: dict[str, tuple[str, str]] = {}
    with pdfplumber.open(path) as document:
        for page in document.pages:
            for table in page.extract_tables():
                for row in table:
                    if len(row) >= 10 and row[2] in {"公立", "私立"}:
                        result[clean(row[4])] = (clean(row[2]), clean(row[9]))
    return result


def extract_university_rows(path: Path, year: int, institutions: dict[str, tuple[str, str]]) -> list[dict]:
    aggregate: dict[str, dict[str, int]] = defaultdict(lambda: {"program_count": 0, "admitted_count": 0})
    with pdfplumber.open(path) as document:
        for page in document.pages:
            for table in page.extract_tables():
                for row in table:
                    if len(row) < 6 or not re.fullmatch(r"\d{4}", clean(row[0])) or not clean(row[4]).isdigit():
                        continue
                    university = clean(row[1])
                    aggregate[university]["program_count"] += 1
                    aggregate[university]["admitted_count"] += int(clean(row[4]))

    rows = []
    for university, values in sorted(aggregate.items()):
        ownership, region = institutions.get(university, ALIASES.get(university, ("", "")))
        if not ownership or not region:
            raise ValueError(f"找不到學校屬性：{university}")
        rows.append({
            "academic_year": year,
            "university": university,
            "ownership": ownership,
            "region": region,
            **values,
            "source_id": f"uac-{year}-program-results",
            "institution_source_id": "moe-114-institution-directory",
        })
    if sum(row["admitted_count"] for row in rows) != EXPECTED_ADMITTED[year]:
        raise ValueError(f"{year} 錄取人數未能與官方總數勾稽")
    return rows


def write_csv(path: Path, rows: list[dict]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def write_envelope(path: Path, rows: list[dict], source_ids: list[str], notes: list[str]) -> None:
    envelope = {
        "schema_version": "1.0.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_ids": source_ids,
        "data": rows,
        "notes": notes,
        "quality": {"status": "passed", "warnings": []},
    }
    path.write_text(json.dumps(envelope, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="ceec-admission-") as temp_dir:
        temp = Path(temp_dir)
        institution_pdf = temp / "institutions.pdf"
        download(UDB_URL, institution_pdf)
        institutions = extract_institutions(institution_pdf)
        university_rows: list[dict] = []
        for year in YEARS:
            pdf_path = temp / f"{year}_result_school_data.pdf"
            download(f"https://www2.uac.edu.tw/{year}data/{year}_result_school_data.pdf", pdf_path)
            university_rows.extend(extract_university_rows(pdf_path, year, institutions))

    group_rows = [{
        "academic_year": 115,
        "group": group,
        "admitted_count": admitted,
        "capacity_usage_rate": usage,
        "source_id": "uac-115-result-presentation",
    } for group, admitted, usage in GROUP_ROWS]

    write_csv(OUTPUT / "fact_university_admission.csv", university_rows)
    write_envelope(
        OUTPUT / "fact_university_admission.json",
        university_rows,
        [*(f"uac-{year}-program-results" for year in YEARS), "moe-114-institution-directory"],
        ["地區以教育部 114 學年度名錄的學校本部縣市為準。", "錄取人數含外加名額。", "不同校系採計科目與加權不同，不跨校比較最低錄取分數。"],
    )
    write_csv(OUTPUT / "fact_group_admission.csv", group_rows)
    write_envelope(
        OUTPUT / "fact_group_admission.json",
        group_rows,
        ["uac-115-result-presentation"],
        ["部分系組跨兩個學群，學群錄取人數加總會大於全體錄取總數。", "目前官方放榜簡報僅提供 115 學年度學群彙總。"],
    )
    print(f"輸出 {len(university_rows)} 列大學年度統計與 {len(group_rows)} 列學群統計")


if __name__ == "__main__":
    main()

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class SourceRecord(BaseModel):
    source_id: str
    exam: Literal["GSAT"] = "GSAT"
    academic_year: int = Field(ge=80, le=200)
    regime_id: str
    category: str
    title: str
    landing_page_url: HttpUrl
    download_url: HttpUrl
    original_filename: str
    mime_type: str | None = None
    downloaded_at: str | None = None
    sha256: str | None = None
    parser_id: str
    parse_status: Literal["pending", "success", "warning", "failed"] = "pending"
    local_path: str | None = None
    warnings: list[str] = []
    license_note: str = "資料來源：大學入學考試中心"


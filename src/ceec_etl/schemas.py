from __future__ import annotations

from pydantic import BaseModel, Field


class RegistrationFact(BaseModel):
    academic_year: int
    exam: str
    group_type: str
    group_name: str
    subject_id: str | None
    registered_count: int = Field(ge=0)
    attended_count: int | None = Field(default=None, ge=0)
    absent_count: int | None = Field(default=None, ge=0)
    absence_rate: float | None = Field(default=None, ge=0, le=100)
    is_derived: bool
    derivation_method: str | None
    derivation_version: str | None
    input_source_ids: list[str]
    source_id: str


class ScoreBoundaryFact(BaseModel):
    academic_year: int
    exam: str
    subject_id: str
    grade: int = Field(ge=0, le=15)
    raw_score_lower: float = Field(ge=0)
    raw_score_upper: float = Field(ge=0)
    lower_inclusive: bool
    upper_inclusive: bool
    source_interval_text: str
    source_id: str


class ScoreDistributionFact(BaseModel):
    academic_year: int
    exam: str
    subject_id: str
    grade: int = Field(ge=0, le=15)
    count: int = Field(ge=0)
    percentage: float = Field(ge=0, le=100)
    cumulative_low_count: int = Field(ge=0)
    cumulative_low_percentage: float = Field(ge=0, le=100)
    cumulative_high_count: int = Field(ge=0)
    cumulative_high_percentage: float = Field(ge=0, le=100)
    source_id: str


class StandardFact(BaseModel):
    academic_year: int
    exam: str
    subject_id: str
    standard: str
    grade: int = Field(ge=0, le=15)
    cumulative_percentage: float = Field(ge=0, le=100)
    source_id: str


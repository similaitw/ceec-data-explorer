export type SubjectId =
  | "chinese"
  | "english"
  | "mathematics_a"
  | "mathematics_b"
  | "social_studies"
  | "natural_sciences";

export interface DataEnvelope<T> {
  schema_version: string;
  generated_at: string;
  source_ids: string[];
  data: T[];
  notes: string[];
  quality: { status: string; warnings: string[] };
}

export interface RegistrationFact {
  academic_year: number;
  exam: "GSAT";
  group_type: "all_candidates" | "subject_attendance";
  group_name: string;
  subject_id: string | null;
  registered_count: number;
  attended_count: number | null;
  absent_count: number | null;
  absence_rate: number | null;
  source_id: string;
}

export interface NoncurrentPathwayFact {
  academic_year: number;
  gsat_total_registered: number;
  gsat_noncurrent_registered: number;
  gsat_noncurrent_share: number;
  distribution_total_registered: number;
  distribution_noncurrent_registered: number;
  distribution_total_admitted: number;
  distribution_noncurrent_admitted: number;
  distribution_noncurrent_admission_rate: number;
  distribution_noncurrent_admitted_share: number;
  gsat_source_id: string;
  distribution_source_id: string;
}

export interface UniversityAdmissionFact {
  academic_year: number;
  university: string;
  ownership: "公立" | "私立";
  region: string;
  program_count: number;
  admitted_count: number;
  source_id: string;
  institution_source_id: string;
}

export interface GroupAdmissionFact {
  academic_year: number;
  group: string;
  admitted_count: number;
  capacity_usage_rate: number;
  source_id: string;
}

export interface ScoreDistributionFact {
  academic_year: number;
  exam: "GSAT";
  subject_id: SubjectId;
  grade: number;
  count: number;
  percentage: number;
  cumulative_low_count: number;
  cumulative_low_percentage: number;
  cumulative_high_count: number;
  cumulative_high_percentage: number;
  source_id: string;
}

export interface ScoreBoundaryFact {
  academic_year: number;
  exam: "GSAT";
  subject_id: SubjectId;
  grade: number;
  raw_score_lower: number;
  raw_score_upper: number;
  lower_inclusive: boolean;
  upper_inclusive: boolean;
  source_interval_text: string;
  source_id: string;
}

export interface StandardFact {
  academic_year: number;
  exam: "GSAT";
  subject_id: SubjectId;
  standard: "頂標" | "前標" | "均標" | "後標" | "底標";
  grade: number;
  cumulative_percentage: number;
  source_id: string;
}

export interface SourceRecord {
  source_id: string;
  academic_year: number;
  category: string;
  title: string;
  landing_page_url: string;
  download_url: string;
  original_filename: string;
  downloaded_at: string;
  sha256: string;
  parse_status: string;
}

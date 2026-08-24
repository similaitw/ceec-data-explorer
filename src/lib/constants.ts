import type { SubjectId } from "./types";

export const YEARS = [111, 112, 113, 114, 115] as const;

export const SUBJECTS: { id: SubjectId; label: string; short: string }[] = [
  { id: "chinese", label: "國文", short: "國" },
  { id: "english", label: "英文", short: "英" },
  { id: "mathematics_a", label: "數學 A", short: "數A" },
  { id: "mathematics_b", label: "數學 B", short: "數B" },
  { id: "social_studies", label: "社會", short: "社" },
  { id: "natural_sciences", label: "自然", short: "自" },
];

export const SUBJECT_LABEL = Object.fromEntries(SUBJECTS.map((subject) => [subject.id, subject.label])) as Record<SubjectId, string>;

export const SUBJECT_COLORS: Record<SubjectId, string> = {
  chinese: "#ee7769",
  english: "#2b929b",
  mathematics_a: "#557ac4",
  mathematics_b: "#e59a56",
  social_studies: "#8875b7",
  natural_sciences: "#58a17a",
};

export const STANDARD_ORDER = ["頂標", "前標", "均標", "後標", "底標"] as const;

export const formatNumber = new Intl.NumberFormat("zh-TW").format;
export const formatPercent = (value: number) => `${value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}%`;
export const gregorianYear = (academicYear: number) => academicYear + 1911;

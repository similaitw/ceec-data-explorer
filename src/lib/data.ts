import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { DataEnvelope, GroupAdmissionFact, NoncurrentPathwayFact, RegistrationFact, ScoreBoundaryFact, ScoreDistributionFact, SourceRecord, StandardFact, UniversityAdmissionFact } from "./types";

async function readJson<T>(relativePath: string): Promise<T> {
  return JSON.parse(await readFile(resolve(process.cwd(), relativePath), "utf8")) as T;
}

export async function getAllData() {
  const [registration, distributions, boundaries, standards, noncurrentPathways, universityAdmissions, groupAdmissions, sources, quality] = await Promise.all([
    readJson<DataEnvelope<RegistrationFact>>("data/processed/gsat/fact_registration.json"),
    readJson<DataEnvelope<ScoreDistributionFact>>("data/processed/gsat/fact_score_distribution.json"),
    readJson<DataEnvelope<ScoreBoundaryFact>>("data/processed/gsat/fact_score_boundary.json"),
    readJson<DataEnvelope<StandardFact>>("data/processed/gsat/fact_standard.json"),
    readJson<DataEnvelope<NoncurrentPathwayFact>>("data/processed/admissions/fact_noncurrent_pathway.json"),
    readJson<DataEnvelope<UniversityAdmissionFact>>("data/processed/admissions/fact_university_admission.json"),
    readJson<DataEnvelope<GroupAdmissionFact>>("data/processed/admissions/fact_group_admission.json"),
    readJson<SourceRecord[]>("data/catalog/sources.json"),
    readJson<Record<string, unknown>>("data/quality/report.json"),
  ]);
  return {
    registration: registration.data,
    distributions: distributions.data,
    boundaries: boundaries.data,
    standards: standards.data,
    noncurrentPathways: noncurrentPathways.data,
    universityAdmissions: universityAdmissions.data,
    groupAdmissions: groupAdmissions.data,
    sources,
    quality,
    generatedAt: distributions.generated_at,
  };
}

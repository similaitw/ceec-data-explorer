import type { ScoreDistributionFact, StandardFact } from "./types";

export function locateGrade(row: ScoreDistributionFact, standards: StandardFact[]) {
  const prLower = Math.max(0, row.cumulative_low_percentage - row.percentage);
  const ordered = ["頂標", "前標", "均標", "後標", "底標"] as const;
  const band = ordered.find((name) => {
    const standard = standards.find((item) => item.standard === name);
    return standard && row.grade >= standard.grade;
  }) ?? "未達底標";
  return {
    prLower,
    prUpper: row.cumulative_low_percentage,
    band,
    sameGradeCount: row.count,
  };
}


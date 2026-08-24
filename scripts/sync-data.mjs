import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourceDir = resolve(root, "data/processed/gsat");
const publicDir = resolve(root, "public/data/gsat");
await mkdir(publicDir, { recursive: true });

const files = [
  "fact_registration.csv",
  "fact_registration.json",
  "fact_score_boundary.csv",
  "fact_score_boundary.json",
  "fact_score_distribution.csv",
  "fact_score_distribution.json",
  "fact_standard.csv",
  "fact_standard.json",
];

for (const file of files) {
  await cp(resolve(sourceDir, file), resolve(publicDir, file));
}

await cp(resolve(root, "data/catalog/sources.json"), resolve(root, "public/data/sources.json"));
await cp(resolve(root, "data/quality/report.json"), resolve(root, "public/data/quality.json"));

const manifest = {
  schema_version: "1.0.0",
  exam: "GSAT",
  academic_years: [111, 112, 113, 114, 115],
  datasets: files.filter((file) => file.endsWith(".json")),
  disclaimer: "本網站為非官方資料整理與視覺化專案，實際定義與數值請以大考中心公告為準。",
};
await writeFile(resolve(root, "public/data/manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`已同步 ${files.length + 3} 個前端資料檔`);

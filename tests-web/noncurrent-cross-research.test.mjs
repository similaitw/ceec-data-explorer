import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const directory = "data/research/noncurrent-cross";

test("cross-analysis deliverables use the required schemas", () => {
  const fact = readFileSync(`${directory}/fact_noncurrent_admission.csv`, "utf8").trim().split(/\r?\n/);
  const bridge = readFileSync(`${directory}/bridge_program_group.csv`, "utf8").trim().split(/\r?\n/);
  const sources = readFileSync(`${directory}/sources.csv`, "utf8").trim().split(/\r?\n/);

  assert.equal(fact[0], "academic_year,admission_pathway,university_code,university_name,program_code,program_name,group_code,group_name,group_system,current_status,registered_count,admitted_count,source_id,source_page,notes");
  assert.equal(bridge[0], "academic_year,program_code,university_name,program_name,group_code,group_name,group_system,source_id,source_page,notes");
  assert.equal(sources[0], "source_id,title,publisher,academic_year,url,file_type,page_or_sheet,definition,accessed_at,notes");
  assert.equal(fact.length, 1, "未取得交叉資料時不得製造或推估事實列");
  assert.equal(bridge.length, 1, "未取得年度化官方 bridge 時不得用名稱猜測學群");
  assert.ok(sources.length > 5, "研究紀錄應保留已查官方來源");
});

test("research notes document the required gaps and application fallback", () => {
  const notes = readFileSync(`${directory}/research-notes.md`, "utf8");
  for (const required of ["P0", "P1", "P2", "跨學群", "資料申請稿", "母群", "抑制"]) {
    assert.match(notes, new RegExp(required));
  }
});

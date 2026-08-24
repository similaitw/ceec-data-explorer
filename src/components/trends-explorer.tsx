"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChartActions } from "./chart-actions";
import { FeatureIcon, SubjectIcon } from "./icons";
import { LineChart, type LineSeries } from "./line-chart";
import { STANDARD_ORDER, SUBJECT_COLORS, SUBJECT_LABEL, SUBJECTS, formatNumber, formatPercent } from "@/lib/constants";
import type { RegistrationFact, StandardFact, SubjectId } from "@/lib/types";

type Metric = "standard" | "registration" | "absence";

export function TrendsExplorer({ standards, registration }: { standards: StandardFact[]; registration: RegistrationFact[] }) {
  const search = useSearchParams();
  const initialMetric = (["standard", "registration", "absence"] as string[]).includes(search.get("metric") ?? "") ? search.get("metric") as Metric : "standard";
  const initialStandard = (STANDARD_ORDER as readonly string[]).includes(search.get("standard") ?? "") ? search.get("standard") as StandardFact["standard"] : "頂標";
  const [metric, setMetric] = useState(initialMetric), [standard, setStandard] = useState(initialStandard);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectId[]>([]);
  const [hoveredSubject, setHoveredSubject] = useState<SubjectId | null>(null);
  const setQuery = (key: string, value: string) => { const url = new URL(window.location.href); url.searchParams.set(key, value); window.history.replaceState(null, "", url); };
  const toggleSubject = (subject: SubjectId) => setSelectedSubjects((current) => current.includes(subject) ? current.filter((item) => item !== subject) : [...current, subject]);

  let series: LineSeries[] = [];
  let title = "六科頂標歷年變化";
  let subtitle = "同屬 111 新制範圍；級分尺度一致，但考生母群與試題仍逐年不同。";
  let rows: Record<string, unknown>[] = [];
  let suffix = "";
  let yMax = 15;
  let yTicks = [0, 3, 6, 9, 12, 15];

  if (metric === "standard") {
    title = `六科${standard}歷年變化`;
    series = SUBJECTS.map((subject) => ({ label: subject.label, color: SUBJECT_COLORS[subject.id], values: standards.filter((row) => row.subject_id === subject.id && row.standard === standard).map((row) => ({ x: row.academic_year, y: row.grade })) }));
    rows = standards.filter((row) => row.standard === standard).map((row) => ({ 學年度: row.academic_year, 科目: SUBJECT_LABEL[row.subject_id], 指標: row.standard, 級分: row.grade, 累計百分比: row.cumulative_percentage, 來源: row.source_id }));
  } else if (metric === "registration") {
    title = "學測總報名人數"; subtitle = "全體報名人數；各科實際報考人數需另看科目到缺考表。"; yMax = 130000; yTicks = [0, 30000, 60000, 90000, 120000];
    const values = registration.filter((row) => row.group_type === "all_candidates").map((row) => ({ x: row.academic_year, y: row.registered_count }));
    series = [{ label: "總報名", color: "#c84a34", values }];
    rows = registration.filter((row) => row.group_type === "all_candidates").map((row) => ({ 學年度: row.academic_year, 報名人數: row.registered_count, 來源: row.source_id }));
  } else {
    title = "各科缺考率"; subtitle = "缺考率由官方實到與缺考人數衍生；國文官方拆為國綜與國寫，圖中以國綜代表。"; suffix = "%"; yMax = 6; yTicks = [0, 1, 2, 3, 4, 5, 6];
    const attendanceSubject = { ...SUBJECT_LABEL, chinese: "國綜" } as Record<string, string>;
    const mapId = (id: string) => id === "chinese" ? "chinese_integrated" : id;
    series = SUBJECTS.map((subject) => ({ label: attendanceSubject[subject.id], color: SUBJECT_COLORS[subject.id], values: registration.filter((row) => row.subject_id === mapId(subject.id)).map((row) => ({ x: row.academic_year, y: Number((row.absence_rate ?? 0).toFixed(2)) })) }));
    rows = registration.filter((row) => row.group_type === "subject_attendance").map((row) => ({ 學年度: row.academic_year, 科目: row.group_name, 實到: row.attended_count, 缺考: row.absent_count, 缺考率: row.absence_rate, 來源: row.source_id }));
  }

  const visibleSubjects = hoveredSubject
    ? [hoveredSubject]
    : selectedSubjects.length > 0
      ? SUBJECTS.filter((subject) => selectedSubjects.includes(subject.id)).map((subject) => subject.id)
      : SUBJECTS.map((subject) => subject.id);
  const visibleSeries = metric === "registration"
    ? series
    : series.filter((_, index) => visibleSubjects.includes(SUBJECTS[index].id));
  const visibleLabels = new Set(visibleSubjects.map((subject) => metric === "absence" && subject === "chinese" ? "國綜" : SUBJECT_LABEL[subject]));
  const visibleRows = metric === "registration" ? rows : rows.filter((row) => visibleLabels.has(String(row.科目)));

  return <>
    <div className="filter-bar" aria-label="趨勢篩選器">
      <div className="field"><label htmlFor="metric">指標</label><select id="metric" value={metric} onChange={(event) => {setMetric(event.target.value as Metric);setSelectedSubjects([]);setHoveredSubject(null);setQuery("metric", event.target.value);}}><option value="standard">五標</option><option value="registration">總報名人數</option><option value="absence">缺考率</option></select></div>
      {metric === "standard" && <div className="field"><label htmlFor="standard">成績標準</label><select id="standard" value={standard} onChange={(event) => {setStandard(event.target.value as StandardFact["standard"]);setQuery("standard", event.target.value);}}>{STANDARD_ORDER.map((name) => <option key={name}>{name}</option>)}</select></div>}
      <span className="filter-spacer" />
      <span className="status-pill">111 新制可比區間</span>
    </div>
    <div className="panel panel-grid">
      <div className="chart-shell">
        <div className="chart-header"><div><h2>{title}</h2><div className="chart-subtitle">{subtitle}</div></div><ChartActions chartId="trend-chart" filename={`學測_${metric}_${standard}`} rows={visibleRows} /></div>
        <div className="subject-legend" aria-label="圖表科目圖例">
          {metric === "registration" ? <div className="legend-chip is-static" style={{"--subject-color":"#ee7769"} as React.CSSProperties}><FeatureIcon name="trend" size={24}/><span>總報名</span></div> : <>
            <button type="button" className={`legend-reset ${selectedSubjects.length === 0 ? "is-active" : ""}`} onClick={() => setSelectedSubjects([])}>全部</button>
            {SUBJECTS.map((item) => {
              const isSelected = selectedSubjects.includes(item.id);
              const label = metric === "absence" && item.id === "chinese" ? "國綜" : item.label;
              return <button
                type="button"
                className={`legend-chip ${isSelected ? "is-selected" : ""} ${selectedSubjects.length > 0 && !isSelected ? "is-muted" : ""}`}
                key={item.id}
                style={{"--subject-color":SUBJECT_COLORS[item.id]} as React.CSSProperties}
                aria-pressed={isSelected}
                title={`滑過只看${label}；點擊可多選`}
                onMouseEnter={() => setHoveredSubject(item.id)}
                onMouseLeave={() => setHoveredSubject(null)}
                onFocus={() => setHoveredSubject(item.id)}
                onBlur={() => setHoveredSubject(null)}
                onClick={() => toggleSubject(item.id)}
              ><SubjectIcon subject={item.id} size={25}/><span>{label}</span></button>;
            })}
            <span className="legend-hint">滑過預覽 · 點擊多選</span>
          </>}
        </div>
        <LineChart id="trend-chart" series={visibleSeries} yMax={yMax} yTicks={yTicks} suffix={suffix} />
        <details className="table-details"><summary>展開圖表替代資料表（{visibleRows.length} 列）</summary><div className="data-table-wrap"><table className="data-table"><thead><tr>{Object.keys(visibleRows[0] ?? {}).map((key) => <th key={key}>{key}</th>)}</tr></thead><tbody>{visibleRows.map((row, index) => <tr key={index}>{Object.values(row).map((value, cell) => <td key={cell}>{typeof value === "number" ? (String(Object.keys(row)[cell]).includes("率") ? formatPercent(value) : formatNumber(value)) : String(value)}</td>)}</tr>)}</tbody></table></div></details>
      </div>
      <aside className="annotation-card"><h3>制度註記</h3><p>111 學年度起學測採國文、英文、數學 A、數學 B、社會、自然六考科，每科最高 15 級分。</p><ul><li>本圖不跨越 110／111 制度斷點。</li><li>折線呈現統計變化，不解釋因果。</li><li>下載資料保留每列 source_id。</li></ul></aside>
    </div>
  </>;
}

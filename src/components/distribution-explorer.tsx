"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChartActions } from "./chart-actions";
import { SourceNote } from "./source-note";
import { SUBJECTS, SUBJECT_LABEL, YEARS, formatNumber, formatPercent } from "@/lib/constants";
import type { ScoreDistributionFact, SourceRecord, StandardFact, SubjectId } from "@/lib/types";

type Mode = "percentage" | "count" | "cumulative";

function DistributionChart({ rows, compare, mode, standards, id }: { rows: ScoreDistributionFact[]; compare: ScoreDistributionFact[]; mode: Mode; standards: StandardFact[]; id: string }) {
  const width = 920, height = 470, left = 60, right = 20, top = 32, bottom = 58;
  const value = (row: ScoreDistributionFact) => mode === "count" ? row.count : mode === "cumulative" ? row.cumulative_high_percentage : row.percentage;
  const maxValue = mode === "count" ? Math.max(...rows.map(value), ...compare.map(value)) * 1.12 : mode === "cumulative" ? 100 : Math.max(...rows.map(value), ...compare.map(value)) * 1.16;
  const x = (grade: number) => left + grade / 15 * (width-left-right);
  const y = (v: number) => top + (1 - v / maxValue) * (height-top-bottom);
  const barWidth = (width-left-right) / 16 * (compare.length ? .36 : .62);
  const ticks = [0, .25, .5, .75, 1].map((p) => maxValue * p);
  if (mode === "cumulative") {
    const points = (items: ScoreDistributionFact[]) => [...items].sort((a,b) => a.grade-b.grade).map((row) => `${x(row.grade)},${y(value(row))}`).join(" ");
    return <svg id={id} className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="各級分高分往低分累計百分比圖"><rect width={width} height={height} rx="22" fill="#ffffff" />{ticks.map((tick) => <g key={tick}><line className="chart-grid" x1={left} x2={width-right} y1={y(tick)} y2={y(tick)} /><text x={left-8} y={y(tick)+4} textAnchor="end">{tick.toFixed(0)}%</text></g>)}<polyline points={points(rows)} fill="none" stroke="#2b929b" strokeWidth="4" />{compare.length > 0 && <polyline points={points(compare)} fill="none" stroke="#ee7769" strokeWidth="4" strokeDasharray="8 5" />}{rows.map((row) => <circle key={row.grade} cx={x(row.grade)} cy={y(value(row))} r="5" fill="#ffffff" stroke="#2b929b" strokeWidth="3"><title>{row.grade} 級分以上：{formatPercent(value(row))}</title></circle>)}{Array.from({length:16},(_,grade) => <text key={grade} x={x(grade)} y={height-bottom+24} textAnchor="middle">{grade}</text>)}</svg>;
  }
  return <svg id={id} className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="各級分分布長條圖"><rect width={width} height={height} rx="22" fill="#ffffff" />{ticks.map((tick) => <g key={tick}><line className="chart-grid" x1={left} x2={width-right} y1={y(tick)} y2={y(tick)} /><text x={left-8} y={y(tick)+4} textAnchor="end">{mode === "count" ? formatNumber(Math.round(tick)) : formatPercent(tick)}</text></g>)}
    {rows.map((row) => { const v=value(row); return <rect key={row.grade} rx="5" x={x(row.grade)-barWidth-(compare.length ? 1 : -barWidth/2)} y={y(v)} width={barWidth} height={height-bottom-y(v)} fill="#2b929b"><title>{row.academic_year} · {row.grade} 級分：{mode === "count" ? formatNumber(v) : formatPercent(v)}</title></rect>; })}
    {compare.map((row) => { const v=value(row); return <rect key={row.grade} rx="5" x={x(row.grade)+1} y={y(v)} width={barWidth} height={height-bottom-y(v)} fill="#ee7769"><title>{row.academic_year} · {row.grade} 級分：{mode === "count" ? formatNumber(v) : formatPercent(v)}</title></rect>; })}
    {standards.map((standard) => <g key={standard.standard}><line x1={x(standard.grade)} x2={x(standard.grade)} y1={top} y2={height-bottom} stroke="#122d3b" strokeDasharray="3 4" opacity=".45" /><text x={x(standard.grade)+4} y={top+12+(standards.indexOf(standard)%2)*15}>{standard.standard}</text></g>)}
    {Array.from({length:16},(_,grade) => <text key={grade} x={x(grade)} y={height-bottom+24} textAnchor="middle">{grade}</text>)}
  </svg>;
}

export function DistributionExplorer({ distributions, standards, sources }: { distributions: ScoreDistributionFact[]; standards: StandardFact[]; sources: SourceRecord[] }) {
  const search = useSearchParams();
  const initialYear = YEARS.includes(Number(search.get("year")) as (typeof YEARS)[number]) ? Number(search.get("year")) : 115;
  const initialSubject = SUBJECTS.some((item) => item.id === search.get("subject")) ? search.get("subject") as SubjectId : "chinese";
  const initialMode = (["percentage", "count", "cumulative"] as string[]).includes(search.get("mode") ?? "") ? search.get("mode") as Mode : "percentage";
  const initialCompare = YEARS.includes(Number(search.get("compare")) as (typeof YEARS)[number]) && Number(search.get("compare")) !== initialYear ? Number(search.get("compare")) : 0;
  const [year, setYear] = useState(initialYear), [subject, setSubject] = useState(initialSubject), [compareYear, setCompareYear] = useState(initialCompare), [mode, setMode] = useState(initialMode);
  const setQuery = (key: string, value: string) => { const url = new URL(window.location.href); url.searchParams.set(key, value); window.history.replaceState(null, "", url); };
  const rows = distributions.filter((row) => row.academic_year === year && row.subject_id === subject).sort((a,b) => a.grade-b.grade);
  const compare = compareYear ? distributions.filter((row) => row.academic_year === compareYear && row.subject_id === subject).sort((a,b) => a.grade-b.grade) : [];
  const currentStandards = standards.filter((row) => row.academic_year === year && row.subject_id === subject);
  const source = sources.find((item) => item.source_id === rows[0]?.source_id);
  const exportRows = [...rows, ...compare].map((row) => ({ 學年度: row.academic_year, 科目: SUBJECT_LABEL[row.subject_id], 級分: row.grade, 人數: row.count, 百分比: row.percentage, 低至高累計人數: row.cumulative_low_count, 低至高累計百分比: row.cumulative_low_percentage, 高至低累計人數: row.cumulative_high_count, 高至低累計百分比: row.cumulative_high_percentage, 來源: row.source_id }));
  const modeLabel = { percentage: "人數百分比", count: "人數", cumulative: "高分往低分累計" }[mode];

  return <>
    <div className="filter-bar" aria-label="分布篩選器">
      <div className="field"><label htmlFor="year">學年度</label><select id="year" value={year} onChange={(e)=>{const value=Number(e.target.value);setYear(value);if(compareYear===value)setCompareYear(0);setQuery("year",e.target.value);}}>{YEARS.map((item)=><option key={item}>{item}</option>)}</select></div>
      <div className="field"><label htmlFor="subject">科目</label><select id="subject" value={subject} onChange={(e)=>{setSubject(e.target.value as SubjectId);setQuery("subject",e.target.value);}}>{SUBJECTS.map((item)=><option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <div className="field"><label htmlFor="mode">顯示方式</label><select id="mode" value={mode} onChange={(e)=>{setMode(e.target.value as Mode);setQuery("mode",e.target.value);}}><option value="percentage">百分比</option><option value="count">人數</option><option value="cumulative">累計百分比</option></select></div>
      <div className="field"><label htmlFor="compare">比較年度</label><select id="compare" value={compareYear} onChange={(e)=>{setCompareYear(Number(e.target.value));setQuery("compare",e.target.value);}}><option value="0">不比較</option>{YEARS.filter((item)=>item!==year).map((item)=><option key={item}>{item}</option>)}</select></div>
    </div>
    <div className="panel">
      <div className="chart-header"><div><h2>{year} 學年度 {SUBJECT_LABEL[subject]}</h2><div className="chart-subtitle">{modeLabel}{compareYear ? ` · 與 ${compareYear} 學年度相同尺度比較` : ""}</div></div><ChartActions chartId="distribution-chart" filename={`學測_${year}_${SUBJECT_LABEL[subject]}_級分分布`} rows={exportRows} /></div>
      <DistributionChart id="distribution-chart" rows={rows} compare={compare} mode={mode} standards={currentStandards} />
      <SourceNote source={source} />
      <details className="table-details"><summary>展開完整資料表（{exportRows.length} 列）</summary><div className="data-table-wrap"><table className="data-table"><thead><tr><th>學年度</th><th>級分</th><th>人數</th><th>百分比</th><th>低→高累計</th><th>高→低累計</th></tr></thead><tbody>{[...rows,...compare].map((row)=><tr key={`${row.academic_year}-${row.grade}`}><td>{row.academic_year}</td><td>{row.grade}</td><td>{formatNumber(row.count)}</td><td>{formatPercent(row.percentage)}</td><td>{formatPercent(row.cumulative_low_percentage)}</td><td>{formatPercent(row.cumulative_high_percentage)}</td></tr>)}</tbody></table></div></details>
    </div>
  </>;
}

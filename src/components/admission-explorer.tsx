"use client";

import { useMemo, useState } from "react";
import { FeatureIcon } from "./icons";
import { LineChart } from "./line-chart";
import { YEARS, formatNumber, formatPercent } from "@/lib/constants";
import type { GroupAdmissionFact, UniversityAdmissionFact } from "@/lib/types";

const unique = (items: string[]) => [...new Set(items)].sort((a, b) => a.localeCompare(b, "zh-TW"));

function chartScale(values: number[]) {
  const maximum = Math.max(...values, 1);
  const roughStep = maximum / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const step = Math.ceil(roughStep / magnitude) * magnitude;
  return { yMax: step * 4, yTicks: [0, step, step * 2, step * 3, step * 4] };
}

export function AdmissionExplorer({ universities, groups }: { universities: UniversityAdmissionFact[]; groups: GroupAdmissionFact[] }) {
  const [year, setYear] = useState(115);
  const [ownership, setOwnership] = useState("");
  const [region, setRegion] = useState("");
  const [university, setUniversity] = useState("");
  const [group, setGroup] = useState("");

  const regions = useMemo(() => unique(universities.filter((row) => !ownership || row.ownership === ownership).map((row) => row.region)), [universities, ownership]);
  const universityOptions = useMemo(() => unique(universities.filter((row) => (!ownership || row.ownership === ownership) && (!region || row.region === region)).map((row) => row.university)), [universities, ownership, region]);
  const scope = universities.filter((row) => (!ownership || row.ownership === ownership) && (!region || row.region === region) && (!university || row.university === university));
  const current = scope.filter((row) => row.academic_year === year);
  const totals = YEARS.map((academicYear) => ({
    academicYear,
    admitted: scope.filter((row) => row.academic_year === academicYear).reduce((sum, row) => sum + row.admitted_count, 0),
  }));
  const scale = chartScale(totals.map((item) => item.admitted));
  const topUniversities = [...current].sort((a, b) => b.admitted_count - a.admitted_count).slice(0, 12);
  const selectedGroup = groups.find((item) => item.group === group);
  const reset = () => { setOwnership(""); setRegion(""); setUniversity(""); };
  const scopeLabel = university || [region, ownership].filter(Boolean).join(" · ") || "全體分發大學";

  return <>
    <section className="scope-filter" aria-label="招生統計篩選器">
      <div className="scope-filter-title"><span>FILTER / 01</span><h2>選擇招生範圍</h2><button type="button" onClick={reset}>清除條件</button></div>
      <div className="scope-filter-grid">
        <div className="field"><label htmlFor="explore-year">學年度</label><select id="explore-year" value={year} onChange={(event) => setYear(Number(event.target.value))}>{YEARS.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="field"><label htmlFor="explore-ownership">公／私立</label><select id="explore-ownership" value={ownership} onChange={(event) => { setOwnership(event.target.value); setRegion(""); setUniversity(""); }}><option value="">全部</option><option>公立</option><option>私立</option></select></div>
        <div className="field"><label htmlFor="explore-region">校本部地區</label><select id="explore-region" value={region} onChange={(event) => { setRegion(event.target.value); setUniversity(""); }}><option value="">全部地區</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="field"><label htmlFor="explore-university">大學</label><select id="explore-university" value={university} onChange={(event) => setUniversity(event.target.value)}><option value="">全部大學</option>{universityOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
      </div>
    </section>

    <section className="explore-summary" aria-live="polite">
      <article><span>目前範圍</span><strong className="scope-name">{scopeLabel}</strong><small>{year} 學年度</small></article>
      <article><span>大學數</span><strong>{formatNumber(current.length)}</strong><small>該年度有錄取資料</small></article>
      <article><span>系組數</span><strong>{formatNumber(current.reduce((sum, row) => sum + row.program_count, 0))}</strong><small>分發招生系組</small></article>
      <article><span>錄取人數</span><strong>{formatNumber(current.reduce((sum, row) => sum + row.admitted_count, 0))}</strong><small>含外加名額</small></article>
    </section>

    <section className="explore-results">
      <article className="panel">
        <div className="mini-chart-heading"><div><span>02 / Trend</span><h2>分發錄取歷年趨勢</h2></div></div>
        <LineChart id="admission-filter-trend" series={[{ label: scopeLabel, color: "#2b929b", values: totals.map((item) => ({ x: item.academicYear, y: item.admitted })) }]} yMax={scale.yMax} yTicks={scale.yTicks} />
        <p className="chart-subtitle">比較的是錄取規模；各年度招生名額與回流情況不同。</p>
      </article>
      <article className="panel ranking-panel">
        <div className="mini-chart-heading"><div><span>03 / Universities</span><h2>{year} 大學統計</h2></div><strong>{current.length}</strong></div>
        {topUniversities.length ? <div className="university-ranking">{topUniversities.map((row, index) => <button type="button" key={row.university} onClick={() => setUniversity(row.university)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{row.university}</strong><small>{row.program_count} 系組 · {formatNumber(row.admitted_count)} 人</small></button>)}</div> : <p className="empty-state">此條件在 {year} 學年度沒有分發錄取資料。</p>}
      </article>
    </section>

    <section className="section">
      <div className="section-heading"><div><span className="section-index">04 / Groups · 115 only</span><h2>學群錄取統計</h2></div><div className="field compact-field"><label htmlFor="explore-group">學群</label><select id="explore-group" value={group} onChange={(event) => setGroup(event.target.value)}><option value="">全部學群</option>{groups.map((item) => <option key={item.group}>{item.group}</option>)}</select></div></div>
      <p className="dimension-warning">官方目前提供的是 115 學年度學群彙總，沒有逐校系的學群對照，因此此區不與大學／地區條件交叉。</p>
      {selectedGroup ? <article className="selected-group-card"><span>{selectedGroup.group}學群</span><strong>{formatNumber(selectedGroup.admitted_count)}<small> 人次</small></strong><div><b style={{ width: `${selectedGroup.capacity_usage_rate}%` }} /></div><p>名額使用率 {formatPercent(selectedGroup.capacity_usage_rate)}</p></article> : <div className="group-stat-grid">{groups.map((item) => <button type="button" key={item.group} onClick={() => setGroup(item.group)}><span>{item.group}</span><strong>{formatNumber(item.admitted_count)}</strong><small>使用率 {formatPercent(item.capacity_usage_rate)}</small></button>)}</div>}
    </section>

    <section className="section">
      <div className="section-heading"><div><span className="section-index">05 / Continue</span><h2>再看考試資料</h2></div><p>沿用 {year} 學年度；招生條件不套入全體考生分布。</p></div>
      <div className="analysis-route-grid">
        <a href={`/trends?metric=standard`}><FeatureIcon name="trend"/><span><strong>歷年趨勢</strong><small>六科五標、報名與缺考</small></span></a>
        <a href={`/distribution?year=${year}&subject=chinese`}><FeatureIcon name="distribution"/><span><strong>級分分布</strong><small>{year} 學年度全體考生</small></span></a>
        <a href={`/position?year=${year}&subject=chinese`}><FeatureIcon name="position"/><span><strong>成績定位</strong><small>單科 PR 與五標位置</small></span></a>
        <a href={`/noncurrent?year=${year}`}><FeatureIcon name="repeaters"/><span><strong>非應屆觀察</strong><small>人數、占比與分發錄取率</small></span></a>
      </div>
      <p className="source-note"><strong>資料口徑：</strong>大學、地區與公私立統計來自分發委員會各系組錄取表；地區依教育部 114 學年度學校本部地址。部分系組跨兩個學群，學群人數不可加總為全體錄取人數。<a href="https://www2.uac.edu.tw/115data/115_result_school_data.pdf" target="_blank" rel="noreferrer">校系錄取表 ↗</a>　<a href="https://udb.moe.edu.tw/ulist/Resource" target="_blank" rel="noreferrer">教育部名錄 ↗</a></p>
    </section>
  </>;
}

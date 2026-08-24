"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FeatureIcon } from "./icons";
import { LineChart } from "./line-chart";
import { formatNumber, formatPercent } from "@/lib/constants";
import type { NoncurrentPathwayFact } from "@/lib/types";

export function NoncurrentExplorer({ rows }: { rows: NoncurrentPathwayFact[] }) {
  const search = useSearchParams();
  const requestedYear = Number(search.get("year"));
  const [year, setYear] = useState(rows.some((row) => row.academic_year === requestedYear) ? requestedYear : (rows.at(-1)?.academic_year ?? 115));
  const selected = rows.find((row) => row.academic_year === year) ?? rows.at(-1)!;
  const registrationSeries = [{ label: "非應屆占學測報名", color: "#557ac4", values: rows.map((row) => ({ x: row.academic_year, y: row.gsat_noncurrent_share })) }];
  const admissionSeries = [
    { label: "非應屆分發錄取率", color: "#2b929b", values: rows.map((row) => ({ x: row.academic_year, y: row.distribution_noncurrent_admission_rate })) },
    { label: "非應屆占錄取生", color: "#ee7769", values: rows.map((row) => ({ x: row.academic_year, y: row.distribution_noncurrent_admitted_share })) },
  ];

  return <>
    <div className="year-switcher" aria-label="選擇學年度">
      {rows.map((row) => <button type="button" key={row.academic_year} className={row.academic_year === year ? "is-active" : ""} aria-pressed={row.academic_year === year} onClick={() => setYear(row.academic_year)}>{row.academic_year}</button>)}
    </div>

    <section className="noncurrent-summary" aria-live="polite">
      <article className="population-card gsat-population">
        <div className="population-heading"><span className="feature-icon"><FeatureIcon name="repeaters" /></span><div><small>學測報名母群</small><h2>{year} 非應屆報名</h2></div></div>
        <div className="population-number">{formatNumber(selected.gsat_noncurrent_registered)}<small>人</small></div>
        <div className="composition-track" aria-label={`非應屆占學測報名 ${formatPercent(selected.gsat_noncurrent_share)}`}><span style={{ width: `${selected.gsat_noncurrent_share}%` }} /></div>
        <div className="population-foot"><span>占全體報名 <strong>{formatPercent(selected.gsat_noncurrent_share)}</strong></span><span>全體 {formatNumber(selected.gsat_total_registered)} 人</span></div>
      </article>

      <article className="population-card admission-population">
        <div className="population-heading"><span className="feature-icon"><FeatureIcon name="distribution" /></span><div><small>分發入學母群</small><h2>{year} 非應屆錄取</h2></div></div>
        <div className="population-number">{formatNumber(selected.distribution_noncurrent_admitted)}<small>人</small></div>
        <div className="admission-facts"><span><small>非應屆登記</small><strong>{formatNumber(selected.distribution_noncurrent_registered)}</strong></span><span><small>錄取率</small><strong>{formatPercent(selected.distribution_noncurrent_admission_rate)}</strong></span><span><small>占全部錄取生</small><strong>{formatPercent(selected.distribution_noncurrent_admitted_share)}</strong></span></div>
      </article>
    </section>

    <div className="definition-note"><strong>口徑先看：</strong>官方資料使用「非應屆」。其中可能包含重考生、高中已畢業者或同等學力者，因此不能完全等同日常語意的「重考生」。</div>

    <section className="noncurrent-charts">
      <article className="panel">
        <div className="mini-chart-heading"><div><span>01 / 學測</span><h2>非應屆報名占比</h2></div><strong>{formatPercent(selected.gsat_noncurrent_share)}</strong></div>
        <LineChart id="noncurrent-registration-chart" series={registrationSeries} yMin={0} yMax={20} yTicks={[0, 5, 10, 15, 20]} suffix="%" />
      </article>
      <article className="panel">
        <div className="mini-chart-heading"><div><span>02 / 分發入學</span><h2>錄取率與錄取占比</h2></div><strong>{formatPercent(selected.distribution_noncurrent_admission_rate)}</strong></div>
        <div className="compact-legend"><span className="teal-dot">錄取率</span><span className="red-dot">占全部錄取生</span></div>
        <LineChart id="noncurrent-admission-chart" series={admissionSeries} yMin={0} yMax={100} yTicks={[0, 25, 50, 75, 100]} suffix="%" />
      </article>
    </section>

    <section className="section">
      <div className="section-heading"><div><span className="section-index">03 / Complete table</span><h2>111–115 完整統計</h2></div><div className="downloads"><a className="button small" href="/data/admissions/fact_noncurrent_pathway.csv" download>CSV ↓</a><a className="button secondary small" href="/data/admissions/fact_noncurrent_pathway.json" download>JSON ↓</a></div></div>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>學年度</th><th>學測非應屆</th><th>占學測報名</th><th>分發非應屆登記</th><th>分發非應屆錄取</th><th>錄取率</th><th>占全部錄取生</th></tr></thead><tbody>{rows.map((row) => <tr key={row.academic_year}><td>{row.academic_year}</td><td>{formatNumber(row.gsat_noncurrent_registered)}</td><td>{formatPercent(row.gsat_noncurrent_share)}</td><td>{formatNumber(row.distribution_noncurrent_registered)}</td><td>{formatNumber(row.distribution_noncurrent_admitted)}</td><td>{formatPercent(row.distribution_noncurrent_admission_rate)}</td><td>{formatPercent(row.distribution_noncurrent_admitted_share)}</td></tr>)}</tbody></table></div>
      <p className="source-note"><strong>上榜率定義：</strong>本站此處僅指「大學分發入學非應屆錄取人數 ÷ 非應屆登記人數」，不包含繁星推薦、申請入學、特殊選才與單獨招生。資料來源：<a href="https://www.ceec.edu.tw/xmdoc?xsmsid=0J018604485538810196" target="_blank" rel="noreferrer">大考中心學測統計 ↗</a>、<a href="https://www2.uac.edu.tw/115data/115_result_presentation.pdf" target="_blank" rel="noreferrer">分發委員會 115 放榜統計 ↗</a>。</p>
    </section>
  </>;
}

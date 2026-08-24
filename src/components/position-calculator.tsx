"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { locateGrade } from "@/lib/calculations";
import { SUBJECTS, SUBJECT_LABEL, YEARS, formatNumber, formatPercent } from "@/lib/constants";
import type { ScoreBoundaryFact, ScoreDistributionFact, StandardFact, SubjectId } from "@/lib/types";

export function PositionCalculator({ distributions, boundaries, standards }: { distributions: ScoreDistributionFact[]; boundaries: ScoreBoundaryFact[]; standards: StandardFact[] }) {
  const search = useSearchParams();
  const initialYear = YEARS.includes(Number(search.get("year")) as (typeof YEARS)[number]) ? Number(search.get("year")) : 115;
  const initialSubject = SUBJECTS.some((item) => item.id === search.get("subject")) ? search.get("subject") as SubjectId : "chinese";
  const initialGrade = Math.min(15, Math.max(0, Number(search.get("grade") ?? 10) || 0));
  const [year, setYear] = useState(initialYear), [subject, setSubject] = useState(initialSubject), [grade, setGrade] = useState(initialGrade);
  const [copied, setCopied] = useState(false);
  const setQuery = (key: string, value: string) => { const url = new URL(window.location.href); url.searchParams.delete("grade"); url.searchParams.set(key,value); window.history.replaceState(null, "", url); };
  const distribution = distributions.find((row) => row.academic_year === year && row.subject_id === subject && row.grade === grade)!;
  const subjectStandards = standards.filter((row) => row.academic_year === year && row.subject_id === subject);
  const boundary = boundaries.find((row) => row.academic_year === year && row.subject_id === subject && row.grade === grade)!;
  const result = useMemo(() => locateGrade(distribution, subjectStandards), [distribution, subjectStandards]);
  const share = async () => {
    const url = new URL(window.location.href); url.searchParams.set("year",String(year)); url.searchParams.set("subject",subject); url.searchParams.set("grade",String(grade));
    await navigator.clipboard.writeText(`${year} 學測${SUBJECT_LABEL[subject]} ${grade} 級分：PR 約 ${result.prLower.toFixed(2)}–${result.prUpper.toFixed(2)}，位於${result.band}帶。\n${url}`);
    setCopied(true); setTimeout(()=>setCopied(false),1800);
  };

  return <div className="position-layout">
    <form className="score-form" onSubmit={(event)=>event.preventDefault()}>
      <h2>輸入單科成績</h2>
      <p>所有運算都在你的瀏覽器完成；本站不儲存輸入內容。</p>
      <div className="field"><label htmlFor="year">學年度</label><select id="year" value={year} onChange={(e)=>{setYear(Number(e.target.value));setQuery("year",e.target.value);}}>{YEARS.map((item)=><option key={item}>{item}</option>)}</select></div>
      <div className="field"><label htmlFor="subject">科目</label><select id="subject" value={subject} onChange={(e)=>{setSubject(e.target.value as SubjectId);setQuery("subject",e.target.value);}}>{SUBJECTS.map((item)=><option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <div className="field"><label htmlFor="grade">級分：{grade}</label><input id="grade" type="range" min="0" max="15" step="1" value={grade} onChange={(e)=>setGrade(Number(e.target.value))} /></div>
      <button className="button" type="button" onClick={share}>{copied ? "已複製摘要 ✓" : "主動產生分享摘要"}</button>
      <small style={{display:"block",marginTop:"1rem",opacity:.7}}>只有按下分享按鈕時，級分才會寫入分享網址。</small>
    </form>
    <section aria-live="polite">
      <div className="chart-header"><div><div className="eyebrow">{year} 學年度 · {SUBJECT_LABEL[subject]}</div><h2>{grade} 級分的群體位置</h2></div></div>
      <div className="position-result">
        <article className="result-card"><span>約略 PR 區間</span><strong>{result.prLower.toFixed(1)}–{result.prUpper.toFixed(1)}</strong><div className="pr-track" aria-label={`PR ${result.prLower.toFixed(1)} 至 ${result.prUpper.toFixed(1)}`}><span className="pr-range" style={{left:`${result.prLower}%`,width:`${result.prUpper-result.prLower}%`}} /></div></article>
        <article className="result-card"><span>五標位置</span><strong>{result.band}</strong><small>依當年度官方五標級分判定</small></article>
        <article className="result-card"><span>同級分人數</span><strong>{formatNumber(result.sameGradeCount)}</strong><small>占有效成績 {formatPercent(distribution.percentage)}</small></article>
        <article className="result-card"><span>原始分數區間</span><strong style={{fontSize:"clamp(1.4rem,3vw,2.5rem)"}}>{boundary.source_interval_text.replace("X", "分數")}</strong><small>保留官方開閉區間表示</small></article>
      </div>
      <div className="source-note"><strong>重要限制：</strong>同分者共享一段位置，因此以 PR 區間而非單一名次呈現。這是當年度群體統計定位，不代表校系錄取結果。累計比例可能因官方四捨五入有微小差異。</div>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>級分</th><th>人數</th><th>比例</th><th>低至高累計</th><th>高至低累計</th></tr></thead><tbody><tr><td>{grade}</td><td>{formatNumber(distribution.count)}</td><td>{formatPercent(distribution.percentage)}</td><td>{formatPercent(distribution.cumulative_low_percentage)}</td><td>{formatPercent(distribution.cumulative_high_percentage)}</td></tr></tbody></table></div>
    </section>
  </div>;
}

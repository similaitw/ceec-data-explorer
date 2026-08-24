"use client";

import { useState } from "react";
import { YEARS } from "@/lib/constants";
import type { SourceRecord } from "@/lib/types";

const CATEGORY_LABEL: Record<string,string> = { registration:"報名", absence:"缺考", score_boundary:"分數—級分", score_distribution:"級分分布", standard:"五標" };

export function SourceCatalog({ sources }: { sources: SourceRecord[] }) {
  const [query,setQuery] = useState(""), [year,setYear] = useState(0), [category,setCategory] = useState("");
  const filtered = sources.filter((source) => (!year || source.academic_year===year) && (!category || source.category===category) && (!query || `${source.title} ${source.original_filename}`.toLowerCase().includes(query.toLowerCase())));
  return <section className="section">
    <div className="section-heading"><div><span className="section-index">02 / Official source catalog</span><h2>官方來源清冊</h2></div><span>{filtered.length} / {sources.length} 份</span></div>
    <div className="filter-bar"><div className="field"><label htmlFor="source-query">搜尋標題或檔名</label><input id="source-query" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="例如：級分" /></div><div className="field"><label htmlFor="source-year">年度</label><select id="source-year" value={year} onChange={(e)=>setYear(Number(e.target.value))}><option value="0">全部</option>{YEARS.map((item)=><option key={item}>{item}</option>)}</select></div><div className="field"><label htmlFor="source-category">資料類型</label><select id="source-category" value={category} onChange={(e)=>setCategory(e.target.value)}><option value="">全部</option>{Object.entries(CATEGORY_LABEL).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div></div>
    <div className="data-table-wrap"><table className="data-table"><thead><tr><th>年度／類型</th><th>官方標題</th><th>檔名</th><th>解析</th><th>原始檔</th></tr></thead><tbody>{filtered.map((source)=><tr key={source.source_id}><td>{source.academic_year} · {CATEGORY_LABEL[source.category]}</td><td>{source.title}</td><td>{source.original_filename}</td><td><span className="status-pill">{source.parse_status}</span></td><td><a href={source.download_url} target="_blank" rel="noreferrer" style={{textDecoration:"underline"}}>Excel ↗</a></td></tr>)}</tbody></table></div>
  </section>;
}


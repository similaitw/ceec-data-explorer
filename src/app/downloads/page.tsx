import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { SourceCatalog } from "@/components/source-catalog";
import { getAllData } from "@/lib/data";

export const metadata: Metadata = { title: "資料目錄與下載" };

const datasets = [
  { code:"REGISTRATION", title:"報名與到缺考", stem:"fact_registration", rows:40, grain:"年度 × 全體／科目", description:"總報名人數，以及各科實到、缺考與衍生缺考率。" },
  { code:"DISTRIBUTION", title:"各科級分分布", stem:"fact_score_distribution", rows:480, grain:"年度 × 科目 × 級分", description:"人數、百分比與自低／高分方向的雙向累計。" },
  { code:"BOUNDARY", title:"原始分數—級分對照", stem:"fact_score_boundary", rows:480, grain:"年度 × 科目 × 級分", description:"原得總分上下界、開閉區間與官方原始文字。" },
  { code:"STANDARD", title:"五標", stem:"fact_standard", rows:150, grain:"年度 × 科目 × 標準", description:"頂標、前標、均標、後標、底標級分與累計百分比。" },
];

export default async function DownloadsPage() {
  const data = await getAllData();
  return <div className="page">
    <PageIntro eyebrow="Catalog / Reproducible" title="資料下載" description="官方原始附件與本站整理資料分開呈現；每列 processed data 都能透過 source_id 回到來源。" note={<><strong>CSV + JSON</strong>UTF-8、schema 1.0.0；適合試算表與程式分析。</>} />
    <section>
      <div className="section-heading"><div><span className="section-index">01 / Processed datasets</span><h2>本站整理資料</h2></div><a className="button secondary" href="/data/manifest.json" download>下載 manifest</a></div>
      <div className="catalog-grid">{datasets.map((dataset)=><article key={dataset.stem} className="dataset-card" data-code={dataset.code}><h3>{dataset.title}</h3><p>{dataset.description}</p><div className="dataset-meta"><span><strong>{dataset.rows}</strong>資料列</span><span><strong>111–115</strong>學年度</span><span><strong>passed</strong>品質狀態</span></div><p><small>資料粒度：{dataset.grain}</small></p><div className="downloads"><a className="button small" href={`/data/gsat/${dataset.stem}.csv`} download>CSV ↓</a><a className="button secondary small" href={`/data/gsat/${dataset.stem}.json`} download>JSON ↓</a></div></article>)}</div>
    </section>
    <SourceCatalog sources={data.sources} />
    <section className="section prose"><h2>引用建議</h2><div className="formula">資料來源：大學入學考試中心；整理：大考資料洞察 CEEC Data Explorer，資料版本 1.0.0。</div><p>正式研究請同時記錄資料集檔名、下載日期、`source_id` 與官方原始附件。原始資料的授權與定義以大考中心公告為準。</p></section>
  </div>;
}


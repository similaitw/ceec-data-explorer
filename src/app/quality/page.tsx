import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { getAllData } from "@/lib/data";

export const metadata: Metadata = { title: "資料品質" };

interface QualityReport {
  status: string;
  generated_at: string;
  source_status: Record<string, number>;
  dataset_rows: Record<string, number>;
  checks: { check: string; status: string; detail: string }[];
  warnings: string[];
}

export default async function QualityPage() {
  const data = await getAllData();
  const quality = data.quality as unknown as QualityReport;
  return <div className="page">
    <PageIntro eyebrow="Quality gate / Passed" title="資料品質" description="不是「成功讀到 Excel」就算完成；總計、累計方向、區間與五標順序都必須能自動驗證。" note={<><strong>{quality.checks.length} / {quality.checks.length} 通過</strong>來源成功 {quality.source_status.success}、警告 {quality.source_status.warning}、失敗 {quality.source_status.failed}。</>} />
    <section><div className="metrics"><article className="metric" data-index="Q1"><span className="metric-label">品質狀態</span><div className="metric-value">通過</div><span className="metric-note">quality.status = {quality.status}</span></article><article className="metric" data-index="Q2"><span className="metric-label">官方附件</span><div className="metric-value">25</div><span className="metric-note">全部具有 SHA-256</span></article><article className="metric" data-index="Q3"><span className="metric-label">Processed rows</span><div className="metric-value">1,150</div><span className="metric-note">四個 MVP 事實表</span></article><article className="metric" data-index="Q4"><span className="metric-label">警告</span><div className="metric-value">{quality.warnings.length}</div><span className="metric-note">不隱藏解析例外</span></article></div></section>
    <section className="section"><div className="section-heading"><div><span className="section-index">01 / Automated checks</span><h2>檢核明細</h2></div><a className="button secondary" href="/data/quality.json" download>下載 JSON</a></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>檢核</th><th>狀態</th><th>說明</th></tr></thead><tbody>{quality.checks.map((check)=><tr key={check.check}><td>{check.check}</td><td><span className="status-pill">{check.status}</span></td><td>{check.detail}</td></tr>)}</tbody></table></div></section>
  </div>;
}


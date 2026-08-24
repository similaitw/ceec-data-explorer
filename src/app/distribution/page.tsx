import { Suspense } from "react";
import type { Metadata } from "next";
import { DistributionExplorer } from "@/components/distribution-explorer";
import { PageIntro } from "@/components/page-intro";
import { getAllData } from "@/lib/data";

export const metadata: Metadata = { title: "級分分布探索" };

export default async function DistributionPage() {
  const data = await getAllData();
  return <div className="page">
    <PageIntro eyebrow="Distribution / 16 grades" title="級分分布" description="從 0 到 15 級分，查看每一級分有多少人、占多少比例，以及累計位置。" note={<><strong>480 筆官方統計</strong>5 年 × 6 科 × 16 級分，未以模型補值。</>} />
    <Suspense fallback={<div className="panel">正在載入分布資料…</div>}><DistributionExplorer distributions={data.distributions} standards={data.standards} sources={data.sources} /></Suspense>
  </div>;
}


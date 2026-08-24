import { Suspense } from "react";
import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { TrendsExplorer } from "@/components/trends-explorer";
import { getAllData } from "@/lib/data";

export const metadata: Metadata = { title: "歷年趨勢" };

export default async function TrendsPage() {
  const data = await getAllData();
  return <div className="page">
    <PageIntro eyebrow="Trend Atlas / 111–115" title="歷年趨勢" description="讓五標、報名與缺考率在同一制度範圍內說話；每條線都保留母群與計算方式。" note={<><strong>5 個學年度</strong>全部位於 111 新制；預設不跨制度連線。</>} />
    <Suspense fallback={<div className="panel">正在建立趨勢圖…</div>}><TrendsExplorer standards={data.standards} registration={data.registration} /></Suspense>
  </div>;
}


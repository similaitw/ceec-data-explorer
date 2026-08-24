import { Suspense } from "react";
import type { Metadata } from "next";
import { NoncurrentExplorer } from "@/components/noncurrent-explorer";
import { PageIntro } from "@/components/page-intro";
import { getAllData } from "@/lib/data";

export const metadata: Metadata = { title: "非應屆與重考觀察" };

export default async function NoncurrentPage() {
  const data = await getAllData();
  return <div className="page">
    <PageIntro
      eyebrow="Non-current candidates / 111–115"
      title="非應屆觀察"
      description="分開看學測報名與分發錄取，理解常被稱作重考生的非應屆群體。"
      note={<><strong>兩種母群</strong>學測報名者 ≠ 分發入學登記者，數字不可直接相減。</>}
    />
    <Suspense fallback={<div className="panel">正在載入非應屆統計…</div>}><NoncurrentExplorer rows={data.noncurrentPathways} /></Suspense>
  </div>;
}

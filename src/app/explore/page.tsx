import type { Metadata } from "next";
import { AdmissionExplorer } from "@/components/admission-explorer";
import { PageIntro } from "@/components/page-intro";
import { getAllData } from "@/lib/data";

export const metadata: Metadata = { title: "條件篩選與招生統計" };

export default async function ExplorePage() {
  const data = await getAllData();
  return <div className="page">
    <PageIntro
      eyebrow="Filter atlas / 111–115"
      title="條件探索"
      description="依大學、校本部地區與公私立查看分發錄取規模，再帶著年度前往成績與非應屆分析。"
      note={<><strong>官方母群分流</strong>招生條件用分發資料；級分與定位仍用大考中心全體統計。</>}
    />
    <AdmissionExplorer universities={data.universityAdmissions} groups={data.groupAdmissions} />
  </div>;
}

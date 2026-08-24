import { getAllData } from "@/lib/data";
import { formatNumber, formatPercent, STANDARD_ORDER, SUBJECT_LABEL, SUBJECTS, SUBJECT_COLORS } from "@/lib/constants";
import { FeatureIcon, SubjectIcon } from "@/components/icons";

export default async function HomePage() {
  const data = await getAllData();
  const latestYear = 115;
  const registration = data.registration.find((row) => row.academic_year === latestYear && row.group_type === "all_candidates")!;
  const englishAttendance = data.registration.find((row) => row.academic_year === latestYear && row.subject_id === "english")!;
  const standards = data.standards.filter((row) => row.academic_year === latestYear);
  const standardSubjects = [...new Set(standards.map((row) => row.subject_id))];

  return <div className="page">
    <section className="hero">
      <div>
        <div className="eyebrow reveal">公共教育資料 · 非官方整理</div>
        <h1 className="visually-hidden">大考資料洞察</h1>
        <div className="subject-showcase reveal delay-1" aria-label="學測六科資料">
          {SUBJECTS.map((item) => <div className="subject-tile" key={item.id} style={{"--subject-color":SUBJECT_COLORS[item.id]} as React.CSSProperties}><SubjectIcon subject={item.id} size={42}/><strong>{item.label}</strong></div>)}
        </div>
        <p className="hero-deck reveal delay-2">快速比較學測統計、定位成績，並回查官方資料。</p>
        <div className="hero-actions reveal delay-3">
          <a className="button" href="/distribution?year=115&subject=chinese">探索 115 級分分布 →</a>
          <a className="button secondary" href="/position">定位我的成績</a>
        </div>
      </div>
      <aside className="hero-aside reveal delay-2">
        <span className="stamp">使用簡要流程</span>
        <h3>三步開始探索</h3>
        <div className="quick-flow">
          <div className="flow-step"><span>1</span><div><strong>選年度與科目</strong><small>設定想看的範圍</small></div></div>
          <div className="flow-step"><span>2</span><div><strong>看圖表或定位</strong><small>比較趨勢與分布</small></div></div>
          <div className="flow-step"><span>3</span><div><strong>下載或查來源</strong><small>核對官方附件</small></div></div>
        </div>
      </aside>
    </section>

    <section aria-labelledby="latest-heading">
      <div className="section-heading"><div><span className="section-index">01 / 最新切片</span><h2 id="latest-heading">115 學年度，一頁掌握</h2></div><p>更新至官方 115 學年度統計附件</p></div>
      <div className="metrics">
        <article className="metric" data-index="A"><span className="metric-label">總報名人數</span><div className="metric-value">{formatNumber(registration.registered_count)}</div><span className="metric-note">全體學測報名考生</span></article>
        <article className="metric" data-index="B"><span className="metric-label">英文到考人數</span><div className="metric-value">{formatNumber(englishAttendance.attended_count ?? 0)}</div><span className="metric-note">各科報考母數不同</span></article>
        <article className="metric" data-index="C"><span className="metric-label">英文缺考率</span><div className="metric-value">{formatPercent(englishAttendance.absence_rate ?? 0)}</div><span className="metric-note">缺考 ÷（實到＋缺考）</span></article>
        <article className="metric" data-index="D"><span className="metric-label">資料品質檢核</span><div className="metric-value">124</div><span className="metric-note">全數通過 · 0 項失敗</span></article>
      </div>
    </section>

    <section className="section" aria-labelledby="standards-heading">
      <div className="section-heading"><div><span className="section-index">02 / 五標速覽</span><h2 id="standards-heading">六科的分布位置</h2></div><a className="button secondary" href="/trends">查看歷年變化 →</a></div>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>科目</th>{STANDARD_ORDER.map((name) => <th key={name}>{name}</th>)}</tr></thead><tbody>
        {standardSubjects.map((subject) => <tr key={subject}><td>{SUBJECT_LABEL[subject]}</td>{STANDARD_ORDER.map((name) => <td key={name}>{standards.find((row) => row.subject_id === subject && row.standard === name)?.grade ?? "—"}</td>)}</tr>)}
      </tbody></table></div>
      <p className="source-note"><strong>閱讀提醒：</strong>五標是當年度考生成績分布的位置指標，不等同考題絕對難度，也不是校系錄取門檻。</p>
    </section>

    <section className="section">
      <div className="section-heading"><div><span className="section-index">03</span><h2>選擇功能</h2></div></div>
      <div className="catalog-grid">
        <a className="dataset-card" data-code="COMPARE" href="/trends"><span className="feature-icon"><FeatureIcon name="trend" /></span><h3>歷年趨勢</h3><p>比較五標、報名與缺考率。</p></a>
        <a className="dataset-card" data-code="DISTRIBUTION" href="/distribution"><span className="feature-icon"><FeatureIcon name="distribution" /></span><h3>級分分布</h3><p>查看各級分人數與累計比例。</p></a>
        <a className="dataset-card" data-code="POSITION" href="/position"><span className="feature-icon"><FeatureIcon name="position" /></span><h3>成績定位</h3><p>取得 PR 區間與五標位置。</p></a>
        <a className="dataset-card" data-code="NONCURRENT" href="/noncurrent"><span className="feature-icon"><FeatureIcon name="repeaters" /></span><h3>非應屆觀察</h3><p>查看人數、占比與分發錄取率。</p></a>
        <a className="dataset-card" data-code="REPRODUCE" href="/downloads"><span className="feature-icon"><FeatureIcon name="download" /></span><h3>資料下載</h3><p>下載 CSV／JSON 或查看來源。</p></a>
      </div>
    </section>
  </div>;
}

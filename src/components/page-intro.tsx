export function PageIntro({ eyebrow, title, description, note }: { eyebrow: string; title: string; description: string; note: React.ReactNode }) {
  return <header className="page-intro reveal">
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p className="lede">{description}</p>
    </div>
    <aside className="intro-note">{note}</aside>
  </header>;
}


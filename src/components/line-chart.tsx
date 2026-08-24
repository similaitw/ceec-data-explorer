export interface LineSeries { label: string; color: string; values: { x: number; y: number }[] }

export function LineChart({ id, series, yMax = 15, yMin = 0, yTicks = [0, 3, 6, 9, 12, 15], suffix = "" }: { id: string; series: LineSeries[]; yMax?: number; yMin?: number; yTicks?: number[]; suffix?: string }) {
  const width = 900, height = 460, left = 64, right = 24, top = 30, bottom = 56;
  const years = [...new Set(series.flatMap((item) => item.values.map((point) => point.x)))].sort();
  const x = (value: number) => left + (years.indexOf(value) / Math.max(1, years.length - 1)) * (width - left - right);
  const y = (value: number) => top + ((yMax - value) / Math.max(.001, yMax - yMin)) * (height - top - bottom);
  return <svg id={id} className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${series.map((item) => item.label).join("、")}歷年折線圖`}>
    <rect width={width} height={height} rx="22" fill="#ffffff" />
    {yTicks.map((tick) => <g key={tick}><line className="chart-grid" x1={left} x2={width-right} y1={y(tick)} y2={y(tick)} /><text x={left-10} y={y(tick)+4} textAnchor="end">{tick}{suffix}</text></g>)}
    <line className="chart-axis" x1={left} x2={width-right} y1={height-bottom} y2={height-bottom} />
    {years.map((year) => <text key={year} x={x(year)} y={height-bottom+25} textAnchor="middle">{year}學年</text>)}
    {series.map((item) => {
      const points = item.values.map((point) => `${x(point.x)},${y(point.y)}`).join(" ");
      return <g key={item.label}>
        <polyline points={points} fill="none" stroke={item.color} strokeWidth="4" strokeLinejoin="round" />
        {item.values.map((point) => <g key={point.x}><circle cx={x(point.x)} cy={y(point.y)} r="6" fill="#ffffff" stroke={item.color} strokeWidth="3"><title>{item.label} {point.x}：{point.y}{suffix}</title></circle><text x={x(point.x)} y={y(point.y)-13} textAnchor="middle" fill={item.color}>{point.y}</text></g>)}
      </g>;
    })}
  </svg>;
}

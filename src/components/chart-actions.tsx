"use client";

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [keys.map(escape).join(","), ...rows.map((row) => keys.map((key) => escape(row[key])).join(","))].join("\r\n");
  saveBlob(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), filename);
}

export function ChartActions({ chartId, filename, rows }: { chartId?: string; filename: string; rows: Record<string, unknown>[] }) {
  const downloadSvg = () => {
    const svg = chartId ? document.getElementById(chartId) : null;
    if (!(svg instanceof SVGElement)) return;
    const content = new XMLSerializer().serializeToString(svg);
    saveBlob(new Blob([content], { type: "image/svg+xml" }), `${filename}.svg`);
  };
  const downloadPng = () => {
    const svg = chartId ? document.getElementById(chartId) : null;
    if (!(svg instanceof SVGElement)) return;
    const content = new XMLSerializer().serializeToString(svg);
    const image = new Image();
    const url = URL.createObjectURL(new Blob([content], { type: "image/svg+xml" }));
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1400; canvas.height = 760;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = "#f3efe4"; context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => blob && saveBlob(blob, `${filename}.png`));
      URL.revokeObjectURL(url);
    };
    image.src = url;
  };
  return <div className="chart-actions" aria-label="下載圖表與資料">
    <button className="button secondary small" onClick={() => downloadCsv(rows, `${filename}.csv`)}>CSV</button>
    {chartId && <><button className="button secondary small" onClick={downloadSvg}>SVG</button><button className="button secondary small" onClick={downloadPng}>PNG</button></>}
  </div>;
}


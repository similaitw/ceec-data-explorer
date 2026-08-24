import type { SubjectId } from "@/lib/types";

export function SubjectIcon({ subject, size = 34 }: { subject: SubjectId; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 48 48", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (subject === "chinese") return <svg {...common}><path d="M8 10c6-2 11-.8 16 3v27c-5-3.8-10-4.6-16-2V10Z"/><path d="M40 10c-6-2-11-.8-16 3v27c5-3.8 10-4.6 16-2V10Z"/><path d="M13 18h6M13 24h6"/></svg>;
  if (subject === "english") return <svg {...common}><path d="M8 10h32v23H23l-9 7v-7H8V10Z"/><path d="m17 27 5-11 5 11M19 23h6M31 17h4M31 22h4M31 27h4"/></svg>;
  if (subject === "mathematics_a") return <svg {...common}><rect x="8" y="7" width="32" height="34" rx="5"/><path d="M14 13h20v7H14zM15 27h5M17.5 24.5v5M27 25l6 6M33 25l-6 6M15 35h5M27 35h6"/></svg>;
  if (subject === "mathematics_b") return <svg {...common}><path d="M7 37h34M11 38V9"/><path d="M13 32c5-1 7-8 12-9s7 5 14-11"/><circle cx="25" cy="23" r="2.5" fill="currentColor" stroke="none"/></svg>;
  if (subject === "social_studies") return <svg {...common}><circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c5 5 7.5 10.7 7.5 17S29 36 24 41c-5-5-7.5-10.7-7.5-17S19 12 24 7Z"/><path d="M11 15h26M11 33h26"/></svg>;
  return <svg {...common}><path d="M18 7h12M21 7v12L10 37c-1 2 .5 4 3 4h22c2.5 0 4-2 3-4L27 19V7"/><path d="M15 32h18M19 27c4 2 7-2 11 0"/><circle cx="21" cy="35" r="1" fill="currentColor" stroke="none"/></svg>;
}

export type FeatureIconName = "trend" | "distribution" | "position" | "download" | "repeaters";

export function FeatureIcon({ name, size = 32 }: { name: FeatureIconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 48 48", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "trend") return <svg {...common}><path d="M8 39h32M9 38V9"/><path d="m13 31 8-9 7 5 10-14"/><circle cx="13" cy="31" r="2" fill="currentColor"/><circle cx="21" cy="22" r="2" fill="currentColor"/><circle cx="28" cy="27" r="2" fill="currentColor"/><circle cx="38" cy="13" r="2" fill="currentColor"/></svg>;
  if (name === "distribution") return <svg {...common}><path d="M8 39h32"/><rect x="11" y="26" width="6" height="13" rx="2"/><rect x="21" y="15" width="6" height="24" rx="2"/><rect x="31" y="8" width="6" height="31" rx="2"/></svg>;
  if (name === "position") return <svg {...common}><circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="2.5" fill="currentColor"/><path d="M24 4v7M44 24h-7M24 44v-7M4 24h7"/></svg>;
  if (name === "repeaters") return <svg {...common}><circle cx="18" cy="17" r="6"/><path d="M7 36c1.5-7 6-11 11-11s9.5 4 11 11"/><path d="M31 12h9v9M40 12l-8 8M40 28v8h-8M40 36l-7-7"/></svg>;
  return <svg {...common}><path d="M24 7v24M15 23l9 9 9-9"/><path d="M9 35v6h30v-6"/></svg>;
}

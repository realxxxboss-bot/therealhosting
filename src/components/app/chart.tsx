"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface ChartPoint {
  label: string;
  value: number;
}

/**
 * Single-series bar or line chart with a hover tooltip and a table view for screen readers.
 * One series, so no legend: the card title names it. Marks use the primary token.
 */
export function Chart({
  data,
  kind,
  title,
  unit = "",
  height = 180,
  format = (v: number) => v.toLocaleString("en-US"),
}: {
  data: ChartPoint[];
  kind: "bar" | "line";
  title: string;
  unit?: string;
  height?: number;
  format?: (v: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();
  const width = 600;
  const pad = { top: 12, right: 8, bottom: 22, left: 8 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...data.map((d) => d.value)) * 1.1;
  const step = innerW / Math.max(1, data.length);
  const x = (i: number) => pad.left + step * i + step / 2;
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => pad.top + innerH - f * innerH);
  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${x(data.length - 1).toFixed(1)},${pad.top + innerH} L${x(0).toFixed(1)},${pad.top + innerH} Z`;
  const active = hover !== null ? data[hover] : undefined;
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible" role="img" aria-labelledby={`${id}-cap`} onMouseLeave={() => setHover(null)}>
        {gridLines.map((gy) => (
          <line key={gy} x1={pad.left} x2={width - pad.right} y1={gy} y2={gy} className="stroke-border" strokeWidth={1} strokeDasharray="2 4" />
        ))}
        <line x1={pad.left} x2={width - pad.right} y1={pad.top + innerH} y2={pad.top + innerH} className="stroke-border" strokeWidth={1} />
        {kind === "bar"
          ? data.map((d, i) => {
              const bw = Math.max(2, step - 2);
              const top = y(d.value);
              const h = pad.top + innerH - top;
              const r = Math.min(4, bw / 2, h);
              const left = x(i) - bw / 2;
              const bottom = pad.top + innerH;
              return (
                <path
                  key={d.label}
                  d={`M${left},${bottom} V${top + r} Q${left},${top} ${left + r},${top} H${left + bw - r} Q${left + bw},${top} ${left + bw},${top + r} V${bottom} Z`}
                  className={cn("fill-primary transition-opacity", hover !== null && hover !== i && "opacity-40")}
                />
              );
            })
          : (
            <>
              <path d={areaPath} className="fill-primary/10" />
              <path d={linePath} className="fill-none stroke-primary" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {active && hover !== null ? (
                <>
                  <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} className="stroke-muted" strokeWidth={1} />
                  <circle cx={x(hover)} cy={y(active.value)} r={4.5} className="fill-primary stroke-surface" strokeWidth={2} />
                </>
              ) : null}
            </>
          )}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={`l-${d.label}`} x={x(i)} y={height - 6} textAnchor="middle" className="fill-muted text-[11px]">
              {d.label}
            </text>
          ) : null,
        )}
        {data.map((d, i) => (
          <rect key={`h-${d.label}`} x={x(i) - step / 2} y={pad.top} width={step} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {active && hover !== null ? (
        <div
          className="pointer-events-none absolute top-0 rounded-[8px] border border-border bg-surface px-2.5 py-1.5 text-xs shadow-[var(--shadow-soft)]"
          style={{ left: `clamp(0px, calc(${(x(hover) / width) * 100}% - 50px), calc(100% - 110px))` }}
        >
          <p className="text-muted">{active.label}</p>
          <p className="font-semibold text-foreground">
            {format(active.value)}
            {unit}
          </p>
        </div>
      ) : null}
      <figcaption id={`${id}-cap`} className="sr-only">
        {title}
      </figcaption>
      <details className="mt-2 text-xs text-muted">
        <summary className="cursor-pointer">Show data table</summary>
        <table className="mt-2 w-full">
          <thead>
            <tr>
              <th className="text-left font-medium">Date</th>
              <th className="text-right font-medium">{title}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <td>{d.label}</td>
                <td className="text-right">
                  {format(d.value)}
                  {unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

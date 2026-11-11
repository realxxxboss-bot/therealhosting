"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ChartPoint {
  label: string;
  value: number;
}

/**
 * Single-series bar or line chart with a hover tooltip and a table view for screen readers.
 * One series, so no legend: the card title names it. The chart is drawn at the real pixel width
 * of its container, so text and strokes never scale with the layout.
 */
export function Chart({
  data,
  kind,
  title,
  unit = "",
  height = 200,
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
  const [width, setWidth] = useState(640);
  const frame = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(240, Math.round(entry.contentRect.width)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pad = { top: 16, right: 4, bottom: 26, left: 4 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...data.map((d) => d.value)) * 1.1;
  const step = innerW / Math.max(1, data.length);
  const x = (i: number) => pad.left + step * i + step / 2;
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const baseline = pad.top + innerH;
  const ticks = [0.5, 1].map((f) => ({ y: baseline - f * innerH, value: max * f }));
  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const active = hover !== null ? data[hover] : undefined;
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(innerW / 72))));

  return (
    <figure>
      <div ref={frame} className="relative">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block max-w-full" role="img" aria-labelledby={`${id}-cap`} onMouseLeave={() => setHover(null)}>
          {ticks.map((tick) => (
            <g key={tick.y}>
              <line x1={pad.left} x2={width - pad.right} y1={tick.y} y2={tick.y} className="stroke-border" strokeWidth={1} />
              <text x={pad.left} y={tick.y - 5} className="fill-muted text-[11px] tabular-nums">
                {format(Math.round(tick.value))}
                {unit}
              </text>
            </g>
          ))}
          <line x1={pad.left} x2={width - pad.right} y1={baseline} y2={baseline} className="stroke-foreground/40" strokeWidth={1} />
          {kind === "bar" ? (
            data.map((d, i) => {
              const bw = Math.max(2, Math.min(28, step - 3));
              const top = y(d.value);
              const h = baseline - top;
              const r = Math.min(3, bw / 2, h);
              const left = x(i) - bw / 2;
              return (
                <path
                  key={d.label}
                  d={`M${left},${baseline} V${top + r} Q${left},${top} ${left + r},${top} H${left + bw - r} Q${left + bw},${top} ${left + bw},${top + r} V${baseline} Z`}
                  className={cn("fill-primary transition-opacity duration-150 dark:fill-accent", hover !== null && hover !== i && "opacity-35")}
                />
              );
            })
          ) : (
            <>
              <path d={linePath} className="fill-none stroke-primary dark:stroke-accent" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {active && hover !== null ? (
                <>
                  <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={baseline} className="stroke-foreground/30" strokeWidth={1} />
                  <circle cx={x(hover)} cy={y(active.value)} r={4.5} className="fill-primary stroke-surface dark:fill-accent" strokeWidth={2} />
                </>
              ) : null}
            </>
          )}
          {data.map((d, i) =>
            i % labelEvery === 0 ? (
              <text key={`l-${d.label}`} x={x(i)} y={height - 7} textAnchor="middle" className="fill-muted text-[11px]">
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
            className="pointer-events-none absolute top-0 rounded-[4px] border border-border bg-surface px-2.5 py-1.5 text-xs shadow-[var(--shadow-pop)]"
            style={{ left: `clamp(0px, calc(${(x(hover) / width) * 100}% - 50px), calc(100% - 110px))` }}
          >
            <p className="text-muted">{active.label}</p>
            <p className="font-semibold text-foreground tabular-nums">
              {format(active.value)}
              {unit}
            </p>
          </div>
        ) : null}
      </div>
      <figcaption id={`${id}-cap`} className="sr-only">
        {title}
      </figcaption>
      <details className="mt-3 text-xs text-muted">
        <summary className="cursor-pointer underline-offset-4 hover:underline">Show data table</summary>
        <table className="mt-2 w-full max-w-sm">
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
                <td className="text-right tabular-nums">
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

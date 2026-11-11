import type { AnalyticsAdapter, TrafficPoint } from "../types";
import { seededRandom } from "./rng";

export const mockAnalyticsAdapter: AnalyticsAdapter = {
  name: "Mock analytics",
  async traffic(siteId, { days, now }) {
    const rand = seededRandom(`traffic-${siteId}`);
    const scale = 200 + rand() * 1800;
    const points: TrafficPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 86_400_000);
      const weekday = d.getUTCDay();
      const weekendDip = weekday === 0 || weekday === 6 ? 0.7 : 1;
      const visitors = Math.round(scale * weekendDip * (0.85 + rand() * 0.3) * (1 + (days - i) / (days * 6)));
      points.push({ date: d.toISOString().slice(0, 10), visitors, bandwidthMb: Math.round(visitors * (1.6 + rand())) });
    }
    return points;
  },
};

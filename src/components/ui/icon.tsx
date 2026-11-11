import {
  BarChart3,
  Check,
  Clock,
  Database,
  Gauge,
  GitBranch,
  Globe,
  Layers,
  LifeBuoy,
  Lock,
  Mail,
  RefreshCw,
  Rocket,
  Server,
  Shield,
  Tag,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/config/marketing";

const icons: Record<IconName, LucideIcon> = {
  rocket: Rocket,
  shield: Shield,
  gauge: Gauge,
  lifebuoy: LifeBuoy,
  tag: Tag,
  refresh: RefreshCw,
  database: Database,
  globe: Globe,
  lock: Lock,
  users: Users,
  server: Server,
  clock: Clock,
  zap: Zap,
  layers: Layers,
  mail: Mail,
  git: GitBranch,
  chart: BarChart3,
  check: Check,
};

export function FeatureIcon({ name }: { name: IconName }) {
  const Icon = icons[name];
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-primary-soft text-primary">
      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

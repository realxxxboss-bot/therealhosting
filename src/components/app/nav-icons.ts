import {
  Bell,
  CreditCard,
  FileText,
  Gauge,
  Globe,
  HardDrive,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Megaphone,
  Receipt,
  ScrollText,
  Server,
  Settings,
  ShieldCheck,
  Tags,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const navIcons = {
  overview: LayoutDashboard,
  sites: Server,
  domains: Globe,
  email: Mail,
  billing: CreditCard,
  support: LifeBuoy,
  team: Users,
  notifications: Bell,
  account: Settings,
  clients: UserCog,
  fleet: Gauge,
  plans: Tags,
  invoices: Receipt,
  payments: Wallet,
  backups: HardDrive,
  methods: ShieldCheck,
  templates: FileText,
  announcements: Megaphone,
  audit: ScrollText,
} satisfies Record<string, LucideIcon>;

export type NavIcon = keyof typeof navIcons;

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
  badge?: number;
  /** Match exact path only (for the overview item). */
  exact?: boolean;
  /** Heading shown above the first item of each group (admin sidebar). */
  group?: string;
}

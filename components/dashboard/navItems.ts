import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  CalendarDays,
  BookOpen,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const DASHBOARD_NAV_ITEMS: readonly NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "To-dos", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "Expenses", href: "/dashboard/expenses", icon: Wallet },
  { label: "Important Dates", href: "/dashboard/dates", icon: CalendarDays },
  { label: "Journal", href: "/dashboard/diary", icon: BookOpen },
  { label: "Settings & Profile", href: "/dashboard/settings", icon: Settings },
];

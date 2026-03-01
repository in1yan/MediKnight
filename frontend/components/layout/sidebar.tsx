"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Activity,
  Pill,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user || pathname.startsWith("/auth")) {
    return null;
  }

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: `/dashboard/${user.role}`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    ...(user.role === "patient"
      ? [
          {
            label: "My Records",
            href: "/dashboard/patient/records",
            icon: <FileText className="h-5 w-5" />,
          },
          {
            label: "Prescriptions",
            href: "/dashboard/patient/prescriptions",
            icon: <Pill className="h-5 w-5" />,
          },
          {
            label: "Appointments",
            href: "/dashboard/patient/appointments",
            icon: <Activity className="h-5 w-5" />,
          },
        ]
      : []),
    ...(user.role === "doctor"
      ? [
          {
            label: "My Patients",
            href: "/dashboard/doctor/patients",
            icon: <Users className="h-5 w-5" />,
          },
          {
            label: "Records",
            href: "/dashboard/doctor/records",
            icon: <FileText className="h-5 w-5" />,
          },
          {
            label: "Prescriptions",
            href: "/dashboard/doctor/prescriptions",
            icon: <Pill className="h-5 w-5" />,
          },
          {
            label: "Appointments",
            href: "/dashboard/doctor/appointments",
            icon: <Activity className="h-5 w-5" />,
          },
        ]
      : []),
    ...(user.role === "nurse"
      ? [
          {
            label: "Patient Care",
            href: "/dashboard/nurse/patients",
            icon: <Users className="h-5 w-5" />,
          },
          {
            label: "Vital Signs",
            href: "/dashboard/nurse/vitals",
            icon: <Activity className="h-5 w-5" />,
          },
        ]
      : []),
    ...(user.role === "admin"
      ? [
          {
            label: "Users",
            href: "/dashboard/admin/users",
            icon: <Users className="h-5 w-5" />,
          },
          {
            label: "Audit Logs",
            href: "/dashboard/admin/audit-logs",
            icon: <BarChart3 className="h-5 w-5" />,
          },
          {
            label: "System Settings",
            href: "/dashboard/admin/settings",
            icon: <Settings className="h-5 w-5" />,
          },
        ]
      : []),
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Shield className="h-6 w-6 text-blue-600" />
          <span>MediKnight</span>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4 space-y-3">
        <Link href="/dashboard/settings">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </Link>
        <Button
          onClick={logout}
          variant="outline"
          className="w-full justify-start gap-3"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-slate-950 border border-border shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-white dark:bg-slate-950">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-950 border-r border-border shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCampaignStore } from "@/stores/campaign-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  Home,
  MessageSquare,
  Calendar,
  Map,
  BookOpen,
  Users,
  Swords,
  Bug,
  Gem,
  Scale,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sun,
  Moon,
  ImageIcon,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";
import { BackupRestoreInline } from "@/components/layout/BackupRestore";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const mounted = useMounted();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const campaigns = useCampaignStore((s) => s.campaigns);
  const activeCampaignId = useCampaignStore((s) => s.activeCampaignId);
  const setActiveCampaign = useCampaignStore((s) => s.setActiveCampaignId);

  const campaignPrefix = activeCampaignId ? `/campaign/${activeCampaignId}` : "";

  const campaignNav: NavItem[] = mounted && activeCampaignId
    ? [
        { label: "Dashboard", href: `${campaignPrefix}`, icon: Home },
        { label: "AI Chat", href: `${campaignPrefix}/chat`, icon: MessageSquare },
        { label: "Sessions", href: `${campaignPrefix}/sessions`, icon: Calendar },
        { label: "Maps", href: `${campaignPrefix}/maps`, icon: Map },
        { label: "Story Notes", href: `${campaignPrefix}/story`, icon: BookOpen },
        { label: "NPCs", href: `${campaignPrefix}/npcs`, icon: Users },
        { label: "Encounters", href: `${campaignPrefix}/encounters`, icon: Swords },
        { label: "Images", href: `${campaignPrefix}/images`, icon: ImageIcon },
      ]
    : [];

  const globalNav: NavItem[] = [
    { label: "Bestiary", href: "/bestiary", icon: Bug },
    { label: "Treasure", href: "/treasure", icon: Gem },
    { label: "Rules", href: "/rules", icon: Scale },
  ];

  const isActive = (href: string) => {
    if (href === "/" || href === campaignPrefix) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h1 className="text-lg font-bold text-primary truncate">Nimble GM</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator />

      {/* Campaign selector */}
      <div className="p-2">
        {!collapsed ? (
          <div className="space-y-1">
            <select
              value={mounted ? (activeCampaignId || "") : ""}
              onChange={(e) => setActiveCampaign(e.target.value || null)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              suppressHydrationWarning
            >
              <option value="">Select Campaign...</option>
              {mounted && campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Link href="/">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Plus className="h-3 w-3" />
                Campaigns
              </Button>
            </Link>
          </div>
        ) : (
          <Link href="/">
            <Button variant="ghost" size="icon" className="w-full">
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {/* Campaign nav */}
          {campaignNav.length > 0 && (
            <>
              {!collapsed && (
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Campaign
                </p>
              )}
              {campaignNav.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      collapsed && "justify-center px-0",
                      isActive(item.href) && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                    size={collapsed ? "icon" : "default"}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Button>
                </Link>
              ))}
            </>
          )}

          <Separator className="my-2" />

          {/* Global nav */}
          {!collapsed && (
            <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tools
            </p>
          )}
          {globalNav.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  collapsed && "justify-center px-0",
                  isActive(item.href) && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                size={collapsed ? "icon" : "default"}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <Separator />
      <div className="p-2 space-y-1">
        {/* Current user */}
        {mounted && currentUser && !collapsed && (
          <div className="px-3 py-1.5 text-xs text-muted-foreground truncate">
            Signed in as <span className="font-medium text-foreground">{currentUser}</span>
          </div>
        )}
        <BackupRestoreInline collapsed={collapsed} />
        <Separator className="my-1" />
        <Link href="/settings">
          <Button
            variant={isActive("/settings") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3",
              collapsed && "justify-center px-0"
            )}
            size={collapsed ? "icon" : "default"}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Button>
        </Link>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3",
            collapsed && "justify-center px-0"
          )}
          size={collapsed ? "icon" : "default"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
          {!collapsed && <span>{mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-destructive hover:text-destructive",
            collapsed && "justify-center px-0"
          )}
          size={collapsed ? "icon" : "default"}
          onClick={logout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </Button>
      </div>
    </aside>
  );
}

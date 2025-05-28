import { AtSign, BicepsFlexed, Bot, SquareTerminal } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const staticNavMain = [
  {
    title: "Topics",
    icon: SquareTerminal,
    url: "/dashboard/topics",
  },
  {
    title: "Rankings",
    icon: Bot,
    url: "/dashboard/rankings",
  },
  {
    title: "Competitors",
    icon: BicepsFlexed,
    disabled: true,
    url: "/dashboard/competitors",
  },
  {
    title: "Mentions",
    icon: AtSign,
    disabled: true,
    url: "/dashboard/mentions",
  },
];

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {staticNavMain.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link href={item.disabled ? "#" : item.url}>
                <item.icon />
                <span>
                  {item.title}
                  {item.disabled && (
                    <Badge
                      variant="secondary"
                      className="text-xs ml-2 text-muted-foreground"
                    >
                      Soon
                    </Badge>
                  )}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

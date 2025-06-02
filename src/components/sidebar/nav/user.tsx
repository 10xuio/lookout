import { ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUserLoading } from "./loading";
import { Suspense } from "react";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user as userSchema } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UpgradeButton } from "@/components/upgrade-button";
import { PlanType } from "@/lib/stripe/server";
import { manageSubscription } from "@/app/actions/stripe";
import { LoadingButton } from "@/components/loading-button";

async function NavUserAsync() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  // Get full user data including subscription info
  const fullUser = await db.query.user.findFirst({
    where: eq(userSchema.id, session.user.id),
  });

  if (!fullUser) return null;

  return <NavUserComp user={fullUser} />;
}

export function NavUser() {
  return (
    <Suspense fallback={<NavUserLoading />}>
      <NavUserAsync />
    </Suspense>
  );
}

export function NavUserComp({
  user,
}: {
  user: typeof userSchema.$inferSelect;
}) {
  const currentPlan: PlanType = user.plan;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.image ?? ""} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image ?? ""} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!["pro", "enterprise"].includes(currentPlan) && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem className="p-0">
                    <UpgradeButton
                      planType={currentPlan === "free" ? "basic" : "pro"}
                      size="sm"
                      variant="ghost"
                    >
                      <Sparkles className="h-4 w-4" />
                      {currentPlan === "free"
                        ? "Upgrade to Basic"
                        : "Upgrade to Pro"}
                    </UpgradeButton>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuGroup>
              <DropdownMenuItem className="p-0">
                <form action={manageSubscription} className="w-full">
                  <LoadingButton
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Manage Subscription
                  </LoadingButton>
                </form>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

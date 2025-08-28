'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Settings, LogOut, User } from "lucide-react";

import { useTheme } from "@/context/ThemeProvider"
import { useAuth } from "@/context/AuthProvider";
import { useState } from "react";
import {UserData} from "@/lib/session";

export function SiteHeader({user}: {user: UserData | undefined}) {
  const {  logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  return (
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          {/* Sidebar Toggle */}
          <SidebarTrigger className="-ml-1" />

          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

          {/* Page Title */}
          <h1 className="text-base font-medium"></h1>

          {/* Right Side Actions */}
          <div className="ml-auto flex items-center gap-2">

            {/* Theme Toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                  className="w-64"
                  align="end"
                  side="bottom"
                  sideOffset={5} // Optional: small gap from the button
              >
                <DropdownMenuLabel>Application Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Sidebar Toggle */}
                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex items-center justify-between">
                    <span>Collapse Sidebar</span>
                    <Switch
                        checked={sidebarCollapsed}
                        onCheckedChange={setSidebarCollapsed}
                    />
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                {/* Font Size */}
                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex items-center justify-between">
                    <span>Font Size</span>
                    <select
                        className="border rounded px-2 py-1 text-sm"
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value as 'sm' | 'md' | 'lg')}
                    >
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                    </select>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>


            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.name}`}
                      alt={user?.name || "User"}
                  />
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                  className="w-56"
                  align="end"
                  side="bottom"
                  sideOffset={5} // Optional gap
              >
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium">{user?.name || "User"}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </header>
  );
}

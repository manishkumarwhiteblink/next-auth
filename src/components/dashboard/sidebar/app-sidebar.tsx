"use client"

import * as React from "react"
import * as TablerIcons from "@tabler/icons-react"

import { NavDocuments } from "@/components/dashboard/sidebar/sidebarMenu/nav-documents"
import { NavMain } from "@/components/dashboard/sidebar/sidebarMenu/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavData {
  navMain: Array<{ title: string; url: string; icon: string }>
  documents: Array<{ name: string; url: string; icon: string }>
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navData: NavData,
  appName?: string
}

export function AppSidebar({ navData,appName, ...props }: AppSidebarProps) {
  const getIcon = (iconName: string) => {
    const Icon = (TablerIcons as any)[iconName]
    return Icon ? <Icon className="size-5" /> : null
  }

  return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                  asChild
                  className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="#">
                  {getIcon("IconInnerShadowTop")}
                  <span className="text-base font-semibold">{appName ?? "White Blink"}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain
              items={navData.navMain.map((item) => ({
                ...item,
                icon: () => getIcon(item.icon),
              }))}
          />
          <NavDocuments
              items={navData.documents.map((doc) => ({
                ...doc,
                icon: () => getIcon(doc.icon),
              }))}
          />
        </SidebarContent>
      </Sidebar>
  )
}

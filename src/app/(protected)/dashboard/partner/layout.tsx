import {getSession} from "@/lib/session";
import {redirect} from "next/navigation";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/dashboard/sidebar/app-sidebar";
import {SiteHeader} from "@/components/dashboard/header/site-header";
import {sideBarData} from "@/config/partner.config"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession();
    const userData = session.user;
    if (!session.isAuthenticated) {
        redirect('/auth/login');
    }
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" navData={sideBarData} appName="WhiteBlink"/>
            <SidebarInset>
                <SiteHeader user={userData}/>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
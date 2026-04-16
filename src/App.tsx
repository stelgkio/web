import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { MerchantAppShell } from "@/components/merchant-app/merchant-app-shell";
import { HomeLanding } from "@/components/landing/home-landing";
import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";
import AuthCallbackPage from "@/app/auth/callback/page";
import JoinPage from "@/app/join/[token]/page";
import CompanyDashboardRedirectPage from "@/app/company/dashboard/page";
import CompanyOverviewPage from "@/app/company/overview/page";
import CompanyCampainsPage from "@/app/company/campains/page";
import CompanyProgramPage from "@/app/company/program/page";
import CompanyPartnersPage from "@/app/company/partners/page";
import CompanyIntegrationsPage from "@/app/company/integrations/page";
import CompanyInvitesPage from "@/app/company/invites/page";
import AffiliateDashboardPage from "@/app/affiliate/dashboard/page";
import CampaignsPage from "@/app/campaigns/page";
import CampaignDetailPage from "@/app/campaigns/[campaignRef]/page";
import { RequireRole } from "@/components/require-role";
import { cn } from "@/lib/utils";

export default function App() {
  const location = useLocation();
  const merchantApp = location.pathname.startsWith("/company");

  return (
    <div className={cn("flex min-h-screen flex-col antialiased", merchantApp && "min-h-0")}>
      <Providers>
        {!merchantApp ? <SiteHeader /> : null}
        <div className={cn("flex-1", merchantApp && "flex min-h-0 min-w-0 flex-col")}>
          <Routes>
            <Route path="/" element={<HomeLanding />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/join/:token" element={<JoinPage />} />
            <Route path="/company/dashboard" element={<CompanyDashboardRedirectPage />} />
            <Route
              path="/company"
              element={
                <RequireRole anyOf={["merchant"]}>
                  <MerchantAppShell />
                </RequireRole>
              }
            >
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<CompanyOverviewPage />} />
              <Route path="campains" element={<CompanyCampainsPage />} />
              <Route path="program" element={<CompanyProgramPage />} />
              <Route path="partners" element={<CompanyPartnersPage />} />
              <Route path="integrations" element={<CompanyIntegrationsPage />} />
              <Route path="invites" element={<CompanyInvitesPage />} />
            </Route>
            <Route
              path="/affiliate/dashboard"
              element={
                <RequireRole anyOf={["affiliate"]}>
                  <AffiliateDashboardPage />
                </RequireRole>
              }
            />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/:campaignRef" element={<CampaignDetailPage />} />
            <Route path="/directory" element={<Navigate to="/campaigns" replace />} />
            <Route path="/admin/invite" element={<Navigate to="/company/invites" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Providers>
    </div>
  );
}

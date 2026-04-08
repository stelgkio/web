import { Navigate, Route, Routes } from "react-router-dom";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { HomeLanding } from "@/components/landing/home-landing";
import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";
import AuthCallbackPage from "@/app/auth/callback/page";
import JoinPage from "@/app/join/[token]/page";
import CompanyDashboardPage from "@/app/company/dashboard/page";
import AffiliateDashboardPage from "@/app/affiliate/dashboard/page";
import CampaignsPage from "@/app/campaigns/page";
import CampaignDetailPage from "@/app/campaigns/[campaignRef]/page";
import AdminInvitePage from "@/app/admin/invite/page";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col antialiased">
      <Providers>
        <SiteHeader />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomeLanding />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/join/:token" element={<JoinPage />} />
            <Route path="/company/dashboard" element={<CompanyDashboardPage />} />
            <Route path="/affiliate/dashboard" element={<AffiliateDashboardPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/:campaignRef" element={<CampaignDetailPage />} />
            <Route path="/directory" element={<Navigate to="/campaigns" replace />} />
            <Route path="/admin/invite" element={<AdminInvitePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Providers>
    </div>
  );
}

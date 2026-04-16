import { MerchantActiveCampainBar } from "@/components/merchant-app/merchant-active-campain-bar";
import { CompanyCampainsClient } from "@/app/company/campains/company-campains-client";
import { CompanyDashboardClient } from "@/app/company/dashboard/company-dashboard-client";

export default function CompanyCampainsPage() {
  return (
    <div className="space-y-10">
      <MerchantActiveCampainBar />
      <CompanyCampainsClient />
      <div className="space-y-4 border-t pt-8" id="merchant-campaign-settings">
        <h2 className="text-xl font-semibold tracking-tight">Edit selected campaign</h2>
        <p className="text-sm text-muted-foreground">
          Name, story, default commission for new partners, public listing, and join policy apply to the campaign
          chosen in the bar above (or your account default if none is selected).
        </p>
        <CompanyDashboardClient view="program" hideActiveCampainBar embeddedProgram />
      </div>
    </div>
  );
}

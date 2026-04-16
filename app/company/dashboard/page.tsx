import { Navigate } from "react-router-dom";

export default function CompanyDashboardRedirectPage() {
  return <Navigate to="/company/overview" replace />;
}

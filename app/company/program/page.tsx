import { Navigate } from "react-router-dom";

/** Legacy route — all campaign management lives under /company/campains */
export default function CompanyProgramRedirectPage() {
  return <Navigate to="/company/campains" replace />;
}

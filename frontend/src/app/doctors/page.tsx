import { RoleGuard } from "@/components/auth/AuthComponents";
import { USER_ROLES } from "@/lib/constants";

export default function DoctorsPage() {
  return (
    <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Manage Doctors</h1>
        <p>
          This page is for managing doctor profiles and schedules. Only administrators can access this page.
        </p>
        {/* Add doctor management components here */}
      </div>
    </RoleGuard>
  );
}
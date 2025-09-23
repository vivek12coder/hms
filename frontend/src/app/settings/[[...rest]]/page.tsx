import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="flex justify-center items-center min-h-screen p-8">
      <UserProfile />
    </div>
  );
}
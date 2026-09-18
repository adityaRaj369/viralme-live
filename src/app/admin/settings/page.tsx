import { getSiteSettings, listFeatureFlags } from "@/modules/admin/service";
import { SettingsAdminForm } from "@/features/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, flags] = await Promise.all([getSiteSettings(), listFeatureFlags()]);
  return (
    <div>
      <h1 className="text-3xl font-bold">Settings</h1>
      <SettingsAdminForm settings={settings} flags={flags} />
    </div>
  );
}

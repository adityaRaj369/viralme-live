import { DemoSettingsForm } from "@/features/admin/demo-settings-form";
import { DEMO_AUTH } from "@/lib/auth";
import { getSiteSettings, listFeatureFlags } from "@/modules/admin/service";
import { SettingsAdminForm } from "@/features/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  if (DEMO_AUTH) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-muted">
          Rank pricing, currency, and brand labels for the public site.
        </p>
        <DemoSettingsForm />
      </div>
    );
  }

  const [settings, flags] = await Promise.all([getSiteSettings(), listFeatureFlags()]);
  return (
    <div>
      <h1 className="text-3xl font-bold">Settings</h1>
      <SettingsAdminForm settings={settings} flags={flags} />
    </div>
  );
}

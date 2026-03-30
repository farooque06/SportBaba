import { getPlatformSettings } from "@/lib/actions/admin";
import { PlatformSettingsManager } from "@/components/admin/PlatformSettingsManager";

export default async function SettingsPage() {
  const settings = await getPlatformSettings();

  return (
    <PlatformSettingsManager initialSettings={settings} />
  );
}

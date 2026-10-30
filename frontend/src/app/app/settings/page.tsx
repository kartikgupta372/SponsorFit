import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsView } from "@/components/settings/SettingsView";
import { loadProfile } from "@/lib/server/data";

export const metadata = { title: "Settings | SponsorFit" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await loadProfile();
  return (
    <div>
      <PageHeader eyebrow="Settings" title="Settings" subtitle="Your profile, current sponsors and brand-safety rules." />
      <SettingsView profile={profile} />
    </div>
  );
}

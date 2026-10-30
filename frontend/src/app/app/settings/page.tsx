import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata = { title: "Settings | SponsorFit" };

export default function SettingsPage() {
  return (
    <div>
      <PageHeader eyebrow="Settings" title="Settings" subtitle="Your profile, sponsors and brand-safety rules." />
      <SettingsView />
    </div>
  );
}

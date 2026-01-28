import { getTalentProfile } from "@/lib/actions/talent-profile";
import { SettingsClient } from "./settings-client";

export default async function TalentSettingsPage() {
    const profile = await getTalentProfile();

    return <SettingsClient profile={profile} />;
}

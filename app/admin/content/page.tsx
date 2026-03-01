import { getSiteConfig } from "@/app/actions";
import SiteConfigClient from "./SiteConfigClient";

export default async function SiteSettingsCMSPage() {
    const config = await getSiteConfig();
    return <SiteConfigClient initialConfig={config} />;
}

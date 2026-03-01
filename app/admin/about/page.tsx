import { getSiteConfig } from "@/app/actions";
import AboutConfigClient from "./AboutConfigClient";

export default async function AboutCMSPage() {
    const config = await getSiteConfig();
    return <AboutConfigClient initialConfig={config} />;
}

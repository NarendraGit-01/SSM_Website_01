import { getSiteConfig, getHeroMetrics } from "@/app/actions";
import AboutClient from "./AboutClient";

export default async function AboutPage() {
    const config = await getSiteConfig();
    const metrics = await getHeroMetrics();
    return <AboutClient config={config} metrics={metrics} />;
}

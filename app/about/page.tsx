import { getSiteConfig } from "@/app/actions";
import AboutClient from "./AboutClient";

export default async function AboutPage() {
    const config = await getSiteConfig();
    return <AboutClient config={config} />;
}

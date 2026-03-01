import { getSiteConfig } from "@/app/actions";
import ContactConfigClient from "./ContactConfigClient";

export default async function ContactCMSPage() {
    const config = await getSiteConfig();
    return <ContactConfigClient initialConfig={config} />;
}

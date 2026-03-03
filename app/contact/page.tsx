import { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";
import { getSiteConfig } from "@/app/actions";

export const metadata: Metadata = {
    title: "Contact Us | SSM",
    description: "Get in touch with Srinivasa Steel Metals for a free consultation.",
};

export default async function ContactPage() {
    const config = await getSiteConfig();
    return <ContactPageClient config={config} />;
}

import { getServices, getServiceCategories } from "@/app/actions";
import ServicesClient from "./ServicesClient";

export default async function ServicesAdminPage() {
    const services = await getServices();
    const categories = await getServiceCategories();
    return <ServicesClient initialItems={services} categories={categories} />;
}

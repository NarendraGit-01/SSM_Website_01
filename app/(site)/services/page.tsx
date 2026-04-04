import { getServices, getServiceCategories } from "@/app/actions";
import ServicesClient from "./ServicesClient";

export default async function ServicesPage() {
    const projects = await getServices();
    const categories = await getServiceCategories();
    return <ServicesClient projects={projects} categories={categories} />;
}

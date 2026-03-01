import { getServiceCategories } from "@/app/actions";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
    const categories = await getServiceCategories();
    return <CategoriesClient initialItems={categories} />;
}

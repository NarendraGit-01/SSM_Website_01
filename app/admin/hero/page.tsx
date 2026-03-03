import { getHeroSlides, getServiceCategories, getHeroMetrics } from "@/app/actions";
import HeroClient from "./HeroClient";

export default async function HeroPage() {
    const slides = await getHeroSlides();
    const categories = await getServiceCategories();
    const metrics = await getHeroMetrics();
    return <HeroClient initialSlides={slides} initialCategories={categories} initialMetrics={metrics} />;
}

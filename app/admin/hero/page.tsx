import { getHeroSlides, getServiceCategories } from "@/app/actions";
import HeroClient from "./HeroClient";

export default async function HeroPage() {
    const slides = await getHeroSlides();
    const categories = await getServiceCategories();
    return <HeroClient initialSlides={slides} initialCategories={categories} />;
}

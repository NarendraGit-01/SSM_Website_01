import { getProducts } from "@/app/actions";
import CatalogClient from "./CatalogClient";
import { Suspense } from "react";

export default async function CatalogPage() {
    const products = await getProducts();

    return (
        <Suspense fallback={<div className="min-h-screen pt-24 text-center">Loading...</div>}>
            <CatalogClient products={products} />
        </Suspense>
    );
}

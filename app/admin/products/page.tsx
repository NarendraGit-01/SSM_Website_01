import { getProducts } from "@/app/actions";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
    const products = await getProducts();
    return <ProductsClient initialItems={products} />;
}

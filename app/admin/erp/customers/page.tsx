import { getCustomers } from "../actions";
import CustomersClient from "./CustomersClient";
import { Suspense } from "react";

export default async function CustomersPage() {
    const customers = await getCustomers();
    return (
        <Suspense fallback={<div className="p-8 text-center text-forest/60">Loading customers...</div>}>
            <CustomersClient initialCustomers={customers} />
        </Suspense>
    );
}

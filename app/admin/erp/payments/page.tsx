import { getTransactions, getProjects } from "../actions";
import PaymentsClient from "./PaymentsClient";

export default async function PaymentsPage() {
    const [transactions, projects] = await Promise.all([
        getTransactions(),
        getProjects(),
    ]);
    return <PaymentsClient initialTransactions={transactions} projects={projects} />;
}

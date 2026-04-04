import { getProjects, getTransactions } from "../actions";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
    const [projects, transactions] = await Promise.all([
        getProjects(),
        getTransactions(),
    ]);
    return <ReportsClient projects={projects} transactions={transactions} />;
}

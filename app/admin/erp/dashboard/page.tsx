import { getDashboardStats } from "../actions";
import DashboardClient from "./DashboardClient";

export default async function ERPDashboardPage() {
    const stats = await getDashboardStats();
    return <DashboardClient stats={stats} />;
}

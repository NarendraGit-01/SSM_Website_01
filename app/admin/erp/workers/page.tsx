import { getWorkers } from "../actions";
import WorkersClient from "./WorkersClient";

export default async function WorkersPage() {
    const workers = await getWorkers();
    return <WorkersClient initialWorkers={workers} />;
}

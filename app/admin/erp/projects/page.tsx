import { getProjects, getCustomers, getWorkers } from "../actions";
import ProjectsClient from "./ProjectsClient";

import { Suspense } from "react";

export default async function ProjectsPage() {
    const [projects, customers, workers] = await Promise.all([
        getProjects(),
        getCustomers(),
        getWorkers(),
    ]);
    return (
        <Suspense fallback={<div className="p-8 text-center text-forest/60">Loading projects...</div>}>
            <ProjectsClient initialProjects={projects} customers={customers} workers={workers} />
        </Suspense>
    );
}

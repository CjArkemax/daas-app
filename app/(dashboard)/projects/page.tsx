import { listProjectsForUser } from "@/lib/analytics/projects";
import { requireUser } from "@/lib/auth/requireUser"
import NewProjectForm from "./_components/new-project-form";
import Link from "next/link";

export default async function ProjectsPage(){
        const user = await requireUser();
        // console.log(user)
        
        const projectList = await listProjectsForUser(user.id);
        // console.log(projectList);
        
    return(
        <div className="p-8">
            <h1 className="text-2xl mb-4">Projects</h1>
            <NewProjectForm/>
            {projectList.length === 0 ? (
                <p>No projects yet</p>
            ): (
                <ul className="space-y-2">
                    {projectList.map((p)=> (
                        <li key={p.id}>
                            <Link href={`/projects/${p.id}`}>{p.name}</Link>
                        </li>
                    ))}
                </ul>
            )
        }
        </div>
    )
}

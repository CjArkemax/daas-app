import { getProjectById } from "@/lib/analytics/projects";
import { listTasksForProject } from "@/lib/analytics/tasks";
import { requireUser } from "@/lib/auth/requireUser";
import { notFound } from "next/navigation";
import NewTaskForm from "./_components/new-task-form";
import Link from "next/link";
import { TaskCompleteButton } from "./_components/task-complete-button";
import { completeTask } from "@/actions/tasks";
import StartTimerButtons from "@/components/timer/StartTimerButtons";



export default async function ProjectPage({params}:{params:Promise<{id:string}>}){
    const user = await requireUser();
    const {id} = await params;

    const project = await getProjectById(user.id,id);
    // console.log(project);
    if(!project){
         notFound()
    }
    const taskList = await listTasksForProject(user.id ,id);
    // console.log(taskList);
    const pending = taskList.filter((t)=>(t.status === 'pending'))
    const completed = taskList.filter((t)=>(t.status === 'completed'))

    return (
        <div className="p-8">
            <Link href="/projects" className="text-sm text-muted-foreground">
            ← Back to projects
            </Link>

            <h1 className="text-2xl my-4">{project.name}</h1>

            <NewTaskForm projectId={project.id} />

            {taskList.length === 0 && <p>No tasks yet.</p>}

            {pending.length > 0 && (
            <ul className="space-y-2 mt-6">
                {pending.map((task) => (
                    <li key={task.id}>
                        <div className="flex items-center justify-between gap-2">
                        <span>{task.title}</span>
                        <div className="flex items-center gap-1">
                            <StartTimerButtons
                                projectId={project.id}
                                projectName={project.name}
                                taskId={task.id}
                                taskTitle={task.title}
                            />
                            <form action={completeTask}>
                            <input type="hidden" name="taskId" value={task.id} />
                            <TaskCompleteButton />
                            </form>
                        </div>
                        </div>
                    </li>
                    ))}
            </ul>
            )}

            {completed.length > 0 && (
            <ul className="space-y-2 mt-4">
                {completed.map((task) => (
                <li key={task.id} className="text-muted-foreground line-through">
                    {task.title}
                </li>
                ))}
            </ul>
            )}
        </div>
);

}
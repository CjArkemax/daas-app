"use client";

import { createTask } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary"  disabled={pending}>
      {pending ? "Adding..." : "Add task"}
    </Button>
  );
}


export default function NewTaskForm({projectId}:{projectId:string}){
    const [state,formAction] = useActionState(createTask,null)
    return(
        <form action={formAction}className="flex flex-col gap-2 mb-4">

            <Input
                type="hidden"
                name="projectId"
                value={projectId}
            />
            <Input
                name="title"
                placeholder="Task name"
                required
            />
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <SubmitButton/>
        </form>
    )
}
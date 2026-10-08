"use client";
import { createProject } from "@/actions/projects"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { useActionState } from "react"
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? "Creating..." : "Create"}
    </Button>
  );
}


export default function NewProjectForm(){
    const [state,formAction] = useActionState(createProject,null)
    return(
        <form action={formAction} className="flex flex-col gap-2 mb-4">
            <Input 
                name="name" 
                type="text" 
                placeholder="Project Name..." 
                required 
            />
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <SubmitButton />
        </form>
    )
}

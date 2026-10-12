"use server";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireUser } from "@/lib/auth/requireUser";
import { createProjectSchema } from "@/lib/validation/projects";
import { revalidatePath } from "next/cache";

type ActionState = {
    success: boolean;
    error: string | null;
};

export async function createProject(_prevState:unknown , formData: FormData):Promise<ActionState>{
    
    const user = await requireUser() // getting the user from client cookie
    
    const raw ={ // getting name from the form submitted by user
        name: formData.get("name")
    }
    const parsed = createProjectSchema.safeParse(raw)// validating userr's form input via Zod

    if(!parsed.success){ // parsed.success has two state true or false if true parsed.success unlocks and parsed.error is not reachable viceversa
        return {success:false,error: parsed.error.issues[0].message}
    }
    await db.insert(projects).values({
        userId:user.id,
        name: parsed.data.name,
    });

    revalidatePath('/projects');

    return{
        success:true,
        error:null
    }
    
}

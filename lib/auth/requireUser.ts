import "server-only";
import type {User} from "@supabase/supabase-js";
import {cookies} from "next/headers";
import {createServerSupabaseClient} from "@/lib/supabase/server";

export async function requireUser(): Promise<User> {

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const {data: {user}} = await supabase.auth.getUser();

    if(!user){
        throw new Error("Unauthorized");
    }

    return user;   
}